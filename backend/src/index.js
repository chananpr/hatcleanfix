require('dotenv').config()
const express = require('express')
const cors = require('cors')
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: [process.env.ADMIN_URL, process.env.PUBLIC_URL],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'hatfixclean-api', timestamp: new Date() })
})

// ====== Module Routes ======
app.use('/api/auth',        require('./modules/auth/auth.routes'))
app.use('/api/users',       require('./modules/users/user.routes'))
app.use('/api/customers',   require('./modules/customers/customer.routes'))
app.use('/api/leads',       require('./modules/leads/lead.routes'))
app.use('/api/orders',      require('./modules/orders/order.routes'))
app.use('/api/shipments',   require('./modules/shipments/shipment.routes'))
app.use('/api/payments',    require('./modules/payments/payment.routes'))
app.use('/api/webhooks',    require('./modules/webhooks/webhook.routes'))
app.use('/api/dashboard',   require('./modules/dashboard/dashboard.routes'))
app.use('/api/content',     require('./modules/content/content.routes'))
app.use('/api/pricing',     require('./modules/pricing/pricing.routes'))
app.use('/api/reports',     require('./modules/reports/report.routes'))

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error'
  })
})

const server = app.listen(PORT, () => {
  logger.info(`HATZ API running on port ${PORT}`)
})
server.timeout = 300000
server.keepAliveTimeout = 120000
server.headersTimeout = 310000
