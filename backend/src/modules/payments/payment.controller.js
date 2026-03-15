const paymentService = require('./payment.service')
const { success, error, paginated } = require('../../utils/response')

const list = async (req, res) => {
  try {
    const result = await paymentService.list(req.query)
    return paginated(res, result.rows, result.count, result.page, result.limit)
  } catch (err) { return error(res, err.message) }
}

const get = async (req, res) => {
  try {
    const payment = await paymentService.getById(req.params.id)
    if (!payment) return error(res, 'Payment not found', 404)
    return success(res, payment)
  } catch (err) { return error(res, err.message) }
}

const create = async (req, res) => {
  try { return success(res, await paymentService.create(req.body), 'Payment created', null, 201) }
  catch (err) { return error(res, err.message) }
}

const verify = async (req, res) => {
  try {
    const payment = await paymentService.verify(req.params.id, req.user.id)
    if (!payment) return error(res, 'Payment not found', 404)
    return success(res, payment, 'Payment verified')
  } catch (err) { return error(res, err.message) }
}

const reject = async (req, res) => {
  try {
    const payment = await paymentService.reject(req.params.id, req.user.id)
    if (!payment) return error(res, 'Payment not found', 404)
    return success(res, payment, 'Payment rejected')
  } catch (err) { return error(res, err.message) }
}

module.exports = { list, get, create, verify, reject }
