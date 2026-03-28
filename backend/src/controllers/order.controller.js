const { Order, OrderItem, OrderStatusLog, OrderImage, Customer, User, Lead } = require('../models')

const list = async (req, res) => {
  try {
    const { status, assigned_to, page = 1, limit = 20, page_id } = req.query
    const where = {}
    if (status) where.status = status
    if (req.user.role === 'staff') where.assigned_to = req.user.id
    // TODO: add page_id column to Order model, then uncomment:
    // if (page_id) where.page_id = page_id

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Customer, attributes: ['id','name','phone','facebook_name'] },
        { model: User, as: 'assignee', attributes: ['id','name'], foreignKey: 'assigned_to' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    })
    res.json({ data: rows, total: count, page: parseInt(page) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const get = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [Customer, OrderItem, OrderStatusLog, OrderImage]
    })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ data: order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const create = async (req, res) => {
  try {
    const orderNumber = `ORD-${Date.now()}`
    const order = await Order.create({ ...req.body, order_number: orderNumber })
    if (req.body.items?.length) {
      await OrderItem.bulkCreate(req.body.items.map(i => ({ ...i, order_id: order.id })))
    }
    res.status(201).json({ data: order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const update = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })
    await order.update(req.body)
    res.json({ data: order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body
    const order = await Order.findByPk(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    await OrderStatusLog.create({
      order_id: order.id,
      from_status: order.status,
      to_status: status,
      note,
      changed_by: req.user.id
    })
    await order.update({ status })
    res.json({ data: order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const uploadImages = async (req, res) => {
  res.json({ message: 'upload images - TODO: connect S3/R2' })
}

module.exports = { list, get, create, update, updateStatus, uploadImages }
