const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/report.controller')

router.use(authMiddleware)

router.get('/revenue',      ctrl.revenue)
router.get('/leads',        ctrl.leads)
router.get('/orders',       ctrl.orders)
router.get('/campaigns',    ctrl.campaigns)

module.exports = router
