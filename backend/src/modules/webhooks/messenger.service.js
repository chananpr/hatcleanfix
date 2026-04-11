const axios = require('axios')
const { User,
 
  Customer, Lead, LeadAttribution, Order, Shipment,
  ConversationThread, ConversationMessage
} = require('../../models')
const claudeService = require('./claude-messenger.service')

// Socket.IO instance for real-time events
let ioInstance = null
function setIO(io) { ioInstance = io }

// ============================================================
// สถาปัตยกรรมใหม่: Claude ตรง + Multi-Page Support
// Facebook → Backend (บันทึก DB + สกัดข้อมูล) → Claude AI → ตอบ Messenger
// ============================================================

// Facebook Messenger webhook verification (GET)
const verifyMessenger = (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }
  res.sendStatus(403)
}

// Facebook Messenger incoming event (POST)
const handleMessenger = async (req, res) => {
  const body = req.body
  if (body.object !== 'page') return res.sendStatus(404)

  // ตอบ Facebook ทันที (ต้องตอบภายใน 20 วินาที)
  res.sendStatus(200)

  for (const entry of body.entry) {
    // ดึง page_id จาก entry เพื่อหา config ของเพจนั้นๆ
    const pageId = entry.id
    const pageConfig = await claudeService.getPageConfig(pageId)

    for (const event of entry.messaging) {
      if (event.message?.is_echo) continue
      if (!event.message && !event.postback) continue

      const senderPsid = event.sender.id

      try {
        // 1) หา/สร้าง Customer
        let customer = await Customer.findOne({ where: { facebook_psid: senderPsid } })
        const isNewCustomer = !customer

        if (!customer) {
          let fbName = ''
          try {
            const profileRes = await axios.get(
              `https://graph.facebook.com/v19.0/${senderPsid}`,
              { params: { fields: 'name,profile_pic', access_token: pageConfig.access_token } }
            )
            fbName = profileRes.data.name || ''
            var fbPic = profileRes.data.profile_pic || ''
          } catch (e) {
            console.error('Failed to get FB profile:', e.message)
          }
          customer = await Customer.create({
            facebook_psid: senderPsid,
            facebook_name: fbName,
            name: fbName,
            profile_picture_url: fbPic || null,
            page_id: pageId
          })
          console.log(`[${pageConfig.page_name}] New customer: ${fbName} (${senderPsid})`)
        } else {
          // ลูกค้าเก่า — อัพเดทรูป + PSID ถ้ายังไม่มี
          const custUpdates = {}
          if (!customer.profile_picture_url || !customer.facebook_name) {
            try {
              const profileRes = await axios.get(
                `https://graph.facebook.com/v19.0/${senderPsid}`,
                { params: { fields: 'name,profile_pic', access_token: pageConfig.access_token } }
              )
              if (profileRes.data.profile_pic && !customer.profile_picture_url) {
                custUpdates.profile_picture_url = profileRes.data.profile_pic
              }
              if (profileRes.data.name && !customer.facebook_name) {
                custUpdates.facebook_name = profileRes.data.name
                if (!customer.name) custUpdates.name = profileRes.data.name
              }
            } catch (e) { /* skip */ }
          }
          // อัพเดท PSID ถ้าเปลี่ยน (เช่น ลูกค้า import มาก่อน)
          if (customer.facebook_psid !== senderPsid) {
            custUpdates.facebook_psid = senderPsid
          }
          if (Object.keys(custUpdates).length > 0) {
            await customer.update(custUpdates)
            console.log(`[${pageConfig.page_name}] Updated customer: ${customer.name} - ${Object.keys(custUpdates).join(', ')}`)
          }
        }

        // 2) หา/สร้าง Thread
        let thread = await ConversationThread.findOne({
          where: { customer_id: customer.id, platform: 'messenger' }
        })
        if (!thread) {
          thread = await ConversationThread.create({
            customer_id: customer.id, platform: 'messenger', platform_thread_id: senderPsid, page_id: pageId
          })
        }

        // 3) จำแนกประเภทข้อความ
        const messageText = event.message?.text || event.postback?.payload || ''
        let displayText = messageText
        let messageType = 'text'
        const attachments = event.message?.attachments || []
        const imageUrls = attachments.filter(a => a.type === 'image').map(a => a.payload?.url).filter(Boolean)

        if (event.message?.sticker_id) {
          const likeStickerIds = ['369239263222822', '369239343222814', '369239383222810']
          messageType = likeStickerIds.includes(String(event.message.sticker_id)) ? 'like' : 'sticker'
          if (!displayText) displayText = messageType === 'like' ? '👍' : '[สติกเกอร์]'
        } else if (imageUrls.length > 0 && !displayText) {
          messageType = 'image'
          displayText = `[ส่งรูปภาพ ${imageUrls.length} รูป]`
        } else if (attachments.length > 0 && !displayText) {
          messageType = attachments[0]?.type || 'attachment'
          displayText = `[ส่ง${messageType}]`
        }

        // 4) สกัดข้อมูลจากข้อความลูกค้า
        let extracted = {}
        if (messageText && messageText.length > 1) {
          extracted = await extractCustomerInfo(messageText)
        }

        // 5) อัพเดทข้อมูลลูกค้า realtime
        if (Object.keys(extracted).length > 0) {
          const custUpdates = {}
          if (extracted.province) custUpdates.province = extracted.province
          if (extracted.phone) custUpdates.phone = extracted.phone
          if (extracted.name) custUpdates.name = extracted.name
          if (Object.keys(custUpdates).length > 0) {
            custUpdates.page_id = pageId;
            await customer.update(custUpdates)
            console.log('Customer updated:', custUpdates)
          }

          const lead = await Lead.findOne({
            where: { customer_id: customer.id, status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment'] },
            order: [['createdAt', 'DESC']]
          })
          if (lead) {
            const leadUpdates = {}
            if (extracted.province) leadUpdates.province = extracted.province
            if (extracted.hat_count) leadUpdates.hat_count = extracted.hat_count
            if (extracted.needs_washing !== undefined) leadUpdates.needs_washing = extracted.needs_washing
            if (Object.keys(leadUpdates).length > 0) await lead.update(leadUpdates)
          }

          if (extracted.tracking_number) {
            const trackLead = await Lead.findOne({
              where: { customer_id: customer.id, status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment'] },
              order: [['createdAt', 'DESC']]
            })
            if (trackLead) {
              await trackLead.update({ status: 'awaiting_shipment' })
              const order = await Order.findOne({ where: { lead_id: trackLead.id } })
              if (order) {
                await Shipment.create({
                  order_id: order.id, direction: 'inbound',
                  courier: extracted.courier || '', tracking_number: extracted.tracking_number,
                  status: 'shipped', shipped_at: new Date()
                })
                await order.update({ status: 'inbound_shipped', inbound_tracking: extracted.tracking_number })
              }
            }
          }
        }

        // 6) บันทึกข้อความขาเข้า
        await ConversationMessage.create({
          thread_id: thread.id,
          direction: 'inbound',
          content: displayText,
          ai_extracted: { message_type: messageType, page_id: pageId, ...extracted },
          raw_payload: event
        })

        // 6.4) Update thread timestamp
        await thread.update({ updatedAt: new Date() })

        // 6.5) Emit real-time event
        if (ioInstance) {
          console.log('[Socket.IO] Emitting new_message to page_' + pageId, 'thread:', thread.id)
          ioInstance.to('page_' + pageId).emit('new_message', {
            thread_id: thread.id,
            customer_id: customer.id,
            customer_name: customer.name || customer.facebook_name || '',
            direction: 'inbound',
            content: displayText,
            page_id: pageId,
            timestamp: new Date()
          })
        }

        // 7) สร้าง Lead ถ้ายังไม่มี
        const activeLead = await Lead.findOne({
          where: { customer_id: customer.id, status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment'] }
        })
        if (!activeLead) {
          const lead = await Lead.create({ customer_id: customer.id, status: 'new', page_id: pageId })
          const referral = event.referral || event.postback?.referral || event.message?.referral || null
          if (referral) {
            const ref = referral.ref || ''
            await LeadAttribution.create({
              lead_id: lead.id,
              source_type: referral.source === 'ADS' ? 'facebook_ad' : 'direct',
              campaign_id: ref.match(/camp_([^_]+)/)?.[1] || null,
              adset_id: ref.match(/set_([^_]+)/)?.[1] || null,
              ad_id: ref.match(/ad_([^_]+)/)?.[1] || referral.ad_id || null,
              ref, first_touch_at: new Date()
            })
          }
        }

        // 8) เช็ค test_mode — ถ้าเปิดอยู่ ตอบเฉพาะ tester เท่านั้น
        let shouldReply = true
        if (pageConfig.test_mode) {
          const tester = await User.findOne({ where: { facebook_psid: senderPsid, is_tester: true } })
          if (!tester) {
            shouldReply = false
            console.log("[Test Mode] Skipping reply — sender", senderPsid, "is not a tester")
          } else {
            console.log("[Test Mode] Replying to tester:", tester.name)
          }
        }

        
        // 8.5) เช็ค Linking Code — ผูก PSID กับ User
        if (messageText && messageText.toUpperCase().startsWith("LINK-")) {
          const linkCode = messageText.trim().toUpperCase()
          const { SiteSetting } = require("../../models")
          const setting = await SiteSetting.findOne({ where: { key: "linking_codes" } })
          const codes = setting ? JSON.parse(setting.value) : {}
          
          if (codes[linkCode]) {
            const userId = codes[linkCode].user_id
            const user = await User.findByPk(userId)
            if (user) {
              await user.update({ facebook_psid: senderPsid, is_tester: true })
              console.log("[Linking] PSID", senderPsid, "linked to user", user.name)
              
              // ลบ code ที่ใช้แล้ว
              delete codes[linkCode]
              if (setting) {
                await setting.update({ value: JSON.stringify(codes) })
              }
              
              // ตอบกลับว่าเชื่อมต่อสำเร็จ
              await claudeService.sendToMessenger(senderPsid, "เชื่อมต่อสำเร็จ! คุณ" + user.name + " ถูกผูกกับระบบแล้ว — คุณเป็น Tester แล้ว", pageConfig)
              continue
            }
          } else {
            await claudeService.sendToMessenger(senderPsid, "รหัสเชื่อมต่อไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่จากหน้า Profile ในระบบ Admin", pageConfig)
            continue
          }
        }

        // 9) ใช้ Claude AI ตอบลูกค้า (ส่ง pageConfig ไปด้วย)
        if (messageText && messageText.length > 0 && messageType === 'text') {
          await claudeService.handleMessage(senderPsid, messageText, customer, thread, isNewCustomer, pageConfig)
        } else if (messageType === 'like') {
          await claudeService.sendToMessenger(senderPsid, '👍😊', pageConfig)
        } else if (messageType === 'image' && imageUrls.length > 0) {
          await claudeService.handleImageMessage(senderPsid, imageUrls, customer, thread, pageConfig)
        }

      } catch (err) {
        console.error('Error handling messenger event:', err.message)
      }
    }
  }
}

// สกัดข้อมูลจากข้อความลูกค้าด้วย OpenAI (เร็ว + ถูก)
async function extractCustomerInfo(text) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return {}

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `สกัดข้อมูลจากข้อความลูกค้าภาษาไทย ตอบเป็น JSON เท่านั้น:
{"province":null,"hat_count":null,"needs_washing":null,"phone":null,"name":null,"tracking_number":null,"courier":null}
- province: ชื่อจังหวัดภาษาไทย (แก้คำผิดให้ถูก เช่น สุราษฐานี→สุราษฎร์ธานี)
- hat_count: จำนวนหมวก (ตัวเลข)
- needs_washing: ต้องการซักไหม (true/false)
- phone: เบอร์โทร
- name: ชื่อ/ชื่อเล่นที่ลูกค้าบอก
- tracking_number: เลขพัสดุ
- courier: ขนส่ง (flash/kerry/j&t/ไปรษณีย์/etc)
ใส่ null ถ้าไม่มีข้อมูลนั้น`
          },
          { role: 'user', content: text }
        ],
        temperature: 0,
        max_tokens: 150,
        response_format: { type: 'json_object' }
      },
      {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 5000
      }
    )

    const parsed = JSON.parse(response.data.choices[0].message.content)
    return Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v !== null && v !== undefined))
  } catch (err) {
    console.error('Extract info error:', err.message)
    return {}
  }
}

// n8n endpoint (deprecated — เก็บไว้เผื่อ fallback)
const handleN8n = async (req, res) => {
  res.json({ success: true, message: 'n8n endpoint deprecated — using Claude directly' })
}

module.exports = { verifyMessenger, handleMessenger, handleN8n, setIO }
