const router = require('express').Router()
const ctrl = require('./lead.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)
router.get('/', ctrl.list)
router.get('/:id', ctrl.get)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.put('/:id/status', ctrl.updateStatus)
router.patch('/:id/status', ctrl.updateStatus)
router.put('/:id/convert', ctrl.convertToOrder)
router.post('/:id/convert', ctrl.convertToOrder)
router.patch('/:id/assign', ctrl.update)

module.exports = router
