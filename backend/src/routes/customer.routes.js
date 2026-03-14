const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/customer.controller')

router.use(authMiddleware)

router.get('/',     ctrl.list)
router.get('/:id',  ctrl.get)
router.post('/',    ctrl.create)
router.put('/:id',  ctrl.update)

module.exports = router
