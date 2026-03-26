const router = require('express').Router()
const ctrl = require('./order.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')
const { uploadOrderImages } = require('../../middlewares/upload.middleware')

router.use(authMiddleware)
router.get('/', ctrl.list)
router.get('/:id', ctrl.get)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.put('/:id/status', ctrl.updateStatus)
router.patch('/:id/status', ctrl.updateStatus)
router.post('/:id/images', uploadOrderImages, ctrl.uploadImages)

module.exports = router
