const { Op, fn, col } = require('sequelize')
const { Lead, Order, Payment, LeadAttribution, sequelize } = require('../../models')

const revenue = async ({ date_from, date_to, period = '30d' }) => {
  const where = { status: 'verified' }
  if (date_from) where.createdAt = { ...where.createdAt, [Op.gte]: new Date(date_from) }
  if (date_to) {
    const to = new Date(date_to); to.setHours(23, 59, 59, 999)
    where.createdAt = { ...where.createdAt, [Op.lte]: to }
  }
  if (!date_from && !date_to) {
    const days = period === '90d' ? 90 : period === '7d' ? 7 : 30
    const from = new Date(); from.setDate(from.getDate() - days)
    where.createdAt = { [Op.gte]: from }
  }

  return Payment.findAll({
    where,
    attributes: [
      [fn('DATE', col('createdAt')), 'date'],
      [fn('SUM', col('amount')), 'total'],
      [fn('COUNT', col('id')), 'count']
    ],
    group: [fn('DATE', col('createdAt'))],
    order: [[fn('DATE', col('createdAt')), 'ASC']],
    raw: true
  })
}

const leads = async ({ date_from, date_to }) => {
  const where = {}
  if (date_from) where.createdAt = { [Op.gte]: new Date(date_from) }
  if (date_to) {
    const to = new Date(date_to); to.setHours(23, 59, 59, 999)
    where.createdAt = { ...where.createdAt, [Op.lte]: to }
  }

  return Lead.findAll({
    where,
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true
  })
}

const orders = async ({ date_from, date_to }) => {
  const where = {}
  if (date_from) where.createdAt = { [Op.gte]: new Date(date_from) }
  if (date_to) {
    const to = new Date(date_to); to.setHours(23, 59, 59, 999)
    where.createdAt = { ...where.createdAt, [Op.lte]: to }
  }

  return Order.findAll({
    where,
    attributes: ['status', [fn('COUNT', col('id')), 'count']],
    group: ['status'],
    raw: true
  })
}

const campaigns = async ({ date_from, date_to }) => {
  let dateFilter = ''
  const replacements = {}
  if (date_from) { dateFilter += ' AND l.createdAt >= :date_from'; replacements.date_from = date_from }
  if (date_to) { dateFilter += ' AND l.createdAt <= :date_to'; replacements.date_to = new Date(new Date(date_to).setHours(23, 59, 59, 999)) }

  return sequelize.query(`
    SELECT
      COALESCE(la.campaign_id, la.ad_id, la.source_type, 'direct') AS campaign,
      COALESCE(la.campaign_name, la.ad_name, la.source_type) AS campaign_label,
      COUNT(DISTINCT la.lead_id) AS leads_count,
      COUNT(DISTINCT o.id) AS orders_count,
      COALESCE(SUM(o.total), 0) AS revenue
    FROM lead_attributions la
    JOIN leads l ON l.id = la.lead_id
    LEFT JOIN orders o ON o.lead_id = l.id AND o.status NOT IN ('draft')
    WHERE 1=1 ${dateFilter}
    GROUP BY campaign, campaign_label
    ORDER BY leads_count DESC
  `, { replacements, type: sequelize.QueryTypes.SELECT })
}

module.exports = { revenue, leads, orders, campaigns }
