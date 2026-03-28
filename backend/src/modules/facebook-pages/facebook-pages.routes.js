const router = require('express').Router()
const ctrl = require('./facebook-pages.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', ctrl.list)
router.get('/:id', ctrl.getOne)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)
router.post("/:id/toggle-ai", ctrl.toggleAi)
router.post("/:id/refresh-avatar", ctrl.refreshAvatar)

module.exports = router
