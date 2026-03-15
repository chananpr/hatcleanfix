const orderService = require('./order.service')
const { success, error, paginated } = require('../../utils/response')

const list = async (req, res) => {
  try {
    const result = await orderService.list(req.query, req.user)
    return paginated(res, result.rows, result.count, result.page, result.limit)
  } catch (err) {
    return error(res, err.message)
  }
}

const get = async (req, res) => {
  try {
    const order = await orderService.getById(req.params.id)
    if (!order) return error(res, 'Order not found', 404)
    return success(res, order)
  } catch (err) {
    return error(res, err.message)
  }
}

const create = async (req, res) => {
  try {
    const order = await orderService.create(req.body)
    return success(res, order, 'Order created', null, 201)
  } catch (err) {
    return error(res, err.message)
  }
}

const update = async (req, res) => {
  try {
    const order = await orderService.update(req.params.id, req.body)
    if (!order) return error(res, 'Order not found', 404)
    return success(res, order, 'Order updated')
  } catch (err) {
    return error(res, err.message)
  }
}

const updateStatus = async (req, res) => {
  try {
    const order = await orderService.updateStatus(req.params.id, req.body.status, req.body.note, req.user.id)
    if (!order) return error(res, 'Order not found', 404)
    return success(res, order, 'Status updated')
  } catch (err) {
    return error(res, err.message)
  }
}

const uploadImages = async (req, res) => {
  return error(res, 'Upload images - TODO: connect S3/R2', 501)
}

module.exports = { list, get, create, update, updateStatus, uploadImages }
