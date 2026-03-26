require('dotenv').config()
const bcrypt = require('bcryptjs')
const { sequelize, Role, Permission, RolePermission, User } = require('../models')

async function syncDatabase() {
  try {
    console.log('Connecting to database...')
    await sequelize.authenticate()
    console.log('Connected!')

    console.log('Syncing tables...')
    await sequelize.sync({ alter: true })
    console.log('Tables synced!')

    // Seed Roles
    const roles = [
      { id: 1, name: 'superadmin', description: 'Full access including user management' },
      { id: 2, name: 'admin',      description: 'Manage orders, leads, customers, content' },
      { id: 3, name: 'staff',      description: 'Manage assigned orders and leads' },
      { id: 4, name: 'viewer',     description: 'Read-only access' }
    ]
    for (const role of roles) {
      await Role.upsert(role)
    }
    console.log('Roles seeded!')

    // Seed Superadmin user (ถ้ายังไม่มี)
    const existing = await User.findOne({ where: { email: 'admin@hatfixclean.com' } })
    if (!existing) {
      const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMe@FirstLogin'
      const password = await bcrypt.hash(defaultPass, 10)
      await User.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@hatfixclean.com',
        password,
        role_id: 1
      })
      console.log('Superadmin created — CHANGE PASSWORD AFTER FIRST LOGIN')
    } else {
      console.log('Superadmin already exists')
    }

    console.log('\nDatabase sync complete!')
    process.exit(0)
  } catch (err) {
    console.error('Sync failed:', err)
    process.exit(1)
  }
}

syncDatabase()
