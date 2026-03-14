const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { User, Role } = require('../models')

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({
      where: { email, is_active: true },
      include: [{ model: Role, as: 'role' }]
    })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    await user.update({ last_login: new Date() })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role.name, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const me = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['password'] },
      include: [{ model: Role, as: 'role' }]
    })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const refresh = async (req, res) => {
  res.json({ message: 'TODO: refresh token' })
}

module.exports = { login, me, refresh }
