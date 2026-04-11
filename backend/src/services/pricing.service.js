// Pricing Engine สำหรับ Hat Fix & Clean
// Admin สามารถ override ได้ผ่าน SiteSetting (global) หรือ per-page

const DEFAULT_TIERS = [
  { min: 1,   max: 10,  price: 89 },
  { min: 11,  max: 49,  price: 65 },
  { min: 50,  max: 99,  price: 45 },
  { min: 100, max: null, price: 30 }
]

const DEFAULT_WASHING_SURCHARGE = 50  // บาท/ใบ
const DEFAULT_SHIPPING_BASE     = 50  // บาท

async function getPricingRules(pageId) {
  try {
    // If pageId provided, try page-specific pricing first
    if (pageId) {
      const { FacebookPage } = require('../models')
      const page = await FacebookPage.findOne({ where: { page_id: pageId }, raw: true })
      if (page && page.pricing_rules) {
        return JSON.parse(page.pricing_rules)
      }
    }
    // Fallback to global site_settings
    const { SiteSetting } = require('../models')
    const setting = await SiteSetting.findOne({ where: { key: 'pricing_rules' } })
    if (setting) return JSON.parse(setting.value)
  } catch {}
  return {
    tiers: DEFAULT_TIERS,
    washing_surcharge: DEFAULT_WASHING_SURCHARGE,
    shipping_base: DEFAULT_SHIPPING_BASE
  }
}

async function calculatePrice({ hat_count, washing_count = 0, page_id }) {
  const rules = await getPricingRules(page_id)
  const tiers = rules.tiers || DEFAULT_TIERS

  // หา tier ที่ตรงกับจำนวนหมวก
  const tier = tiers.find(t => hat_count >= t.min && (t.max === null || hat_count <= t.max))
  const price_per_hat = tier ? tier.price : DEFAULT_TIERS[0].price

  const base_price    = hat_count * price_per_hat
  const washing_price = washing_count * (rules.washing_surcharge || DEFAULT_WASHING_SURCHARGE)
  const subtotal      = base_price + washing_price
  const shipping      = rules.shipping_base || DEFAULT_SHIPPING_BASE

  return {
    hat_count,
    washing_count,
    price_per_hat,
    base_price,
    washing_price,
    subtotal,
    shipping_cost: shipping,
    total: subtotal + shipping,
    breakdown: `${hat_count} ใบ × ${price_per_hat} บาท${washing_count > 0 ? ` + ซักน้ำ ${washing_count} ใบ × ${rules.washing_surcharge || DEFAULT_WASHING_SURCHARGE} บาท` : ''}`
  }
}

module.exports = { calculatePrice, getPricingRules }
