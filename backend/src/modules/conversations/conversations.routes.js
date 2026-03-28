const router = require('express').Router()
const ctrl = require('./conversations.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', ctrl.listThreads)
router.get('/:threadId/messages', ctrl.getMessages)
router.post('/:threadId/ai-reply', ctrl.aiReply)
router.post('/:threadId/manual-reply', ctrl.manualReply)

module.exports = router
