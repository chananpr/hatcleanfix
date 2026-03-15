const { Payment, Order } = require('../../models')

const list = async ({ order_id, status, page = 1, limit = 20 }) => {
  const where = {}
  if (order_id) where.order_id = order_id
  if (status) where.status = status

  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [{ model: Order, attributes: ['id', 'order_number', 'customer_id', 'total'] }],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  })
  return { rows, count, page: parseInt(page), limit: parseInt(limit) }
}

const getById = async (id) => {
  return Payment.findByPk(id, {
    include: [{ model: Order, attributes: ['id', 'order_number', 'customer_id', 'total'] }]
  })
}

const create = async (data) => {
  return Payment.create(data)
}

const verify = async (id, userId) => {
  const payment = await Payment.findByPk(id)
  if (!payment) return null
  await payment.update({ status: 'verified', verified_by: userId, verified_at: new Date() })

  // อัพเดท order payment_status
  if (payment.order_id) {
    const order = await Order.findByPk(payment.order_id)
    if (order) await order.update({ payment_status: 'paid' })
  }
  return payment
}

const reject = async (id, userId) => {
  const payment = await Payment.findByPk(id)
  if (!payment) return null
  await payment.update({ status: 'rejected', verified_by: userId, verified_at: new Date() })
  return payment
}

module.exports = { list, getById, create, verify, reject }
