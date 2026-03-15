const router = require('express').Router()
const ctrl = require('./content.controller')
const { authMiddleware } = require('../../middlewares/auth.middleware')

// Public
router.get('/portfolio', ctrl.listPortfolio)
router.get('/testimonials', ctrl.listTestimonials)
router.get('/settings', ctrl.getSettings)

// Auth required
router.post('/portfolio', authMiddleware, ctrl.createPortfolio)
router.put('/portfolio/:id', authMiddleware, ctrl.updatePortfolio)
router.patch('/portfolio/:id/toggle', authMiddleware, ctrl.togglePortfolio)
router.delete('/portfolio/:id', authMiddleware, ctrl.deletePortfolio)

router.post('/testimonials', authMiddleware, ctrl.createTestimonial)
router.patch('/testimonials/:id/toggle', authMiddleware, ctrl.toggleTestimonial)
router.delete('/testimonials/:id', authMiddleware, ctrl.deleteTestimonial)

router.put('/settings', authMiddleware, ctrl.updateSettings)

module.exports = router
