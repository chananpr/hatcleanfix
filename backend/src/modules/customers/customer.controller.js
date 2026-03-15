const customerService = require('./customer.service')
const { success, error, paginated } = require('../../utils/response')

const list = async (req, res) => {
  try {
    const result = await customerService.list(req.query)
    return paginated(res, result.rows, result.count, result.page, result.limit)
  } catch (err) {
    return error(res, err.message)
  }
}

const get = async (req, res) => {
  try {
    const customer = await customerService.getById(req.params.id)
    if (!customer) return error(res, 'Customer not found', 404)
    return success(res, customer)
  } catch (err) {
    return error(res, err.message)
  }
}

const create = async (req, res) => {
  try {
    const customer = await customerService.create(req.body)
    return success(res, customer, 'Customer created', null, 201)
  } catch (err) {
    return error(res, err.message)
  }
}

const update = async (req, res) => {
  try {
    const customer = await customerService.update(req.params.id, req.body)
    if (!customer) return error(res, 'Customer not found', 404)
    return success(res, customer, 'Customer updated')
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { list, get, create, update }
