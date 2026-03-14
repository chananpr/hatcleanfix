const router = require('express').Router()
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware')
const { calculatePrice, getPricingRules } = require('../services/pricing.service')
const { SiteSetting } = require('../models')

// Public: คำนวณราคา
router.post('/calculate', async (req, res) => {
  try {
    const result = await calculatePrice(req.body)
    res.json({ data: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Public: ดู pricing rules
router.get('/rules', async (req, res) => {
  try {
    const rules = await getPricingRules()
    res.json({ data: rules })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: แก้ pricing rules
router.put('/rules', authMiddleware, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    await SiteSetting.upsert({ key: 'pricing_rules', value: JSON.stringify(req.body) })
    res.json({ message: 'Pricing rules updated', data: req.body })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
