const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/dashboard.controller')

router.use(authMiddleware)

router.get('/summary',      ctrl.summary)       // KPI overview
router.get('/orders',       ctrl.orderStats)    // order by status
router.get('/revenue',      ctrl.revenue)       // revenue by period
router.get('/attribution',  ctrl.attribution)   // leads/orders by campaign

module.exports = router
