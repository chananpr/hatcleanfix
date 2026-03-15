const userService = require('./user.service')
const { success, error } = require('../../utils/response')

const list = async (req, res) => {
  try { return success(res, await userService.list()) }
  catch (err) { return error(res, err.message) }
}

const get = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id)
    if (!user) return error(res, 'User not found', 404)
    return success(res, user)
  } catch (err) { return error(res, err.message) }
}

const create = async (req, res) => {
  try { return success(res, await userService.create(req.body), 'User created', null, 201) }
  catch (err) { return error(res, err.message, err.statusCode || 500) }
}

const update = async (req, res) => {
  try {
    const user = await userService.update(req.params.id, req.body, req.user)
    if (!user) return error(res, 'User not found', 404)
    return success(res, user, 'User updated')
  } catch (err) { return error(res, err.message, err.statusCode || 500) }
}

const remove = async (req, res) => {
  try {
    await userService.remove(req.params.id, req.user.id)
    return success(res, null, 'User deactivated')
  } catch (err) { return error(res, err.message, err.statusCode || 500) }
}

const listRoles = async (req, res) => {
  try { return success(res, await userService.listRoles()) }
  catch (err) { return error(res, err.message) }
}

module.exports = { list, get, create, update, remove, listRoles }
