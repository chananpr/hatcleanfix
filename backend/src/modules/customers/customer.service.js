const { Op } = require('sequelize')
const { Customer, CustomerAddress, Lead, Order, ConversationThread, ConversationMessage, sequelize } = require('../../models')

const list = async ({ search, page = 1, limit = 20, page_id }) => {
  const where = {}
  if (page_id) where.page_id = page_id
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
      { facebook_name: { [Op.like]: `%${search}%` } }
    ]
  }
  const { count, rows } = await Customer.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  })
  return { rows, count, page: parseInt(page), limit: parseInt(limit) }
}

const getById = async (id) => {
  const customer = await Customer.findOne({
    where: { id },
    include: [
      { model: CustomerAddress, order: [['is_default', 'DESC'], ['createdAt', 'DESC']] },
      { model: Lead, limit: 5, order: [['createdAt', 'DESC']] },
      { model: Order, limit: 10, order: [['createdAt', 'DESC']] }
    ]
  })
  if (!customer) return null

  // Conversation stats
  const threads = await ConversationThread.findAll({
    where: { customer_id: id },
    attributes: ['id']
  })
  const threadIds = threads.map(t => t.id)

  let totalMessages = 0
  let lastMessageDate = null
  if (threadIds.length > 0) {
    const msgStats = await ConversationMessage.findOne({
      where: { thread_id: { [Op.in]: threadIds } },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastDate']
      ],
      raw: true
    })
    totalMessages = parseInt(msgStats?.total) || 0
    lastMessageDate = msgStats?.lastDate || null
  }

  // Order summary
  const orderSummary = await Order.findOne({
    where: { customer_id: id },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
      [sequelize.fn('SUM', sequelize.col('total')), 'totalSpent']
    ],
    raw: true
  })

  const plain = customer.toJSON()
  plain.conversationStats = { totalMessages, lastMessageDate }
  plain.orderSummary = {
    totalOrders: parseInt(orderSummary?.totalOrders) || 0,
    totalSpent: parseFloat(orderSummary?.totalSpent) || 0
  }

  return plain
}

const create = async (data) => {
  return Customer.create(data)
}

const update = async (id, data) => {
  const customer = await Customer.findByPk(id)
  if (!customer) return null
  const allowed = ['name', 'phone', 'province', 'note', 'facebook_name']
  const filtered = {}
  for (const key of allowed) {
    if (data[key] !== undefined) filtered[key] = data[key]
  }
  await customer.update(filtered)
  return customer
}

// ====== Address CRUD ======

const addAddress = async (customerId, data) => {
  const customer = await Customer.findByPk(customerId)
  if (!customer) return null

  // If setting as default, unset others
  if (data.is_default) {
    await CustomerAddress.update({ is_default: false }, { where: { customer_id: customerId } })
  }

  return CustomerAddress.create({
    customer_id: customerId,
    name: data.name,
    phone: data.phone,
    address: data.address,
    province: data.province,
    district: data.district,
    postcode: data.postcode,
    is_default: data.is_default || false
  })
}

const updateAddress = async (customerId, addressId, data) => {
  const addr = await CustomerAddress.findOne({ where: { id: addressId, customer_id: customerId } })
  if (!addr) return null

  if (data.is_default) {
    await CustomerAddress.update({ is_default: false }, { where: { customer_id: customerId, id: { [Op.ne]: addressId } } })
  }

  await addr.update(data)
  return addr
}

const deleteAddress = async (customerId, addressId) => {
  const addr = await CustomerAddress.findOne({ where: { id: addressId, customer_id: customerId } })
  if (!addr) return null
  await addr.destroy()
  return true
}

module.exports = { list, getById, create, update, addAddress, updateAddress, deleteAddress }
