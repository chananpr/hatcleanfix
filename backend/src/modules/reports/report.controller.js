const reportService = require('./report.service')
const { success, error } = require('../../utils/response')

const revenue = async (req, res) => {
  try { return success(res, await reportService.revenue(req.query)) }
  catch (err) { return error(res, err.message) }
}

const leads = async (req, res) => {
  try { return success(res, await reportService.leads(req.query)) }
  catch (err) { return error(res, err.message) }
}

const orders = async (req, res) => {
  try { return success(res, await reportService.orders(req.query)) }
  catch (err) { return error(res, err.message) }
}

const campaigns = async (req, res) => {
  try { return success(res, await reportService.campaigns(req.query)) }
  catch (err) { return error(res, err.message) }
}

module.exports = { revenue, leads, orders, campaigns }
