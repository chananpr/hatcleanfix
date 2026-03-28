const Anthropic = require('@anthropic-ai/sdk')
const axios = require('axios')
const {
  Customer, Lead, Order, Shipment, FacebookPage, Product,
  ConversationThread, ConversationMessage
} = require('../../models')

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ============================================================
// Claude AI Messenger Service — Multi-Page Support
// Facebook → Backend → Claude AI → ตอบ Messenger (ตรง ไม่ผ่าน n8n)
// ============================================================

const DEFAULT_SYSTEM_PROMPT = `คุณคือ "น้องแฮทซ์" แอดมิน AI ของร้าน Hat Fix & Clean
บริการ: ซักหมวก, จัดทรงหมวก, สปาหมวก, ฆ่าเชื้อหมวก, ซ่อมหมวก

🎯 หน้าที่หลัก:
1. ต้อนรับลูกค้า ตอบคำถามเรื่องบริการ ราคา และขั้นตอน
2. สอบถามข้อมูลเพื่อบันทึก: ชื่อ, เบอร์โทร, จังหวัด, จำนวนหมวก, บริการที่ต้องการ
3. แนะนำบริการที่เหมาะสม
4. ติดตามสถานะออเดอร์ให้ลูกค้า

💰 ราคา:
- ใช้ข้อมูลราคาจากระบบที่แนบมาให้ (ตารางราคาและสินค้า)
- ถ้าลูกค้าถามราคาแน่นอน บอกว่าต้องดูสภาพหมวกก่อน แนะนำให้ส่งรูปมา
- แจ้งราคาเบื้องต้นตามตารางราคาในระบบ

📦 ขั้นตอนการใช้บริการ:
1. ลูกค้าแจ้งบริการที่ต้องการ + จำนวนหมวก
2. ส่งหมวกมาทางไปรษณีย์/ขนส่ง
3. ทีมงานตรวจสอบและแจ้งราคาจริง
4. ดำเนินการ 3-5 วันทำการ
5. ส่งกลับพร้อมรูปก่อน-หลัง

🗣️ สไตล์การตอบ:
- สุภาพ เป็นกันเอง ใช้ครับ/ค่ะ
- ตอบสั้นกระชับ ไม่เกิน 3-4 บรรทัด (เหมาะกับ Messenger)
- ใช้ emoji พอประมาณ
- ถ้าลูกค้าถามนอกเรื่อง ดึงกลับมาเรื่องบริการ

⚠️ สิ่งที่ห้ามทำ:
- ห้ามรับชำระเงินผ่านแชท
- ห้ามให้ข้อมูลส่วนตัวของลูกค้าคนอื่น
- ห้ามยืนยันราคาตายตัว (ต้องเห็นหมวกจริงก่อน)
`

// Cache page tokens (refresh every 5 minutes)
let pageCache = {}
let pageCacheTime = 0
const PAGE_CACHE_TTL = 5 * 60 * 1000

async function getPageConfig(pageId) {
  const now = Date.now()
  if (now - pageCacheTime > PAGE_CACHE_TTL) {
    const pages = await FacebookPage.findAll({ where: { is_active: true }, raw: true })
    pageCache = {}
    for (const p of pages) {
      pageCache[p.page_id] = p
    }
    pageCacheTime = now
  }

  // ถ้าเจอใน cache
  if (pageCache[pageId]) return pageCache[pageId]

  // Fallback: ใช้ token จาก .env (backward compatible)
  return {
    page_id: pageId,
    page_name: 'Default',
    access_token: process.env.FB_PAGE_ACCESS_TOKEN,
    ai_enabled: true,
    ai_persona: 'น้องแฮทซ์',
    ai_system_prompt: null
  }
}

/**
 * สร้าง context จากข้อมูลลูกค้า + ประวัติแชท
 */
async function buildCustomerContext(customer, thread, pageId) {
  let context = ''

  // ข้อมูลลูกค้า
  context += `\n--- ข้อมูลลูกค้า ---\n`
  context += `ชื่อ: ${customer.name || customer.facebook_name || 'ยังไม่ทราบ'}\n`
  context += `จังหวัด: ${customer.province || 'ยังไม่ทราบ'}\n`
  context += `เบอร์โทร: ${customer.phone || 'ยังไม่ทราบ'}\n`

  // ประวัติออเดอร์
  const orders = await Order.findAll({
    where: { customer_id: customer.id },
    order: [['createdAt', 'DESC']],
    limit: 3,
    raw: true
  })
  if (orders.length > 0) {
    context += `\nประวัติออเดอร์ (${orders.length} รายการล่าสุด):\n`
    for (const o of orders) {
      context += `- #${o.order_number} สถานะ: ${o.status} จำนวน: ${o.hat_count || '?'} ใบ\n`
    }
  } else {
    context += `\nยังไม่เคยมีออเดอร์\n`
  }

  // Lead ปัจจุบัน
  const activeLead = await Lead.findOne({
    where: { customer_id: customer.id, status: ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment'] },
    order: [['createdAt', 'DESC']],
    raw: true
  })
  if (activeLead) {
    context += `\nLead ปัจจุบัน: สถานะ ${activeLead.status}`
    if (activeLead.hat_count) context += `, จำนวน ${activeLead.hat_count} ใบ`
    if (activeLead.province) context += `, จังหวัด ${activeLead.province}`
    context += `\n`
  }

  // ประวัติแชทล่าสุด (10 ข้อความ)
  if (thread) {
    const messages = await ConversationMessage.findAll({
      where: { thread_id: thread.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
      raw: true
    })
    if (messages.length > 0) {
      context += `\n--- ประวัติแชทล่าสุด ---\n`
      for (const m of messages.reverse()) {
        const role = m.direction === 'inbound' ? 'ลูกค้า' : 'AI'
        context += `${role}: ${m.content}\n`
      }
    }
  }



  // ดึงข้อมูลราคาจากระบบ
  try {
    const { getPricingRules } = require('../../services/pricing.service')
    const pricing = await getPricingRules()
    if (pricing && pricing.tiers) {
      context += '\n--- ตารางราคา (ซ่อม/ทำความสะอาด) ---\n'
      for (const tier of pricing.tiers) {
        const maxLabel = tier.max ? tier.max : '∞'
        context += `- ${tier.min}-${maxLabel} ใบ: ${tier.price} บาท/ใบ\n`
      }
      if (pricing.washing_surcharge) {
        context += `- ค่าซักเพิ่ม: ${pricing.washing_surcharge} บาท/ใบ\n`
      }
      if (pricing.shipping_base) {
        context += `- ค่าจัดส่งพื้นฐาน: ${pricing.shipping_base} บาท\n`
      }
      context += '\n'
    }
  } catch (e) {
    // pricing service not available
  }

  // สินค้าของเพจนี้
  if (pageId) {
    const products = await Product.findAll({
      where: { page_id: pageId, is_active: true },
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      raw: true
    })
    if (products.length > 0) {
      context += '\n--- สินค้า/บริการของเพจนี้ ---\n'
      for (const p of products) {
        context += '- ' + p.name
        if (p.price > 0) context += ' ราคา ' + p.price + ' บาท'
        if (p.compare_price > 0 && p.compare_price > p.price) context += ' (จาก ' + p.compare_price + ' บาท)'
        if (p.category) context += ' [' + p.category + ']'
        if (p.description) context += ' — ' + p.description.substring(0, 80)
        context += '\n'
      }
    }
  }

  return context
}

/**
 * เรียก Claude API เพื่อตอบลูกค้า
 */
async function generateReply(messageText, customer, thread, pageConfig) {
  const context = await buildCustomerContext(customer, thread, pageConfig.page_id)
  const systemPrompt = pageConfig.ai_system_prompt || DEFAULT_SYSTEM_PROMPT
  const persona = pageConfig.ai_persona || 'น้องแฮทซ์'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt.replace(/น้องแฮทซ์/g, persona),
    messages: [
      {
        role: 'user',
        content: `${context}\n--- ข้อความใหม่จากลูกค้า ---\n${messageText}\n\nตอบลูกค้าสั้นๆ กระชับ เหมาะกับ Messenger:`
      }
    ]
  })

  return response.content[0].text
}

/**
 * ส่งข้อความกลับไป Messenger (ใช้ token ของเพจที่ถูกต้อง)
 */
async function sendToMessenger(psid, text, pageConfig) {
  const accessToken = pageConfig ? pageConfig.access_token : process.env.FB_PAGE_ACCESS_TOKEN
  const url = `https://graph.facebook.com/v19.0/me/messages`

  // แบ่งข้อความยาวเป็นหลาย bubble (Messenger limit 2000 chars)
  const chunks = []
  if (text.length <= 2000) {
    chunks.push(text)
  } else {
    const sentences = text.split(/(?<=[.!?。\n])/)
    let current = ''
    for (const s of sentences) {
      if ((current + s).length > 1900) {
        if (current) chunks.push(current.trim())
        current = s
      } else {
        current += s
      }
    }
    if (current) chunks.push(current.trim())
  }

  for (const chunk of chunks) {
    await axios.post(url, {
      recipient: { id: psid },
      message: { text: chunk }
    }, {
      params: { access_token: accessToken }
    })
  }
}

/**
 * จัดการข้อความจาก Messenger → Claude → ตอบกลับ
 */
async function handleMessage(senderPsid, messageText, customer, thread, isNewCustomer, pageConfig) {
  try {
    // ถ้า AI ปิดอยู่ → ไม่ตอบ
    if (pageConfig && !pageConfig.ai_enabled) {
      console.log(`[Claude] AI disabled for page ${pageConfig.page_name}, skipping`)
      return
    }

    // Typing indicator
    const accessToken = pageConfig ? pageConfig.access_token : process.env.FB_PAGE_ACCESS_TOKEN
    await axios.post(`https://graph.facebook.com/v19.0/me/messages`, {
      recipient: { id: senderPsid },
      sender_action: 'typing_on'
    }, {
      params: { access_token: accessToken }
    }).catch(() => {})

    // เรียก Claude
    const reply = await generateReply(messageText, customer, thread, pageConfig)

    // ส่งตอบ Messenger
    await sendToMessenger(senderPsid, reply, pageConfig)

    // บันทึกข้อความ AI ขาออก
    await ConversationMessage.create({
      thread_id: thread.id,
      direction: 'outbound',
      content: reply
    })

    console.log(`[Claude] [${pageConfig?.page_name || 'default'}] Replied to ${customer.facebook_name || senderPsid}: ${reply.substring(0, 80)}...`)

  } catch (err) {
    console.error('[Claude] Error generating reply:', err.message)
    // Fallback message
    await sendToMessenger(senderPsid, 'ขอโทษครับ ระบบขัดข้อง กรุณาทักมาใหม่อีกครั้งนะครับ 🙏', pageConfig).catch(() => {})
  }
}

// Clear cache (เรียกเมื่อ admin อัพเดท page config)
function clearPageCache() {
  pageCache = {}
  pageCacheTime = 0
}

function getDefaultPrompt() { return DEFAULT_SYSTEM_PROMPT }
module.exports = { handleMessage, generateReply, sendToMessenger, getPageConfig, clearPageCache, getDefaultPrompt }
