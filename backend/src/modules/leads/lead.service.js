const { Op } = require('sequelize')
const { Lead, LeadAttribution, Customer, User, Order } = require('../../models')

const list = async ({ status, assigned_to, page = 1, limit = 20 }, user) => {
  const where = {}
  if (status) where.status = status
  if (assigned_to) where.assigned_to = assigned_to
  if (user.role === 'staff') where.assigned_to = user.id

  const { count, rows } = await Lead.findAndCountAll({
    where,
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone', 'facebook_name'] },
      { model: LeadAttribution },
      { model: User, as: 'assignee', attributes: ['id', 'name'], foreignKey: 'assigned_to' }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  })
  return { rows, count, page: parseInt(page), limit: parseInt(limit) }
}

const getById = async (id) => {
  return Lead.findOne({
    where: { id },
    include: [{ model: Customer }, { model: LeadAttribution }]
  })
}

const create = async (data) => {
  const lead = await Lead.create(data)
  if (data.attribution) {
    await LeadAttribution.create({ ...data.attribution, lead_id: lead.id })
  }
  return lead
}

const update = async (id, data) => {
  const lead = await Lead.findByPk(id)
  if (!lead) return null
  await lead.update(data)
  return lead
}

const updateStatus = async (id, status) => {
  const lead = await Lead.findByPk(id)
  if (!lead) return null
  await lead.update({ status })
  return lead
}

const convertToOrder = async (id) => {
  const lead = await Lead.findByPk(id, { include: [Customer] })
  if (!lead) return null

  const order = await Order.create({
    order_number: `ORD-${Date.now()}`,
    customer_id: lead.customer_id,
    lead_id: lead.id,
    assigned_to: lead.assigned_to,
    hat_count: lead.hat_count,
    status: 'draft'
  })

  await lead.update({ status: 'converted' })
  return order
}

module.exports = { list, getById, create, update, updateStatus, convertToOrder }
