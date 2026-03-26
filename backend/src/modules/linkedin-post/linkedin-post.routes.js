const router = require('express').Router()
const ctrl = require('./linkedin-post.controller')
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware')

// All routes require superadmin
router.use(authMiddleware)
router.use(requireRole('superadmin'))

router.post('/generate', ctrl.generate)
router.post('/generate-batch', ctrl.generateBatch)
router.get('/topics', ctrl.getTopics)

module.exports = router
