const bcrypt = require('bcryptjs')
const { User, Role } = require('../../models')

const list = async () => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    include: [{ model: Role, as: 'role' }],
    order: [['createdAt', 'DESC']]
  })
  return users.map(u => ({ ...u.toJSON(), role: u.role?.name || null }))
}

const getById = async (id) => {
  return User.findOne({
    where: { id },
    attributes: { exclude: ['password'] },
    include: [{ model: Role, as: 'role' }]
  })
}

const create = async ({ name, email, password, role_id }) => {
  if (!name || !email || !password) throw Object.assign(new Error('name, email, password required'), { statusCode: 400 })

  const exists = await User.findOne({ where: { email } })
  if (exists) throw Object.assign(new Error('Email already exists'), { statusCode: 400 })

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashed, role_id: role_id || 3 })
  return User.findOne({
    where: { id: user.id },
    attributes: { exclude: ['password'] },
    include: [{ model: Role, as: 'role' }]
  })
}

const update = async (id, data, requester) => {
  const user = await User.findByPk(id)
  if (!user) return null

  if (user.role_id === 1 && requester.role !== 'superadmin') {
    throw Object.assign(new Error('Cannot modify superadmin'), { statusCode: 403 })
  }

  const updates = { name: data.name, email: data.email, role_id: data.role_id, is_active: data.is_active }
  if (data.password) updates.password = await bcrypt.hash(data.password, 10)

  await user.update(updates)
  return user
}

const remove = async (id, requesterId) => {
  const user = await User.findByPk(id)
  if (!user) return null
  if (user.id === requesterId) throw Object.assign(new Error('Cannot delete yourself'), { statusCode: 400 })
  await user.update({ is_active: false })
  return user
}

const listRoles = async () => {
  return Role.findAll()
}

module.exports = { list, getById, create, update, remove, listRoles }
