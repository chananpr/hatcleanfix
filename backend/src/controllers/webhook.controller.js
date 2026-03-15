const axios = require('axios')
const {
  Customer, Lead, LeadAttribution, Order, Shipment,
  ConversationThread, ConversationMessage
} = require('../models')

// ============================================================
// สถาปัตยกรรม: n8n เป็นหลัก (แบบ A)
// Facebook → Backend (บันทึก DB + forward พร้อมข้อมูลลูกค้า) → n8n AI Agent → ตอบ Messenger
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

  // ตอบ Facebook ทันที
  res.sendStatus(200)

  for (const entry of body.entry) {
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
              { params: { fields: 'name', access_token: process.env.FB_PAGE_ACCESS_TOKEN } }
            )
            fbName = profileRes.data.name || ''
          } catch (e) {
            console.error('Failed to get FB profile:', e.message)
          }
          customer = await Customer.create({
            facebook_psid: senderPsid,
            facebook_name: fbName,
            name: fbName
          })
          console.log('New customer:', fbName, senderPsid)
        }

        // 2) หา/สร้าง Thread
        let thread = await ConversationThread.findOne({
          where: { customer_id: customer.id, platform: 'messenger' }
        })
        if (!thread) {
          thread = await ConversationThread.create({
            customer_id: customer.id, platform: 'messenger', platform_thread_id: senderPsid
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

        // 4) สกัดข้อมูลจากข้อความลูกค้า (จังหวัด, จำนวนหมวก, เบอร์, เลขพัสดุ)
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
            await customer.update(custUpdates)
            console.log('Customer updated:', custUpdates)
          }

          // อัพเดท Lead
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

          // บันทึกเลขพัสดุ
          if (extracted.tracking_number && lead) {
            await lead.update({ status: 'awaiting_shipment' })
            const order = await Order.findOne({ where: { lead_id: lead.id } })
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

        // 6) บันทึกข้อความขาเข้า
        await ConversationMessage.create({
          thread_id: thread.id,
          direction: 'inbound',
          content: displayText,
          ai_extracted: { message_type: messageType, ...extracted },
          raw_payload: event
        })

        // 7) ดึงข้อมูลลูกค้าเพิ่มเติม (order history)
        const orderCount = await Order.count({ where: { customer_id: customer.id } })
        const latestOrder = await Order.findOne({
          where: { customer_id: customer.id },
          order: [['createdAt', 'DESC']],
          raw: true
        })

        // 6) สร้าง Lead ถ้ายังไม่มี
        const activeLead = await Lead.findOne({
          where: { customer_id: customer.id, status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment'] }
        })
        if (!activeLead) {
          const lead = await Lead.create({ customer_id: customer.id, status: 'new' })
          // Attribution
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

        // 7) Forward ไป n8n พร้อมข้อมูลลูกค้า
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/messenger-ai'
        const enrichedBody = {
          ...body,
          _customer: {
            id: customer.id,
            psid: senderPsid,
            facebook_name: customer.facebook_name || '',
            name: customer.name || '',
            phone: extracted.phone || customer.phone || '',
            province: extracted.province || customer.province || '',
            is_new: isNewCustomer,
            order_count: orderCount,
            latest_order: latestOrder ? {
              order_number: latestOrder.order_number,
              status: latestOrder.status,
              hat_count: latestOrder.hat_count
            } : null
          }
        }

        try {
          await axios.post(n8nWebhookUrl, enrichedBody, { timeout: 15000 })
          console.log('Forwarded to n8n:', customer.facebook_name || senderPsid)
        } catch (err) {
          console.error('n8n forward failed:', err.message)
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
- province: ชื่อจังหวัดภาษาไทย (แก้คำผิดให้ถูก เช่น สุราษฐานี→สุราษฎร์ธานี, กรุงเทพครั→กรุงเทพ)
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
    // ลบ null values
    return Object.fromEntries(Object.entries(parsed).filter(([_, v]) => v !== null && v !== undefined))
  } catch (err) {
    console.error('Extract info error:', err.message)
    return {}
  }
}

// n8n → Backend: รับข้อมูลที่ n8n ประมวลผลแล้ว
const handleN8n = async (req, res) => {
  try {
    const { type, data } = req.body

    switch (type) {
      case 'save_reply': {
        // บันทึก AI reply + อัพเดทข้อมูลลูกค้า
        let customer = await Customer.findOne({ where: { facebook_psid: data.psid } })
        if (!customer) return res.status(404).json({ message: 'Customer not found' })

        // บันทึกข้อความ AI ขาออก
        let thread = await ConversationThread.findOne({
          where: { customer_id: customer.id, platform: 'messenger' }
        })
        if (thread && data.ai_reply) {
          await ConversationMessage.create({
            thread_id: thread.id, direction: 'outbound', content: data.ai_reply
          })
        }

        // อัพเดทข้อมูลลูกค้า
        const updates = {}
        if (data.province) updates.province = data.province
        if (data.phone) updates.phone = data.phone
        if (data.customer_name) updates.name = data.customer_name
        if (Object.keys(updates).length > 0) await customer.update(updates)

        // อัพเดท Lead
        if (data.province || data.hat_count) {
          const lead = await Lead.findOne({
            where: { customer_id: customer.id, status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment'] },
            order: [['createdAt', 'DESC']]
          })
          if (lead) {
            const lu = {}
            if (data.province) lu.province = data.province
            if (data.hat_count) lu.hat_count = data.hat_count
            if (data.needs_washing !== undefined) lu.needs_washing = data.needs_washing
            if (Object.keys(lu).length > 0) await lead.update(lu)
          }
        }

        // บันทึกเลขพัสดุ
        if (data.tracking_number) {
          const lead = await Lead.findOne({
            where: { customer_id: customer.id, status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment'] },
            order: [['createdAt', 'DESC']]
          })
          if (lead) {
            await lead.update({ status: 'awaiting_shipment' })
            const order = await Order.findOne({ where: { lead_id: lead.id } })
            if (order) {
              await Shipment.create({
                order_id: order.id, direction: 'inbound',
                courier: data.courier || '', tracking_number: data.tracking_number,
                status: 'shipped', shipped_at: new Date()
              })
              await order.update({ status: 'inbound_shipped', inbound_tracking: data.tracking_number })
            }
          }
        }

        return res.json({ success: true })
      }

      case 'new_lead': {
        let customer = await Customer.findOne({ where: { facebook_psid: data.psid } })
        if (!customer) {
          customer = await Customer.create({
            facebook_psid: data.psid, facebook_name: data.facebook_name || '',
            name: data.facebook_name || '', province: data.province || null
          })
        }
        const lead = await Lead.create({
          customer_id: customer.id, status: 'new',
          hat_count: data.hat_count || null, province: data.province || null
        })
        return res.json({ success: true, customer_id: customer.id, lead_id: lead.id })
      }

      case 'update_customer': {
        const customer = await Customer.findOne({ where: { facebook_psid: data.psid } })
        if (!customer) return res.status(404).json({ message: 'Customer not found' })
        const updates = {}
        if (data.province) updates.province = data.province
        if (data.phone) updates.phone = data.phone
        if (data.name) updates.name = data.name
        if (Object.keys(updates).length > 0) await customer.update(updates)
        return res.json({ success: true })
      }

      default:
        return res.json({ success: true })
    }
  } catch (err) {
    console.error('n8n webhook error:', err)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { verifyMessenger, handleMessenger, handleN8n }
