const { Op, fn, col, literal } = require('sequelize')
const { Lead, Order, Customer, Payment, LeadAttribution } = require('../models')
const { sequelize } = require('../models')

const summary = async (req, res) => {
  try {
    const { page_id } = req.query
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const leadWhere = { createdAt: { [Op.between]: [today, todayEnd] } }
    const orderTodayWhere = { createdAt: { [Op.between]: [today, todayEnd] } }
    const pendingWhere = { status: { [Op.in]: ['draft','awaiting_inbound_shipment','inbound_shipped','received'] } }
    const inProgressWhere = { status: { [Op.in]: ['in_progress','washing','shaping','qc'] } }
    const awaitingPayWhere = { status: 'awaiting_payment' }
    const readyShipWhere = { status: 'ready_to_ship' }
    const revTodayWhere = { status: 'verified', createdAt: { [Op.between]: [today, todayEnd] } }
    const revMonthWhere = { status: 'verified', createdAt: { [Op.gte]: new Date(today.getFullYear(), today.getMonth(), 1) } }

    if (page_id) {
      leadWhere.page_id = page_id
      orderTodayWhere.page_id = page_id
      pendingWhere.page_id = page_id
      inProgressWhere.page_id = page_id
      awaitingPayWhere.page_id = page_id
      readyShipWhere.page_id = page_id
    }

    const paymentInclude = page_id ? [{ model: Order, attributes: [], where: { page_id }, required: true }] : []

    const [leadsToday, ordersToday, pendingOrders, inProgressOrders,
           awaitingPayment, readyToShip, revenueToday, revenueMonth] = await Promise.all([
      Lead.count({ where: leadWhere }),
      Order.count({ where: orderTodayWhere }),
      Order.count({ where: pendingWhere }),
      Order.count({ where: inProgressWhere }),
      Order.count({ where: awaitingPayWhere }),
      Order.count({ where: readyShipWhere }),
      Payment.sum('amount', { where: revTodayWhere, include: paymentInclude }),
      Payment.sum('amount', { where: revMonthWhere, include: paymentInclude })
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
    const { page_id } = req.query
    const where = {}
    if (page_id) where.page_id = page_id

    const stats = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      where,
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
    const { period = '7d', page_id } = req.query
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7
    const from = new Date()
    from.setDate(from.getDate() - days)

    const payWhere = { status: 'verified', createdAt: { [Op.gte]: from } }
    const paymentInclude = page_id ? [{ model: Order, attributes: [], where: { page_id }, required: true }] : []

    const data = await Payment.findAll({
      where: payWhere,
      include: paymentInclude,
      attributes: [
        [fn('DATE', col('Payment.createdAt')), 'date'],
        [fn('SUM', col('Payment.amount')), 'total']
      ],
      group: [fn('DATE', col('Payment.createdAt'))],
      order: [[fn('DATE', col('Payment.createdAt')), 'ASC']],
      raw: true
    })
    res.json({ data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const attribution = async (req, res) => {
  try {
    const { date_from, date_to, page_id } = req.query

    const pageFilter = page_id ? "AND l.page_id = :page_id" : ""
    const replacements = {
      ...(date_from ? { date_from } : {}),
      ...(date_to ? { date_to: new Date(new Date(date_to).setHours(23, 59, 59, 999)) } : {}),
      ...(page_id ? { page_id } : {})
    }

    const campaigns = await sequelize.query(`
      SELECT
        COALESCE(la.campaign_id, la.ad_id, la.source_type, 'direct') AS campaign,
        COALESCE(la.campaign_name, la.ad_name, la.source_type, 'ไม่ระบุ') AS campaign_label,
        la.source_type,
        COUNT(DISTINCT la.lead_id) AS leads_count,
        COUNT(DISTINCT o.id) AS orders_count,
        COALESCE(SUM(o.total), 0) AS revenue
      FROM lead_attributions la
      JOIN leads l ON l.id = la.lead_id
      LEFT JOIN orders o ON o.lead_id = l.id AND o.status NOT IN ('draft')
      ${date_from ? "WHERE l.createdAt >= :date_from" : "WHERE 1=1"}
      ${date_to ? "AND l.createdAt <= :date_to" : ""}
      ${pageFilter}
      GROUP BY campaign, campaign_label, la.source_type
      ORDER BY leads_count DESC
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    })

    const directLeadsQuery = `
      SELECT
        COUNT(DISTINCT l.id) AS leads_count,
        COUNT(DISTINCT o.id) AS orders_count,
        COALESCE(SUM(o.total), 0) AS revenue
      FROM leads l
      LEFT JOIN lead_attributions la ON la.lead_id = l.id
      LEFT JOIN orders o ON o.lead_id = l.id AND o.status NOT IN ('draft')
      WHERE la.id IS NULL
      ${date_from ? "AND l.createdAt >= :date_from" : ""}
      ${date_to ? "AND l.createdAt <= :date_to" : ""}
      ${pageFilter}
    `
    const [directLeads] = await sequelize.query(directLeadsQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    })

    if (directLeads && directLeads.leads_count > 0) {
      campaigns.push({
        campaign: 'direct',
        campaign_label: 'ทักตรง (ไม่ผ่าน Ad)',
        source_type: 'direct',
        leads_count: directLeads.leads_count,
        orders_count: directLeads.orders_count,
        revenue: directLeads.revenue
      })
    }

    const totalLeads = campaigns.reduce((s, c) => s + (parseInt(c.leads_count) || 0), 0)
    const totalOrders = campaigns.reduce((s, c) => s + (parseInt(c.orders_count) || 0), 0)
    const totalRevenue = campaigns.reduce((s, c) => s + (parseFloat(c.revenue) || 0), 0)

    res.json({
      campaigns: campaigns.map(c => ({
        ...c,
        leads_count: parseInt(c.leads_count) || 0,
        orders_count: parseInt(c.orders_count) || 0,
        revenue: parseFloat(c.revenue) || 0
      })),
      summary: {
        total_leads: totalLeads,
        total_orders: totalOrders,
        total_revenue: totalRevenue
      }
    })
  } catch (err) {
    console.error('Attribution error:', err)
    res.status(500).json({ message: err.message })
  }
}

module.exports = { summary, orderStats, revenue, attribution }