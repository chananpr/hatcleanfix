const shipmentService = require('./shipment.service')
const { success, error, paginated } = require('../../utils/response')

const list = async (req, res) => {
  try {
    const result = await shipmentService.list(req.query)
    return paginated(res, result.rows, result.count, result.page, result.limit)
  } catch (err) { return error(res, err.message) }
}

const get = async (req, res) => {
  try {
    const shipment = await shipmentService.getById(req.params.id)
    if (!shipment) return error(res, 'Shipment not found', 404)
    return success(res, shipment)
  } catch (err) { return error(res, err.message) }
}

const create = async (req, res) => {
  try { return success(res, await shipmentService.create(req.body), 'Shipment created', null, 201) }
  catch (err) { return error(res, err.message) }
}

const update = async (req, res) => {
  try {
    const shipment = await shipmentService.update(req.params.id, req.body)
    if (!shipment) return error(res, 'Shipment not found', 404)
    return success(res, shipment, 'Shipment updated')
  } catch (err) { return error(res, err.message) }
}

const track = async (req, res) => {
  try {
    const tracking = await shipmentService.track(req.params.id)
    if (!tracking) return error(res, 'Shipment not found', 404)
    return success(res, tracking)
  } catch (err) { return error(res, err.message) }
}

module.exports = { list, get, create, update, track }
