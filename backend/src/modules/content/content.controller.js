const contentService = require('./content.service')
const { success, error } = require('../../utils/response')

const listPortfolio = async (req, res) => {
  try { return success(res, await contentService.listPortfolio()) }
  catch (err) { return error(res, err.message) }
}
const createPortfolio = async (req, res) => {
  try { return success(res, await contentService.createPortfolio(req.body), 'Created', null, 201) }
  catch (err) { return error(res, err.message) }
}
const updatePortfolio = async (req, res) => {
  try {
    const item = await contentService.updatePortfolio(req.params.id, req.body)
    if (!item) return error(res, 'Not found', 404)
    return success(res, item)
  } catch (err) { return error(res, err.message) }
}
const togglePortfolio = async (req, res) => {
  try {
    const item = await contentService.togglePortfolio(req.params.id)
    if (!item) return error(res, 'Not found', 404)
    return success(res, item)
  } catch (err) { return error(res, err.message) }
}
const deletePortfolio = async (req, res) => {
  try {
    const ok = await contentService.deletePortfolio(req.params.id)
    if (!ok) return error(res, 'Not found', 404)
    return success(res, null, 'Deleted')
  } catch (err) { return error(res, err.message) }
}

const listTestimonials = async (req, res) => {
  try { return success(res, await contentService.listTestimonials()) }
  catch (err) { return error(res, err.message) }
}
const createTestimonial = async (req, res) => {
  try { return success(res, await contentService.createTestimonial(req.body), 'Created', null, 201) }
  catch (err) { return error(res, err.message) }
}
const toggleTestimonial = async (req, res) => {
  try {
    const item = await contentService.toggleTestimonial(req.params.id)
    if (!item) return error(res, 'Not found', 404)
    return success(res, item)
  } catch (err) { return error(res, err.message) }
}
const deleteTestimonial = async (req, res) => {
  try {
    const ok = await contentService.deleteTestimonial(req.params.id)
    if (!ok) return error(res, 'Not found', 404)
    return success(res, null, 'Deleted')
  } catch (err) { return error(res, err.message) }
}

const getSettings = async (req, res) => {
  try { return success(res, await contentService.getSettings()) }
  catch (err) { return error(res, err.message) }
}
const updateSettings = async (req, res) => {
  try { return success(res, await contentService.updateSettings(req.body)) }
  catch (err) { return error(res, err.message) }
}

module.exports = {
  listPortfolio, createPortfolio, updatePortfolio, togglePortfolio, deletePortfolio,
  listTestimonials, createTestimonial, toggleTestimonial, deleteTestimonial,
  getSettings, updateSettings
}
