const { Lead, LeadAttribution, Customer, User } = require('../models')
const { Op } = require('sequelize')

const list = async (req, res) => {
  try {
    const { status, assigned_to, page = 1, limit = 20, page_id } = req.query
    const where = {}
    if (status) where.status = status
    if (assigned_to) where.assigned_to = assigned_to
    // staff เห็นเฉพาะที่ assigned ให้ตัวเอง
    if (req.user.role === 'staff') where.assigned_to = req.user.id
    // page_id filter enabled
    if (page_id) where.page_id = page_id

    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        { model: Customer, attributes: ['id','name','phone','facebook_name'] },
        { model: LeadAttribution },
        { model: User, as: 'assignee', attributes: ['id','name'], foreignKey: 'assigned_to' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    })
    res.json({ data: rows, total: count, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const get = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: { id: req.params.id },
      include: [{ model: Customer }, { model: LeadAttribution }]
    })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json({ data: lead })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const create = async (req, res) => {
  try {
    const lead = await Lead.create(req.body)
    if (req.body.attribution) {
      await LeadAttribution.create({ ...req.body.attribution, lead_id: lead.id })
    }
    res.status(201).json({ data: lead })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const update = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    await lead.update(req.body)
    res.json({ data: lead })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const updateStatus = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    await lead.update({ status: req.body.status })
    res.json({ data: lead })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const convertToOrder = async (req, res) => {
  try {
    const { Order, OrderItem } = require('../models')
    const lead = await Lead.findByPk(req.params.id, { include: [Customer] })
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    const orderNumber = `ORD-${Date.now()}`
    const order = await Order.create({
      order_number: orderNumber,
      customer_id: lead.customer_id,
      lead_id: lead.id,
      assigned_to: lead.assigned_to,
      hat_count: lead.hat_count,
      status: 'draft',
      page_id: lead.page_id
    })

    await lead.update({ status: 'converted' })
    res.json({ data: order, message: 'Lead converted to order' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { list, get, create, update, updateStatus, convertToOrder }
