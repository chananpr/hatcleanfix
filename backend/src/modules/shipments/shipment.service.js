const { Shipment, Order } = require('../../models')

const list = async ({ order_id, direction, page = 1, limit = 20 }) => {
  const where = {}
  if (order_id) where.order_id = order_id
  if (direction) where.direction = direction

  const { count, rows } = await Shipment.findAndCountAll({
    where,
    include: [{ model: Order, attributes: ['id', 'order_number', 'customer_id'] }],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  })
  return { rows, count, page: parseInt(page), limit: parseInt(limit) }
}

const getById = async (id) => {
  return Shipment.findByPk(id, {
    include: [{ model: Order, attributes: ['id', 'order_number', 'customer_id'] }]
  })
}

const create = async (data) => {
  return Shipment.create(data)
}

const update = async (id, data) => {
  const shipment = await Shipment.findByPk(id)
  if (!shipment) return null
  await shipment.update(data)
  return shipment
}

const track = async (id) => {
  const shipment = await Shipment.findByPk(id)
  if (!shipment) return null
  return {
    tracking_number: shipment.tracking_number,
    courier: shipment.courier,
    status: shipment.status,
    shipped_at: shipment.shipped_at,
    delivered_at: shipment.delivered_at
  }
}

module.exports = { list, getById, create, update, track }
