const router = require('express').Router()
const ctrl = require('./dashboard.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)
router.get('/summary', ctrl.summary)
router.get('/orders', ctrl.orderStats)
router.get('/order-stats', ctrl.orderStats)
router.get('/revenue', ctrl.revenue)
router.get('/attribution', ctrl.attribution)

module.exports = router
