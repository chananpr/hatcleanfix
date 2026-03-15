const router = require('express').Router()
const ctrl = require('./auth.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

router.post('/login', ctrl.login)
router.post('/refresh', ctrl.refresh)
router.get('/me', authMiddleware, ctrl.me)

module.exports = router
