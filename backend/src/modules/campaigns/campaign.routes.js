const router = require('express').Router()
const ctrl = require('./campaign.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')
router.use(authMiddleware)
router.get('/names', ctrl.getNames)
router.put('/names', ctrl.setName)
module.exports = router
