const router = require('express').Router()
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/user.controller')

router.use(authMiddleware)

router.get('/roles',  ctrl.listRoles)                              // ทุก role ดูได้
router.get('/',       requireRole('superadmin','admin'), ctrl.list)
router.get('/:id',    requireRole('superadmin','admin'), ctrl.get)
router.post('/',      requireRole('superadmin'), ctrl.create)      // สร้าง user ได้เฉพาะ superadmin
router.put('/:id',    requireRole('superadmin'), ctrl.update)
router.delete('/:id', requireRole('superadmin'), ctrl.remove)

module.exports = router
