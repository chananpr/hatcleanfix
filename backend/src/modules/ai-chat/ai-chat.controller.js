const aiChatService = require('./ai-chat.service')
const { success, error } = require('../../utils/response')

const listThreads = async (req, res) => {
  try { return success(res, await aiChatService.listThreads(req.user.id)) }
  catch (err) { return error(res, err.message) }
}

const createThread = async (req, res) => {
  try { return success(res, await aiChatService.createThread(req.user.id), 'Created', null, 201) }
  catch (err) { return error(res, err.message) }
}

const getThread = async (req, res) => {
  try {
    const thread = await aiChatService.getThread(req.params.id, req.user.id)
    if (!thread) return error(res, 'Not found', 404)
    return success(res, thread)
  } catch (err) { return error(res, err.message) }
}

const updateThread = async (req, res) => {
  try {
    const { title } = req.body
    if (!title || !title.trim()) return error(res, 'Title is required', 400)
    const thread = await aiChatService.updateThread(req.params.id, req.user.id, title.trim())
    if (!thread) return error(res, 'Not found', 404)
    return success(res, thread)
  } catch (err) { return error(res, err.message) }
}

const deleteThread = async (req, res) => {
  try {
    const ok = await aiChatService.archiveThread(req.params.id, req.user.id)
    if (!ok) return error(res, 'Not found', 404)
    return success(res, null, 'Deleted')
  } catch (err) { return error(res, err.message) }
}

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body
    if (!content || !content.trim()) return error(res, 'Content is required', 400)
    const files = req.files || []
    const result = await aiChatService.sendMessageStream(req.params.id, req.user.id, content.trim(), res, files)
    if (result === null) return error(res, 'Thread not found', 404)
  } catch (err) {
    if (!res.headersSent) {
      return error(res, err.message)
    }
    console.error('sendMessage error:', err)
  }
}

const regenerate = async (req, res) => {
  try {
    const { messageId } = req.body
    if (!messageId) return error(res, 'messageId is required', 400)
    const result = await aiChatService.regenerateStream(req.params.id, req.user.id, messageId, res)
    if (result === null) return error(res, 'Thread not found', 404)
    if (result === 'not_found') return error(res, 'Message not found', 404)
    if (result === 'no_user_message') return error(res, 'No user message found', 400)
  } catch (err) {
    if (!res.headersSent) {
      return error(res, err.message)
    }
    console.error('regenerate error:', err)
  }
}

module.exports = { listThreads, createThread, getThread, updateThread, deleteThread, sendMessage, regenerate }
