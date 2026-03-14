const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// TODO: Replace with real DB model
const login = async (req, res) => {
  try {
    const { email, password } = req.body
    // const user = await User.findOne({ where: { email } })
    // if (!user || !bcrypt.compareSync(password, user.password)) {
    //   return res.status(401).json({ message: 'Invalid credentials' })
    // }
    const token = jwt.sign({ id: 1, email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    })
    res.json({ token, user: { id: 1, email, role: 'admin' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const refresh = async (req, res) => {
  res.json({ message: 'refresh token - TODO' })
}

const me = async (req, res) => {
  res.json({ user: req.user })
}

module.exports = { login, refresh, me }
