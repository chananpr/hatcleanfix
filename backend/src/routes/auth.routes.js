const router = require('express').Router()

router.post('/login',   require('../controllers/auth.controller').login)
router.post('/refresh', require('../controllers/auth.controller').refresh)
router.get('/me',       require('../middlewares/auth.middleware').authMiddleware,
                        require('../controllers/auth.controller').me)

module.exports = router
