const { calculatePrice, getPricingRules } = require('./pricing.service')
const { SiteSetting } = require('../../models')
const { success, error } = require('../../utils/response')

const calculate = async (req, res) => {
  try { return success(res, await calculatePrice(req.body)) }
  catch (err) { return error(res, err.message) }
}

const getRules = async (req, res) => {
  try { return success(res, await getPricingRules()) }
  catch (err) { return error(res, err.message) }
}

const updateRules = async (req, res) => {
  try {
    await SiteSetting.upsert({ key: 'pricing_rules', value: JSON.stringify(req.body) })
    return success(res, req.body, 'Pricing rules updated')
  } catch (err) { return error(res, err.message) }
}

module.exports = { calculate, getRules, updateRules }
