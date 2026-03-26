const router = require('express').Router()
const ctrl = require('./linkedin-post.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

// All routes require superadmin
router.use(authenticate)
router.use(authorize('superadmin'))

router.post('/generate', ctrl.generate)
router.post('/generate-batch', ctrl.generateBatch)
router.get('/topics', ctrl.getTopics)

module.exports = router
