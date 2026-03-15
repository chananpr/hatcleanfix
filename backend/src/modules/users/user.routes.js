const router = require('express').Router()
const ctrl = require('./user.controller')
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware')

router.use(authMiddleware)
router.get('/roles', ctrl.listRoles)
router.get('/', requireRole('superadmin', 'admin'), ctrl.list)
router.get('/:id', requireRole('superadmin', 'admin'), ctrl.get)
router.post('/', requireRole('superadmin'), ctrl.create)
router.put('/:id', requireRole('superadmin'), ctrl.update)
router.delete('/:id', requireRole('superadmin'), ctrl.remove)

module.exports = router
