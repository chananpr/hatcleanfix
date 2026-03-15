const { PortfolioItem, Testimonial, SiteSetting } = require('../../models')

// Portfolio
const listPortfolio = async () => {
  return PortfolioItem.findAll({ order: [['createdAt', 'DESC']] })
}

const createPortfolio = async (data) => {
  return PortfolioItem.create(data)
}

const updatePortfolio = async (id, data) => {
  const item = await PortfolioItem.findByPk(id)
  if (!item) return null
  await item.update(data)
  return item
}

const togglePortfolio = async (id) => {
  const item = await PortfolioItem.findByPk(id)
  if (!item) return null
  await item.update({ is_published: !item.is_published })
  return item
}

const deletePortfolio = async (id) => {
  const item = await PortfolioItem.findByPk(id)
  if (!item) return false
  await item.destroy()
  return true
}

// Testimonials
const listTestimonials = async () => {
  return Testimonial.findAll({ order: [['createdAt', 'DESC']] })
}

const createTestimonial = async (data) => {
  return Testimonial.create(data)
}

const toggleTestimonial = async (id) => {
  const item = await Testimonial.findByPk(id)
  if (!item) return null
  await item.update({ is_published: !item.is_published })
  return item
}

const deleteTestimonial = async (id) => {
  const item = await Testimonial.findByPk(id)
  if (!item) return false
  await item.destroy()
  return true
}

// Settings
const getSettings = async () => {
  const settings = await SiteSetting.findAll()
  const result = {}
  settings.forEach(s => {
    try { result[s.key] = JSON.parse(s.value) }
    catch { result[s.key] = s.value }
  })
  return result
}

const updateSettings = async (data) => {
  for (const [key, value] of Object.entries(data)) {
    const val = typeof value === 'object' ? JSON.stringify(value) : String(value)
    await SiteSetting.upsert({ key, value: val })
  }
  return getSettings()
}

module.exports = {
  listPortfolio, createPortfolio, updatePortfolio, togglePortfolio, deletePortfolio,
  listTestimonials, createTestimonial, toggleTestimonial, deleteTestimonial,
  getSettings, updateSettings
}
