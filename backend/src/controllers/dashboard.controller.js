const { Op, fn, col, literal } = require('sequelize')
const { Lead, Order, Customer, Payment, LeadAttribution } = require('../models')
const { sequelize } = require('../models')

const summary = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [leadsToday, ordersToday, pendingOrders, inProgressOrders,
           awaitingPayment, readyToShip, revenueToday, revenueMonth] = await Promise.all([
      Lead.count({ where: { createdAt: { [Op.between]: [today, todayEnd] } } }),
      Order.count({ where: { createdAt: { [Op.between]: [today, todayEnd] } } }),
      Order.count({ where: { status: { [Op.in]: ['draft','awaiting_inbound_shipment','inbound_shipped','received'] } } }),
      Order.count({ where: { status: { [Op.in]: ['in_progress','washing','shaping','qc'] } } }),
      Order.count({ where: { status: 'awaiting_payment' } }),
      Order.count({ where: { status: 'ready_to_ship' } }),
      Payment.sum('amount', { where: { status: 'verified', createdAt: { [Op.between]: [today, todayEnd] } } }),
      Payment.sum('amount', { where: { status: 'verified', createdAt: { [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1) } } })
    ])

    res.json({
      leads_today: leadsToday || 0,
      orders_today: ordersToday || 0,
      pending_orders: pendingOrders || 0,
      in_progress_orders: inProgressOrders || 0,
      awaiting_payment: awaitingPayment || 0,
      ready_to_ship: readyToShip || 0,
      revenue_today: parseFloat(revenueToday) || 0,
      revenue_month: parseFloat(revenueMonth) || 0
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const orderStats = async (req, res) => {
  try {
    const stats = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true
    })
    res.json({ data: stats })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const revenue = async (req, res) => {
  try {
    const { period = '7d' } = req.query
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7
    const from = new Date()
    from.setDate(from.getDate() - days)

    const data = await Payment.findAll({
      where: { status: 'verified', createdAt: { [Op.gte]: from } },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('SUM', col('amount')), 'total']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    })
    res.json({ data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const attribution = async (req, res) => {
  try {
    const data = await LeadAttribution.findAll({
      attributes: [
        'campaign_id', 'campaign_name',
        [fn('COUNT', col('LeadAttribution.id')), 'lead_count']
      ],
      where: { campaign_id: { [Op.not]: null } },
      group: ['campaign_id', 'campaign_name'],
      raw: true
    })
    res.json({ data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { summary, orderStats, revenue, attribution }
