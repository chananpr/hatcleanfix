const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth.middleware')
const ctrl = require('../controllers/content.controller')

// Public routes (ใช้กับ public website)
router.get('/portfolio',    ctrl.listPortfolio)
router.get('/testimonials', ctrl.listTestimonials)
router.get('/faq',          ctrl.listFaq)
router.get('/settings',     ctrl.getSettings)

// Admin routes
router.use(authMiddleware)
router.post('/portfolio',   ctrl.createPortfolio)
router.put('/portfolio/:id', ctrl.updatePortfolio)
router.post('/testimonials', ctrl.createTestimonial)
router.put('/settings',     ctrl.updateSettings)

module.exports = router
