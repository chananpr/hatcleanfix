const router = require('express').Router()
const ctrl = require('./pricing.controller')
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware')

router.post('/calculate', ctrl.calculate)
router.get('/rules', ctrl.getRules)
router.get('/', ctrl.getRules)
router.put('/rules', authMiddleware, requireRole('superadmin', 'admin'), ctrl.updateRules)
router.put('/', authMiddleware, requireRole('superadmin', 'admin'), ctrl.updateRules)

module.exports = router
