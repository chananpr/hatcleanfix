const revenue   = async (req, res) => res.json({ data: [] })
const leads     = async (req, res) => res.json({ data: [] })
const orders    = async (req, res) => res.json({ data: [] })
const campaigns = async (req, res) => res.json({ data: [] })

module.exports = { revenue, leads, orders, campaigns }
