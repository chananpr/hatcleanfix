const leadService = require('./lead.service')
const { success, error, paginated } = require('../../utils/response')

const list = async (req, res) => {
  try {
    const result = await leadService.list(req.query, req.user)
    return paginated(res, result.rows, result.count, result.page, result.limit)
  } catch (err) {
    return error(res, err.message)
  }
}

const get = async (req, res) => {
  try {
    const lead = await leadService.getById(req.params.id)
    if (!lead) return error(res, 'Lead not found', 404)
    return success(res, lead)
  } catch (err) {
    return error(res, err.message)
  }
}

const create = async (req, res) => {
  try {
    const lead = await leadService.create(req.body)
    return success(res, lead, 'Lead created', null, 201)
  } catch (err) {
    return error(res, err.message)
  }
}

const update = async (req, res) => {
  try {
    const lead = await leadService.update(req.params.id, req.body)
    if (!lead) return error(res, 'Lead not found', 404)
    return success(res, lead, 'Lead updated')
  } catch (err) {
    return error(res, err.message)
  }
}

const updateStatus = async (req, res) => {
  try {
    const lead = await leadService.updateStatus(req.params.id, req.body.status)
    if (!lead) return error(res, 'Lead not found', 404)
    return success(res, lead, 'Status updated')
  } catch (err) {
    return error(res, err.message)
  }
}

const convertToOrder = async (req, res) => {
  try {
    const order = await leadService.convertToOrder(req.params.id)
    if (!order) return error(res, 'Lead not found', 404)
    return success(res, order, 'Lead converted to order')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { list, get, create, update, updateStatus, convertToOrder }
