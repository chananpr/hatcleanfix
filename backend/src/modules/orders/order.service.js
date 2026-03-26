const { Order, OrderItem, OrderStatusLog, OrderImage, Customer, User } = require('../../models')

const list = async ({ status, page = 1, limit = 20 }, user) => {
  const where = {}
  if (status) where.status = status
  if (user.role === 'staff') where.assigned_to = user.id

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone', 'facebook_name'] },
      { model: User, as: 'assignee', attributes: ['id', 'name'], foreignKey: 'assigned_to' }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  })
  return { rows, count, page: parseInt(page), limit: parseInt(limit) }
}

const getById = async (id) => {
  return Order.findOne({
    where: { id },
    include: [Customer, OrderItem, OrderStatusLog, OrderImage]
  })
}

const create = async (data) => {
  const order = await Order.create({ ...data, order_number: `ORD-${Date.now()}` })
  if (data.items?.length) {
    await OrderItem.bulkCreate(data.items.map(i => ({ ...i, order_id: order.id })))
  }
  return order
}

const update = async (id, data) => {
  const order = await Order.findByPk(id)
  if (!order) return null
  await order.update(data)
  return order
}

const updateStatus = async (id, status, note, userId) => {
  const order = await Order.findByPk(id)
  if (!order) return null

  await OrderStatusLog.create({
    order_id: order.id,
    from_status: order.status,
    to_status: status,
    note,
    changed_by: userId
  })
  await order.update({ status })
  return order
}

const addImages = async (id, files) => {
  const order = await Order.findByPk(id)
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 })

  await OrderImage.bulkCreate(
    files.map(f => ({
      order_id: id,
      url: f.url,
      image_type: 'before',
      note: f.originalName
    }))
  )

  return getById(id)
}

module.exports = { list, getById, create, update, updateStatus, addImages }
