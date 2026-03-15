const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 20, min: 2, acquire: 60000, idle: 30000 },
    dialectOptions: { connectTimeout: 60000 },
    retry: { max: 3 }
  }
)

module.exports = sequelize
