const router = require('express').Router()
const ctrl = require('./linkedin-post.controller')
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)
router.use(requireRole('superadmin'))

router.get('/', ctrl.list)
router.post('/generate', ctrl.generate)
router.post('/generate-batch', ctrl.generateBatch)
router.get('/topics', ctrl.getTopics)
router.patch('/:id/status', ctrl.updateStatus)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router
