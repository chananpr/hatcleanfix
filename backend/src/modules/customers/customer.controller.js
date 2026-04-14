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

// ====== Address CRUD ======

const addAddress = async (req, res) => {
  try {
    const addr = await customerService.addAddress(req.params.id, req.body)
    if (!addr) return error(res, 'Customer not found', 404)
    return success(res, addr, 'Address added', null, 201)
  } catch (err) {
    return error(res, err.message)
  }
}

const updateAddress = async (req, res) => {
  try {
    const addr = await customerService.updateAddress(req.params.id, req.params.addressId, req.body)
    if (!addr) return error(res, 'Address not found', 404)
    return success(res, addr, 'Address updated')
  } catch (err) {
    return error(res, err.message)
  }
}

const deleteAddress = async (req, res) => {
  try {
    const result = await customerService.deleteAddress(req.params.id, req.params.addressId)
    if (!result) return error(res, 'Address not found', 404)
    return success(res, null, 'Address deleted')
  } catch (err) {
    return error(res, err.message)
  }
}

// ====== Address search (Thai) ======

const searchAddress = async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return success(res, [])
    const { searchAddressByZipcode } = require('thai-address-database')
    const results = searchAddressByZipcode(q)
    return success(res, results.slice(0, 20))
  } catch (err) {
    return error(res, err.message)
  }
}

module.exports = { list, get, create, update, addAddress, updateAddress, deleteAddress, searchAddress }
