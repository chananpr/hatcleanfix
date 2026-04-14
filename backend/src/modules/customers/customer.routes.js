const router = require('express').Router()
const ctrl = require('./customer.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)
router.get('/', ctrl.list)
router.get('/:id', ctrl.get)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.patch('/:id', ctrl.update)

// Address CRUD
router.post('/:id/addresses', ctrl.addAddress)
router.put('/:id/addresses/:addressId', ctrl.updateAddress)
router.delete('/:id/addresses/:addressId', ctrl.deleteAddress)

module.exports = router
