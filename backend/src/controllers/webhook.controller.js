const axios = require('axios')
const {
  Customer, Lead, LeadAttribution,
  ConversationThread, ConversationMessage
} = require('../models')

// Facebook Messenger webhook verification
const verifyMessenger = (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }
  res.sendStatus(403)
}

// Facebook Messenger incoming message (raw)
const handleMessenger = async (req, res) => {
  const body = req.body
  if (body.object !== 'page') return res.sendStatus(404)

  // ตอบ Facebook ทันที (ต้องตอบภายใน 20 วินาที)
  res.sendStatus(200)

  for (const entry of body.entry) {
    for (const event of entry.messaging) {
      if (!event.message || event.message.is_echo) continue

      const senderPsid = event.sender.id
      const messageText = event.message?.text || ''

      // Facebook Ad attribution — มาได้หลายทาง
      const referral = event.referral || event.postback?.referral || event.message?.referral || null
      const ref = referral?.ref || ''
      const adSource = referral ? {
        ref,
        source: referral.source || '',           // ADS, SHORTLINK, CUSTOMER_CHAT_PLUGIN
        type: referral.type || '',                // OPEN_THREAD
        ad_id: referral.ad_id || '',              // Facebook Ad ID ตรงๆ
        ads_context: referral.ads_context_data || null  // { ad_title, photo_url, post_id }
      } : null

      try {
        // 1) หา/สร้าง Customer จาก PSID
        let customer = await Customer.findOne({ where: { facebook_psid: senderPsid } })
        const isNewCustomer = !customer

        if (!customer) {
          // ดึงชื่อจาก Facebook Graph API
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
        }

        // 2) หา/สร้าง Conversation Thread
        let thread = await ConversationThread.findOne({
          where: { customer_id: customer.id, platform: 'messenger' }
        })
        if (!thread) {
          thread = await ConversationThread.create({
            customer_id: customer.id,
            platform: 'messenger',
            platform_thread_id: senderPsid
          })
        }

        // 3) บันทึกข้อความขาเข้า
        await ConversationMessage.create({
          thread_id: thread.id,
          direction: 'inbound',
          content: messageText,
          raw_payload: event
        })

        // 4) ดึงประวัติสนทนา (ล่าสุด 10 ข้อความ)
        const recentMessages = await ConversationMessage.findAll({
          where: { thread_id: thread.id },
          order: [['createdAt', 'DESC']],
          limit: 10
        })
        const chatHistory = recentMessages.reverse().map(m => ({
          role: m.direction === 'inbound' ? 'user' : 'assistant',
          content: m.content
        }))

        // 5) เรียก OpenAI ตอบอัตโนมัติ + สกัดข้อมูล
        const aiResult = await callOpenAI(chatHistory, messageText, isNewCustomer)

        // 6) ส่งข้อความตอบกลับทาง Messenger
        if (aiResult.reply) {
          await sendMessengerMessage(senderPsid, aiResult.reply)

          // บันทึกข้อความขาออก
          await ConversationMessage.create({
            thread_id: thread.id,
            direction: 'outbound',
            content: aiResult.reply,
            ai_extracted: aiResult.extracted
          })
        }

        // 7) สร้าง Lead ถ้าสกัดข้อมูลได้ หรือมี Ad source (ลูกค้าใหม่)
        if (aiResult.extracted && (aiResult.extracted.hat_count || aiResult.extracted.province)) {
          await saveLeadData(customer, aiResult.extracted, ref, adSource)
        } else if (isNewCustomer && adSource) {
          // ลูกค้าใหม่จาก Ad แต่ยังไม่ได้ให้ข้อมูล — สร้าง lead เปล่าเพื่อ track attribution
          await saveLeadData(customer, {}, ref, adSource)
        }

        // 8) อัพเดทข้อมูลลูกค้าถ้ามีข้อมูลใหม่
        if (aiResult.extracted) {
          const updates = {}
          if (aiResult.extracted.province && !customer.province) updates.province = aiResult.extracted.province
          if (aiResult.extracted.phone && !customer.phone) updates.phone = aiResult.extracted.phone
          if (aiResult.extracted.name && !customer.name) updates.name = aiResult.extracted.name
          if (Object.keys(updates).length > 0) {
            await customer.update(updates)
          }
        }

      } catch (err) {
        console.error('Error handling messenger event:', err)
      }
    }
  }
}

// เรียก OpenAI ChatGPT
async function callOpenAI(chatHistory, latestMessage, isNewCustomer) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set')
    return { reply: null, extracted: null }
  }

  const systemPrompt = `คุณเป็นแอดมินของร้าน HATZ - บริการซ่อม ซัก จัดทรงหมวก
หน้าที่ของคุณ:
1. ตอบลูกค้าอย่างสุภาพ เป็นกันเอง ใช้ภาษาไทย ใช้ครับ/ค่ะ
2. สอบถามข้อมูลที่จำเป็น: จำนวนหมวก, จังหวัด, ต้องการซักหรือไม่, ประเภทหมวก
3. แนะนำบริการ: ซ่อม (fix), ซัก (wash), จัดทรง (reshape)
4. แจ้งขั้นตอน: ส่งหมวกมาที่ร้าน → ร้านดำเนินการ → ส่งกลับ
5. ถ้าลูกค้าถามราคา ให้บอกว่าต้องดูสภาพหมวกก่อน เริ่มต้นที่ 250-500 บาท/ใบ

ห้าม:
- อย่ากดดันลูกค้า
- อย่าตอบยาวเกินไป (2-3 ประโยคพอ)
- อย่าตอบเรื่องที่ไม่เกี่ยวกับบริการหมวก

ตอบเป็น JSON format เสมอ:
{
  "reply": "ข้อความตอบลูกค้า",
  "extracted": {
    "hat_count": null,
    "province": null,
    "needs_washing": null,
    "phone": null,
    "name": null,
    "hat_type": null,
    "service_needed": null
  }
}

ใส่ค่าใน extracted เฉพาะที่สกัดได้จากข้อความ ถ้าไม่มีให้ใส่ null`

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const content = response.data.choices[0].message.content
    const parsed = JSON.parse(content)
    return {
      reply: parsed.reply || null,
      extracted: parsed.extracted || null
    }
  } catch (err) {
    console.error('OpenAI API error:', err.response?.data || err.message)
    return { reply: null, extracted: null }
  }
}

// ส่งข้อความกลับทาง Facebook Messenger
async function sendMessengerMessage(psid, text) {
  try {
    await axios.post(
      'https://graph.facebook.com/v19.0/me/messages',
      {
        recipient: { id: psid },
        message: { text }
      },
      {
        params: { access_token: process.env.FB_PAGE_ACCESS_TOKEN }
      }
    )
  } catch (err) {
    console.error('Failed to send Messenger message:', err.response?.data || err.message)
  }
}

// บันทึก Lead + Attribution
async function saveLeadData(customer, extracted, ref, adSource) {
  // เช็คว่ามี lead ที่ยังเปิดอยู่ไหม
  let lead = await Lead.findOne({
    where: {
      customer_id: customer.id,
      status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment']
    },
    order: [['createdAt', 'DESC']]
  })

  if (lead) {
    // อัพเดท lead ที่มีอยู่
    const updates = {}
    if (extracted.hat_count && !lead.hat_count) updates.hat_count = extracted.hat_count
    if (extracted.province && !lead.province) updates.province = extracted.province
    if (extracted.needs_washing !== null && extracted.needs_washing !== undefined) {
      updates.needs_washing = extracted.needs_washing
    }
    if (Object.keys(updates).length > 0) {
      await lead.update(updates)
    }
  } else {
    // สร้าง lead ใหม่
    lead = await Lead.create({
      customer_id: customer.id,
      status: 'new',
      hat_count: extracted.hat_count || null,
      province: extracted.province || null,
      needs_washing: extracted.needs_washing || false
    })

    // บันทึก attribution — จับได้ 2 แบบ
    const hasAttribution = ref || (adSource && (adSource.ad_id || adSource.source === 'ADS'))

    if (hasAttribution) {
      // แบบ 1: parse จาก ref string (camp_{id}_set_{id}_ad_{id})
      const campaignIdFromRef = ref ? (ref.match(/camp_([^_]+)/)?.[1] || null) : null
      const adsetIdFromRef = ref ? (ref.match(/set_([^_]+)/)?.[1] || null) : null
      const adIdFromRef = ref ? (ref.match(/ad_([^_]+)/)?.[1] || null) : null

      // แบบ 2: จาก Facebook referral object โดยตรง
      const adIdDirect = adSource?.ad_id || null
      const adTitle = adSource?.ads_context?.ad_title || null

      await LeadAttribution.create({
        lead_id: lead.id,
        source_type: adSource?.source === 'ADS' ? 'facebook_ad'
                   : adSource?.source === 'SHORTLINK' ? 'shortlink'
                   : adSource?.source === 'CUSTOMER_CHAT_PLUGIN' ? 'chat_plugin'
                   : ref ? 'facebook_ad'
                   : 'direct',
        campaign_id: campaignIdFromRef,
        adset_id: adsetIdFromRef,
        ad_id: adIdFromRef || adIdDirect,
        ad_name: adTitle,
        ref: ref || '',
        first_touch_at: new Date()
      })

      // อัพเดท source_campaign_id ใน Customer ด้วย
      if (campaignIdFromRef && !customer.source_campaign_id) {
        await customer.update({ source_campaign_id: campaignIdFromRef })
      }
    }
  }

  return lead
}

// n8n → API: ส่งข้อมูลที่ process แล้วเข้า system (fallback/manual)
const handleN8n = async (req, res) => {
  try {
    const { type, data } = req.body

    switch (type) {
      case 'new_lead': {
        let customer = await Customer.findOne({ where: { facebook_psid: data.psid } })
        if (!customer) {
          customer = await Customer.create({
            facebook_psid: data.psid,
            facebook_name: data.facebook_name || '',
            name: data.facebook_name || '',
            province: data.province || null,
            source_campaign_id: data.campaign_id || null
          })
        }

        const lead = await Lead.create({
          customer_id: customer.id,
          status: 'new',
          hat_count: data.hat_count || null,
          province: data.province || null,
          needs_washing: data.needs_washing || false
        })

        if (data.campaign_id || data.adset_id || data.ad_id) {
          await LeadAttribution.create({
            lead_id: lead.id,
            source_type: 'facebook_ad',
            campaign_id: data.campaign_id,
            adset_id: data.adset_id,
            ad_id: data.ad_id,
            ref: data.ref || '',
            first_touch_at: new Date()
          })
        }

        return res.json({ success: true, customer_id: customer.id, lead_id: lead.id })
      }

      case 'update_lead': {
        const lead = await Lead.findByPk(data.lead_id)
        if (!lead) return res.status(404).json({ message: 'Lead not found' })
        await lead.update(data)
        return res.json({ success: true })
      }

      case 'message_event': {
        // บันทึกข้อความจาก n8n
        let customer = await Customer.findOne({ where: { facebook_psid: data.psid } })
        if (!customer) return res.status(404).json({ message: 'Customer not found' })

        let thread = await ConversationThread.findOne({
          where: { customer_id: customer.id, platform: 'messenger' }
        })
        if (!thread) {
          thread = await ConversationThread.create({
            customer_id: customer.id,
            platform: 'messenger',
            platform_thread_id: data.psid
          })
        }

        await ConversationMessage.create({
          thread_id: thread.id,
          direction: data.direction || 'inbound',
          content: data.content || '',
          ai_extracted: data.extracted || null,
          raw_payload: data.raw || null
        })

        return res.json({ success: true })
      }

      default:
        return res.json({ success: true, message: 'Unknown type, logged only' })
    }
  } catch (err) {
    console.error('n8n webhook error:', err)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { verifyMessenger, handleMessenger, handleN8n }
