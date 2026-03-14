const listPortfolio    = async (req, res) => res.json({ data: [] })
const createPortfolio  = async (req, res) => res.json({ data: req.body })
const updatePortfolio  = async (req, res) => res.json({ data: req.body })
const listTestimonials = async (req, res) => res.json({ data: [] })
const createTestimonial = async (req, res) => res.json({ data: req.body })
const listFaq          = async (req, res) => res.json({ data: [] })
const getSettings      = async (req, res) => res.json({ data: {} })
const updateSettings   = async (req, res) => res.json({ data: req.body })

module.exports = {
  listPortfolio, createPortfolio, updatePortfolio,
  listTestimonials, createTestimonial,
  listFaq, getSettings, updateSettings
}
