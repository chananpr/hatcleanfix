const router = require('express').Router()
const ctrl = require('./webhook.controller')

router.get('/messenger', ctrl.verifyMessenger)
router.post('/messenger', ctrl.handleMessenger)
router.post('/n8n', ctrl.handleN8n)

module.exports = router
