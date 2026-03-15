require('dotenv').config()
const express = require('express')
const cors = require('cors')

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

// Routes
app.use('/api/auth',        require('./routes/auth.routes'))
app.use('/api/users',       require('./routes/user.routes'))
app.use('/api/customers',   require('./routes/customer.routes'))
app.use('/api/leads',       require('./routes/lead.routes'))
app.use('/api/orders',      require('./routes/order.routes'))
app.use('/api/shipments',   require('./routes/shipment.routes'))
app.use('/api/payments',    require('./routes/payment.routes'))
app.use('/api/webhooks',    require('./routes/webhook.routes'))
app.use('/api/dashboard',   require('./routes/dashboard.routes'))
app.use('/api/content',     require('./routes/content.routes'))
app.use('/api/pricing',     require('./routes/pricing.routes'))
app.use('/api/reports',     require('./routes/report.routes'))

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

const server = app.listen(PORT, () => {
  console.log(`HATZ API running on port ${PORT}`)
})
server.timeout = 300000         // 5 min
server.keepAliveTimeout = 120000 // 2 min
server.headersTimeout = 310000   // slightly above timeout
