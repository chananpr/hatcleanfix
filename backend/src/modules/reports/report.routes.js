const router = require('express').Router()
const ctrl = require('./report.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)
router.get('/revenue', ctrl.revenue)
router.get('/leads', ctrl.leads)
router.get('/orders', ctrl.orders)
router.get('/campaigns', ctrl.campaigns)

module.exports = router
