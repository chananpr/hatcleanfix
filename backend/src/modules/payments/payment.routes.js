const router = require('express').Router()
const ctrl = require('./payment.controller')
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)
router.get('/', ctrl.list)
router.get('/:id', ctrl.get)
router.post('/', ctrl.create)
router.put('/:id/verify', requireRole('superadmin', 'admin'), ctrl.verify)
router.patch('/:id/verify', requireRole('superadmin', 'admin'), ctrl.verify)
router.put('/:id/reject', requireRole('superadmin', 'admin'), ctrl.reject)
router.patch('/:id/reject', requireRole('superadmin', 'admin'), ctrl.reject)

module.exports = router
