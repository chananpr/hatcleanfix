const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { User, Role } = require('../../models')

const login = async (email, password) => {
  if (!email || !password) throw Object.assign(new Error('Email and password required'), { statusCode: 400 })

  const user = await User.findOne({
    where: { email, is_active: true },
    include: [{ model: Role, as: 'role' }]
  })
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 })

  await user.update({ last_login: new Date() })

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role.name, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role.name }
  }
}

const getMe = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    attributes: { exclude: ['password'] },
    include: [{ model: Role, as: 'role' }]
  })
  return {
    id: user.id, name: user.name, email: user.email,
    role: user.role?.name || null, role_id: user.role_id,
    is_active: user.is_active, last_login: user.last_login
  }
}

module.exports = { login, getMe }
