const router = require('express').Router()
const ctrl = require('../controllers/webhook.controller')

// Facebook Messenger webhook verification
router.get('/messenger',  ctrl.verifyMessenger)
// Facebook Messenger incoming events (จาก n8n หรือ Facebook โดยตรง)
router.post('/messenger', ctrl.handleMessenger)
// n8n → API (รับข้อมูลที่ n8n process แล้ว)
router.post('/n8n',       ctrl.handleN8n)

module.exports = router
