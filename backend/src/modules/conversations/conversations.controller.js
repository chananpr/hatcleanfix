const {
  sequelize, Customer, ConversationThread, ConversationMessage, FacebookPage, Lead, Order
} = require('../../models')
const claudeService = require('../webhooks/claude-messenger.service')
const { success, error } = require('../../utils/response')

// GET /api/conversations — รายการแชททั้งหมด
const listThreads = async (req, res) => {
  try {
    const where = {}
    if (req.query.page_id) {
      where.page_id = req.query.page_id
    }
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    // First sync thread updatedAt with latest message
    await sequelize.query(`
      UPDATE conversation_threads ct
      SET updatedAt = COALESCE(
        (SELECT MAX(createdAt) FROM conversation_messages WHERE thread_id = ct.id),
        ct.updatedAt
      )
      WHERE ct.page_id = :pageId
    `, { replacements: { pageId: where.page_id || '%' } })

    const { count: totalCount, rows: threads } = await ConversationThread.findAndCountAll({
      where,
      include: [{
        model: Customer,
        attributes: ['id', 'name', 'facebook_name', 'facebook_psid', 'phone', 'province', 'profile_picture_url']
      }],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    })
    
    // Add last_message for each thread
    const threadsWithLastMsg = await Promise.all(threads.map(async (t) => {
      const lastMsg = await ConversationMessage.findOne({
        where: { thread_id: t.id },
        order: [['createdAt', 'DESC']],
        attributes: ['content', 'direction', 'createdAt'],
        raw: true
      })
      const json = t.toJSON()
      json.last_message = lastMsg?.content || null
      json.last_message_at = lastMsg?.createdAt || t.updatedAt
      json.last_message_direction = lastMsg?.direction || null
      return json
    }))
    
    return success(res, { threads: threadsWithLastMsg, total: totalCount, page, hasMore: offset + limit < totalCount })
  } catch (err) {
    return error(res, err.message)
  }
}

// GET /api/conversations/:threadId/messages — ข้อความในแชท
const getMessages = async (req, res) => {
  try {
    const messages = await ConversationMessage.findAll({
      where: { thread_id: req.params.threadId },
      order: [['createdAt', 'ASC']],
      limit: 100
    })
    return success(res, messages)
  } catch (err) {
    return error(res, err.message)
  }
}

// POST /api/conversations/:threadId/ai-reply — สั่งให้ AI ตอบ
const aiReply = async (req, res) => {
  try {
    const thread = await ConversationThread.findByPk(req.params.threadId, {
      include: [{ model: Customer }]
    })
    if (!thread) return error(res, 'Thread not found', 404)

    const customer = thread.Customer
    if (!customer || !customer.facebook_psid) {
      return error(res, 'Customer has no Facebook PSID', 400)
    }

    // หาข้อความล่าสุดของลูกค้า
    const lastInbound = await ConversationMessage.findOne({
      where: { thread_id: thread.id, direction: 'inbound' },
      order: [['createdAt', 'DESC']]
    })
    if (!lastInbound) return error(res, 'No customer message to reply to', 400)

    // หา page config
    // ดู page_id จาก ai_extracted หรือใช้ default
    const extracted = lastInbound.ai_extracted || {}
    const pageId = extracted.page_id || null
    let pageConfig

    if (pageId) {
      pageConfig = await claudeService.getPageConfig(String(pageId))
    } else {
      // ใช้เพจแรกที่ active
      const page = await FacebookPage.findOne({ where: { is_active: true }, raw: true })
      pageConfig = page || { access_token: process.env.FB_PAGE_ACCESS_TOKEN, page_name: 'Default', ai_system_prompt: null }
    }

    // เรียก Claude AI ตอบ
    await claudeService.handleMessage(
      customer.facebook_psid,
      lastInbound.content,
      customer,
      thread,
      false,
      pageConfig
    )

    // ดึงข้อความ AI ที่เพิ่งตอบ
    const aiMessage = await ConversationMessage.findOne({
      where: { thread_id: thread.id, direction: 'outbound' },
      order: [['createdAt', 'DESC']]
    })

    return success(res, { reply: aiMessage }, 'AI replied successfully')
  } catch (err) {
    console.error('[AI Reply Error]', err.message)
    return error(res, err.message)
  }
}

// POST /api/conversations/:threadId/manual-reply — admin พิมพ์ตอบเอง
const manualReply = async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return error(res, 'Message is required', 400)

    const thread = await ConversationThread.findByPk(req.params.threadId, {
      include: [{ model: Customer }]
    })
    if (!thread) return error(res, 'Thread not found', 404)

    const customer = thread.Customer
    if (!customer || !customer.facebook_psid) {
      return error(res, 'Customer has no Facebook PSID', 400)
    }

    // หา page config
    const lastMsg = await ConversationMessage.findOne({
      where: { thread_id: thread.id },
      order: [['createdAt', 'DESC']]
    })
    const pageId = lastMsg?.ai_extracted?.page_id || null
    let accessToken = process.env.FB_PAGE_ACCESS_TOKEN

    if (pageId) {
      const pageConfig = await claudeService.getPageConfig(String(pageId))
      accessToken = pageConfig.access_token
    }

    // ส่งข้อความไป Messenger
    await claudeService.sendToMessenger(customer.facebook_psid, message, accessToken)

    // บันทึกลง DB
    const outMsg = await ConversationMessage.create({
      thread_id: thread.id,
      direction: 'outbound',
      content: message
    })

    return success(res, outMsg, 'Message sent')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { listThreads, getMessages, aiReply, manualReply }
