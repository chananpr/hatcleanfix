const { Op } = require('sequelize')
const { Customer, CustomerAddress, Lead, Order } = require('../../models')

const list = async ({ search, page = 1, limit = 20 }) => {
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
  return { rows, count, page: parseInt(page), limit: parseInt(limit) }
}

const getById = async (id) => {
  const customer = await Customer.findOne({
    where: { id },
    include: [
      { model: CustomerAddress },
      { model: Lead, limit: 5, order: [['createdAt', 'DESC']] },
      { model: Order, limit: 5, order: [['createdAt', 'DESC']] }
    ]
  })
  return customer
}

const create = async (data) => {
  return Customer.create(data)
}

const update = async (id, data) => {
  const customer = await Customer.findByPk(id)
  if (!customer) return null
  await customer.update(data)
  return customer
}

module.exports = { list, getById, create, update }
