require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: [process.env.ADMIN_URL, process.env.PUBLIC_URL, 'https://www.hatfixclean.com'].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use('/api/linkedin-posts', require('./modules/linkedin-post/linkedin-post.routes'))
app.use('/api/n8n',            require('./modules/n8n/n8n.routes'))
app.use('/api/ai-chat',        require('./modules/ai-chat/ai-chat.routes'))
app.use('/api/facebook-pages', require('./modules/facebook-pages/facebook-pages.routes'))
app.use('/api/products', require('./modules/products/products.routes'))
app.use('/api/conversations', require('./modules/conversations/conversations.routes'))

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

const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

// Store io globally so other modules can use it
app.set('io', io)

io.on('connection', (socket) => {
  console.log('[Socket.IO] Client connected:', socket.id)

  // Join page room
  socket.on('join_page', (pageId) => {
    socket.join(`page_${pageId}`)
    console.log('[Socket.IO] Joined page:', pageId)
  })

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id)
  })
})

// Connect IO to messenger services
const messengerService = require('./modules/webhooks/messenger.service')
messengerService.setIO(io)
const claudeService = require('./modules/webhooks/claude-messenger.service')
claudeService.setIO(io)

server.listen(PORT, () => {
  logger.info(`HATZ API running on port ${PORT}`)
})
server.timeout = 300000
server.keepAliveTimeout = 120000
server.headersTimeout = 310000
