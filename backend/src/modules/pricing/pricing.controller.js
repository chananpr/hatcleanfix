const { calculatePrice, getPricingRules } = require('./pricing.service')
const { SiteSetting, FacebookPage } = require('../../models')
const { success, error } = require('../../utils/response')

const calculate = async (req, res) => {
  try { return success(res, await calculatePrice(req.body)) }
  catch (err) { return error(res, err.message) }
}

const getRules = async (req, res) => {
  try {
    const pageId = req.query.page_id
    return success(res, await getPricingRules(pageId))
  } catch (err) { return error(res, err.message) }
}

const updateRules = async (req, res) => {
  try {
    const { page_id, ...rules } = req.body
    if (page_id) {
      // Save per-page pricing
      const [count] = await FacebookPage.update(
        { pricing_rules: JSON.stringify(rules) },
        { where: { page_id } }
      )
      if (count === 0) return error(res, 'Page not found', 404)
      return success(res, rules, 'Page pricing rules updated')
    }
    // Fallback: save to global site_settings
    await SiteSetting.upsert({ key: 'pricing_rules', value: JSON.stringify(rules) })
    return success(res, rules, 'Pricing rules updated')
  } catch (err) { return error(res, err.message) }
}

module.exports = { calculate, getRules, updateRules }
