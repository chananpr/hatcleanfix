const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/payment.controller')

router.use(authMiddleware)

router.get('/',               ctrl.list)
router.get('/:id',            ctrl.get)
router.post('/',              ctrl.create)
router.put('/:id/verify',     ctrl.verify)      // แอดมิน verify slip

module.exports = router
