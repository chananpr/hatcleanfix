const authService = require('./auth.service')
const { success, error } = require('../../utils/response')

const login = async (req, res) => {
  try {
    const result = await authService.login(req.body.email, req.body.password)
    return success(res, result, 'Login successful')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const me = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id)
    return success(res, { user })
  } catch (err) {
    return error(res, err.message)
  }
}

const refresh = async (req, res) => {
  return error(res, 'Token refresh not implemented', 501)
}

module.exports = { login, me, refresh }
