const router = require('express').Router()
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware')
const { calculatePrice, getPricingRules } = require('../services/pricing.service')
const { SiteSetting, FacebookPage } = require('../models')

// Public: คำนวณราคา
router.post('/calculate', async (req, res) => {
  try {
    const result = await calculatePrice(req.body)
    res.json({ data: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Public: ดู pricing rules (accepts ?page_id=xxx)
router.get('/rules', async (req, res) => {
  try {
    const pageId = req.query.page_id
    const rules = await getPricingRules(pageId)
    res.json({ data: rules })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: แก้ pricing rules (accepts page_id in body for per-page)
router.put('/rules', authMiddleware, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const { page_id, ...rules } = req.body
    if (page_id) {
      const [count] = await FacebookPage.update(
        { pricing_rules: JSON.stringify(rules) },
        { where: { page_id } }
      )
      if (count === 0) return res.status(404).json({ message: 'Page not found' })
      return res.json({ message: 'Page pricing rules updated', data: rules })
    }
    await SiteSetting.upsert({ key: 'pricing_rules', value: JSON.stringify(req.body) })
    res.json({ message: 'Pricing rules updated', data: req.body })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
