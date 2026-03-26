const router = require('express').Router()
const ctrl = require('./n8n.controller')
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware')

router.use(authMiddleware, requireRole('superadmin', 'admin'))

router.get('/status',       ctrl.getStatus)
router.get('/workflows',    ctrl.getWorkflows)
router.get('/credentials',  ctrl.getCredentials)
router.get('/executions',   ctrl.getExecutions)

module.exports = router
