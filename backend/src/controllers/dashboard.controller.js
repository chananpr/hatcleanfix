const summary     = async (req, res) => res.json({ leads: 0, orders: 0, revenue: 0, pending: 0 })
const orderStats  = async (req, res) => res.json({ by_status: {} })
const revenue     = async (req, res) => res.json({ today: 0, week: 0, month: 0 })
const attribution = async (req, res) => res.json({ by_campaign: [] })

module.exports = { summary, orderStats, revenue, attribution }
