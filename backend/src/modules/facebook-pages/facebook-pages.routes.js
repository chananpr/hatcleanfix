const router = require('express').Router()
const ctrl = require('./facebook-pages.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', ctrl.list)
router.get('/:id', ctrl.getOne)
router.post('/', ctrl.create)
router.put('/:id', ctrl.update)
router.delete('/:id', ctrl.remove)
router.post("/:id/ai-mode", ctrl.setAiMode)

module.exports = router
