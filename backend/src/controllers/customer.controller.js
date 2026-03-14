const { Customer, CustomerAddress, Lead, Order } = require('../models')

const list = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query
    const { Op } = require('sequelize')
    const where = {}
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
    res.json({ data: rows, total: count, page: parseInt(page) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const get = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id },
      include: [
        { model: CustomerAddress },
        { model: Lead, limit: 5, order: [['createdAt', 'DESC']] },
        { model: Order, limit: 5, order: [['createdAt', 'DESC']] }
      ]
    })
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    res.json({ data: customer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body)
    res.status(201).json({ data: customer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const update = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id)
    if (!customer) return res.status(404).json({ message: 'Customer not found' })
    await customer.update(req.body)
    res.json({ data: customer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { list, get, create, update }
