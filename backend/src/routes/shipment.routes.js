const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/shipment.controller')

router.use(authMiddleware)

router.get('/',         ctrl.list)
router.get('/:id',      ctrl.get)
router.post('/',        ctrl.create)       // สร้าง iShip shipment
router.put('/:id',      ctrl.update)
router.get('/:id/track', ctrl.track)       // ดึง tracking status

module.exports = router
