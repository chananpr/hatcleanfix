const bcrypt = require('bcryptjs')
const { User, Role } = require('../models')

const list = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }],
      order: [['createdAt', 'DESC']]
    })
    const data = users.map(u => ({ ...u.toJSON(), role: u.role?.name || null }))
    res.json({ data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const get = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ data: user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const create = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' })

    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(400).json({ message: 'Email already exists' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed, role_id: role_id || 3 })
    const result = await User.findOne({
      where: { id: user.id },
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    })
    res.status(201).json({ data: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const update = async (req, res) => {
  try {
    const { name, email, role_id, is_active, password } = req.body
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // ป้องกันแก้ superadmin ถ้าไม่ใช่ superadmin
    if (user.role_id === 1 && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Cannot modify superadmin' })
    }

    const updates = { name, email, role_id, is_active }
    if (password) updates.password = await bcrypt.hash(password, 10)

    await user.update(updates)
    res.json({ data: user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.id === req.user.id) return res.status(400).json({ message: 'Cannot delete yourself' })
    await user.update({ is_active: false }) // soft delete
    res.json({ message: 'User deactivated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const listRoles = async (req, res) => {
  try {
    const roles = await Role.findAll()
    res.json({ data: roles })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { list, get, create, update, remove, listRoles }
