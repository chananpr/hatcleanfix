const axios = require('axios')
const { User,
 
  Customer, Lead, LeadAttribution, Order, OrderImage, Shipment,
  ConversationThread, ConversationMessage
} = require('../../models')
const claudeService = require('./claude-messenger.service')

// Socket.IO instance for real-time events
let ioInstance = null
function setIO(io) { ioInstance = io }

// Download image from Facebook CDN and upload to S3
async function downloadAndUploadImage(url, folder) {
  try {
    const { s3Client, S3_BUCKET, getPublicUrl } = require('../../config/s3')
    const { PutObjectCommand } = require('@aws-sdk/client-s3')
    const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 })
    const ext = '.jpg'
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: Buffer.from(imgRes.data),
      ContentType: 'image/jpeg'
    }))
    return getPublicUrl(key)
  } catch(e) {
    console.error('[S3] Failed to upload image:', e.message)
    return url // fallback to original URL
  }
}



// Smart Thai Address Parser with fuzzy matching
function parseThaiAddress(text) {
  const result = { name: '', phone: '', address: '', subdistrict: '', district: '', province: '', postcode: '' }
  const { searchAddressByDistrict, searchAddressByAmphoe } = require('thai-address-database')
  
  // 1. Extract phone
  const phoneMatch = text.match(/0[0-9]{8,9}/)
  if (phoneMatch) { result.phone = phoneMatch[0]; text = text.replace(phoneMatch[0], '').trim() }
  
  // 2. Extract zipcode
  const zipMatch = text.match(/(?<!\d)([1-9]\d{4})(?!\d)/)
  if (zipMatch) { result.postcode = zipMatch[1]; text = text.replace(zipMatch[1], '').trim() }
  
  // 3. Extract raw keywords
  const subdMatch = text.match(/(?:แขวง|ตำบล|ต\.)\s*([ก-๙]+)/)
  if (subdMatch) result.subdistrict = subdMatch[1].trim()
  
  const distMatch = text.match(/(?:เขต|อำเภอ|อ\.)\s*([ก-๙]+)/)
  if (distMatch) result.district = distMatch[1].trim()
  
  const provMatch = text.match(/(?:จังหวัด|จ\.|กทม|กรุงเทพ)\s*([ก-๙]*)/)
  if (provMatch) result.province = provMatch[1]?.trim() || 'กรุงเทพมหานคร'
  
  // 4. Fuzzy search — try exact first, then prefix
  function fuzzyFind(subdistrict, district) {
    let results = []
    if (subdistrict) results = searchAddressByDistrict(subdistrict)
    if (results.length > 0) return results
    if (district) results = searchAddressByAmphoe(district)
    if (results.length > 0) return results
    
    // Prefix search — progressively shorter
    const tryPrefix = (text, fn) => {
      for (let len = text.length - 1; len >= 2; len--) {
        const r = fn(text.substring(0, len))
        if (r.length > 0 && r.length <= 20) return r
      }
      return []
    }
    if (subdistrict) { results = tryPrefix(subdistrict, searchAddressByDistrict); if (results.length > 0) return results }
    if (district) { results = tryPrefix(district, searchAddressByAmphoe); if (results.length > 0) return results }
    return []
  }
  
  // 5. Auto-complete from DB
  if (!result.postcode || !result.province || !result.district || !result.subdistrict) {
    const dbResults = fuzzyFind(result.subdistrict, result.district)
    if (dbResults.length > 0) {
      // Find best match — prefer results where both district AND subdistrict partially match
      let best = dbResults[0]
      if (result.district && result.subdistrict) {
        const betterMatch = dbResults.find(r => 
          r.amphoe.startsWith(result.district.substring(0, 2)) || 
          r.district.startsWith(result.subdistrict.substring(0, 2))
        )
        if (betterMatch) best = betterMatch
      }
      
      if (!result.postcode) result.postcode = String(best.zipcode)
      if (!result.province) result.province = best.province
      result.district = best.amphoe       // Use correct spelling from DB
      result.subdistrict = best.district   // Use correct spelling from DB
    }
  }
  
  // 6. Name — Thai text before first number
  const nameMatch = text.match(/^([ก-๙a-zA-Z\s\.]+?)(?=\s*\d)/)
  if (nameMatch) result.name = nameMatch[1].trim()
  
  // 7. Street address
  const addrMatch = text.match(/(\d+[\/\-\d]*\s*[^แตอจเ]*?)(?=\s*(?:แขวง|ตำบล|ต\.|เขต|อำเภอ|อ\.|จังหวัด|จ\.))/)
  if (addrMatch) result.address = addrMatch[1].replace(/\n/g, ' ').trim()
  
  return result
}

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
      // Handle echo messages (admin replies from Facebook page)
      if (event.message?.is_echo) {
        try {
          const recipientPsid = event.recipient?.id === pageId ? event.sender?.id : event.recipient?.id
          if (!recipientPsid || recipientPsid === pageId) continue
          
          const echoCustomer = await Customer.findOne({ where: { facebook_psid: recipientPsid } })
          if (echoCustomer) {
            let echoThread = await ConversationThread.findOne({
              where: { customer_id: echoCustomer.id, platform: 'messenger', page_id: pageId }
            })
            if (!echoThread) {
              echoThread = await ConversationThread.create({
                customer_id: echoCustomer.id, platform: 'messenger', platform_thread_id: recipientPsid, page_id: pageId
              })
            }
            
            const echoText = event.message?.text || '[ไฟล์แนบ]'
            const echoImgs = (event.message?.attachments || []).filter(a => a.type === 'image').map(a => a.payload?.url).filter(Boolean)
            
            // Download images to S3
            const echoS3Urls = []
            for (const url of echoImgs) {
              const s3Url = await downloadAndUploadImage(url, 'messenger-images/admin')
              echoS3Urls.push(s3Url)
            }
            
            await ConversationMessage.create({
              thread_id: echoThread.id,
              direction: 'outbound',
              content: echoImgs.length > 0 && !event.message?.text ? '[รูปภาพ ' + echoImgs.length + ' รูป]' : echoText,
              ai_extracted: echoS3Urls.length > 0 ? { image_urls: echoS3Urls } : null
            })
            
            await echoThread.update({ updatedAt: new Date() })
            
            // Emit real-time
            if (ioInstance) {
              ioInstance.to('page_' + pageId).emit('new_message', {
                thread_id: echoThread.id,
                customer_id: echoCustomer.id,
                customer_name: echoCustomer.name || echoCustomer.facebook_name || '',
                direction: 'outbound',
                content: echoText,
                page_id: pageId,
                timestamp: new Date()
              })
            }
          }
        } catch(echoErr) {
          console.error('[Echo] Error:', echoErr.message)
        }
        continue
      }
      if (!event.message && !event.postback) continue

      const senderPsid = event.sender.id

      try {
        // 1) หา/สร้าง Customer
        let customer = await Customer.findOne({ where: { facebook_psid: senderPsid } })
        const isNewCustomer = !customer

        if (!customer) {
          let fbName = ''
          let fbPic = ''
          // Method 1: Try Graph API
          try {
            const profileRes = await axios.get(
              `https://graph.facebook.com/v19.0/${senderPsid}`,
              { params: { fields: 'name,profile_pic', access_token: pageConfig.access_token } }
            )
            fbName = profileRes.data.name || ''
            fbPic = profileRes.data.profile_pic || ''
          } catch (e) {
            // Method 2: Try Conversations API — ดึง conversation ล่าสุดที่เพิ่งเปิด
            try {
              const convRes = await axios.get(
                `https://graph.facebook.com/v19.0/${pageId}/conversations`,
                { params: { access_token: pageConfig.access_token, limit: 1, fields: 'participants,updated_time' } }
              )
              const latestConv = convRes.data.data?.[0]
              if (latestConv) {
                const p = latestConv.participants?.data?.find(x => x.id !== pageId)
                if (p && p.name) {
                  fbName = p.name
                  console.log('[FB] Got name from latest conversation:', fbName)
                }
              }
            } catch (e2) {
              console.error('[FB] Both methods failed:', e.message)
            }
          }
          customer = await Customer.create({
            facebook_psid: senderPsid,
            facebook_name: fbName,
            name: fbName,
            profile_picture_url: fbPic || null,
            page_id: pageId
          })
          console.log(`[${pageConfig.page_name}] New customer: ${fbName} (${senderPsid})`)
          
          // Emit real-time new customer
          if (ioInstance) {
            ioInstance.to('page_' + pageId).emit('customer_created', {
              customer_id: customer.id,
              name: fbName,
              page_id: pageId
            })
          }
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
        }
        
        // Process images regardless of text
        if (imageUrls.length > 0) {
          messageType = displayText ? 'text_with_image' : 'image'
          // Download from Facebook CDN and upload to S3
          const s3Urls = []
          for (const fbUrl of imageUrls) {
            const s3Url = await downloadAndUploadImage(fbUrl, `messenger-images/${customer.id}`)
            s3Urls.push(s3Url)
          }
          displayText = `[รูปภาพ ${s3Urls.length} รูป]`
          // Store S3 URLs - will be added to extracted after step 4
          var _s3ImageUrls = s3Urls

          // Save as OrderImage if there is an active order
          const activeOrder = await Order.findOne({
            where: { customer_id: customer.id, status: ['draft','awaiting_inbound_shipment','inbound_shipped','received','in_progress'] },
            order: [['createdAt', 'DESC']]
          })
          if (activeOrder) {
            for (const s3Url of s3Urls) {
              await OrderImage.create({ order_id: activeOrder.id, image_type: 'before', url: s3Url, note: 'จาก Messenger' })
            }
            console.log(`[S3] Saved ${s3Urls.length} images to OrderImage for order #${activeOrder.id}`)
          }
        } else if (attachments.length > 0 && !displayText) {
          messageType = attachments[0]?.type || 'attachment'
          displayText = `[ส่ง${messageType}]`
        }

        // 4) สกัดข้อมูลจากข้อความลูกค้า
        let extracted = {}
        if (messageText && messageText.length > 1) {
          extracted = await extractCustomerInfo(messageText)
        }
        if (typeof _s3ImageUrls !== 'undefined' && _s3ImageUrls) {
          extracted.image_urls = _s3ImageUrls
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

        // 5.5) Extract Thai address from message — smart parser
        const hasAddressKeywords = messageText?.match(/แขวง|เขต|ตำบล|ต\.|อำเภอ|อ\.|จังหวัด|จ\.|หมู่|ม\.|ซอย|ซ\.|ถนน|ถ\./)
        const hasHouseNumber = messageText?.match(/\d+[\/\s]/)
        const hasZipcode = messageText?.match(/(?<!\d)[1-9]\d{4}(?!\d)/)
        const looksLikeAddress = (hasAddressKeywords && (hasHouseNumber || messageText?.length > 20)) || hasZipcode

        if (looksLikeAddress && messageText) {
          try {
            const parsed = parseThaiAddress(messageText)
            const { CustomerAddress } = require('../../models')
            
            // Check duplicate
            const existingAddr = await CustomerAddress.findOne({
              where: { customer_id: customer.id, address: messageText.trim() }
            })
            
            if (!existingAddr) {
              await CustomerAddress.create({
                customer_id: customer.id,
                name: parsed.name || customer.name || customer.facebook_name || '',
                phone: parsed.phone || customer.phone || '',
                address: parsed.address || messageText.trim(),
                postcode: parsed.postcode || '',
                province: parsed.province || '',
                district: parsed.district || '',
                subdistrict: parsed.subdistrict || '',
                is_default: true
              })
              
              // Update customer info
              const custUpdates = {}
              if (parsed.phone && !customer.phone) custUpdates.phone = parsed.phone
              if (parsed.province && !customer.province) custUpdates.province = parsed.province
              if (parsed.name && !customer.real_name) custUpdates.real_name = parsed.name
              if (Object.keys(custUpdates).length > 0) await customer.update(custUpdates)
              
              console.log('[Address] Saved:', parsed.name, parsed.district, parsed.province, parsed.postcode)
              extracted.address_saved = true
              extracted.address = parsed
              
              if (ioInstance) {
                ioInstance.to('page_' + pageId).emit('customer_updated', {
                  customer_id: customer.id,
                  type: 'address_added',
                  address: parsed,
                  page_id: pageId
                })
              }
            }
          } catch(addrErr) {
            console.error('[Address] Error:', addrErr.message)
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
          
          // Emit real-time lead created
          if (ioInstance) {
            ioInstance.to('page_' + pageId).emit('lead_created', {
              lead_id: lead.id,
              customer_id: customer.id,
              customer_name: customer.name || customer.facebook_name || '',
              page_id: pageId
            })
          }
          
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
