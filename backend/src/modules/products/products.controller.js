const { Product } = require("../../models")
const { success, error } = require("../../utils/response")
const s3Service = require("../../services/s3.service")

const list = async (req, res) => {
  try {
    const where = {}
    if (req.query.page_id) where.page_id = req.query.page_id
    if (req.query.category) where.category = req.query.category
    if (req.query.is_active !== undefined) where.is_active = req.query.is_active === "true"
    const products = await Product.findAll({ where, order: [["sort_order", "ASC"], ["createdAt", "DESC"]] })
    return success(res, products)
  } catch (err) { return error(res, err.message) }
}

const getOne = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return error(res, "Product not found", 404)
    return success(res, product)
  } catch (err) { return error(res, err.message) }
}

const create = async (req, res) => {
  try {
    const { name, description, category, price, compare_price, sku, stock, is_active, options, page_id } = req.body
    if (!name) return error(res, "Name is required", 400)
    const slug = name.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/(^-|-$)/g, "")
    const images = s3Service.parseUploadedFiles(req.files)
    const product = await Product.create({
      name, slug, description, category,
      price: price || 0, compare_price, sku,
      stock: stock || 0, is_active: is_active !== "false",
      images, options: options ? JSON.parse(options) : {},
      page_id: page_id || null
    })
    return success(res, product, "Product created", null, 201)
  } catch (err) { return error(res, err.message) }
}

const update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return error(res, "Product not found", 404)
    const { name, description, category, price, compare_price, sku, stock, is_active, options, existing_images, page_id } = req.body
    const updates = {}
    if (name !== undefined) {
      updates.name = name
      updates.slug = name.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, "-").replace(/(^-|-$)/g, "")
    }
    if (description !== undefined) updates.description = description
    if (category !== undefined) updates.category = category
    if (price !== undefined) updates.price = price
    if (compare_price !== undefined) updates.compare_price = compare_price
    if (sku !== undefined) updates.sku = sku
    if (stock !== undefined) updates.stock = stock
    if (is_active !== undefined) updates.is_active = is_active === true || is_active === "true"
    if (options !== undefined) updates.options = typeof options === "string" ? JSON.parse(options) : options
    if (page_id !== undefined) updates.page_id = page_id || null
    const kept = existing_images ? JSON.parse(existing_images) : product.images || []
    const newFiles = s3Service.parseUploadedFiles(req.files)
    updates.images = [...kept, ...newFiles]
    await product.update(updates)
    return success(res, product, "Product updated")
  } catch (err) { return error(res, err.message) }
}

const remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return error(res, "Product not found", 404)
    const keys = (product.images || []).map(img => img.key).filter(Boolean)
    if (keys.length) await s3Service.deleteFiles(keys)
    await product.destroy()
    return success(res, null, "Product deleted")
  } catch (err) { return error(res, err.message) }
}

const toggleActive = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return error(res, "Product not found", 404)
    await product.update({ is_active: !product.is_active })
    return success(res, { is_active: product.is_active })
  } catch (err) { return error(res, err.message) }
}

const deleteImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) return error(res, "Product not found", 404)
    const { imageKey } = req.body
    if (!imageKey) return error(res, "imageKey required", 400)
    await s3Service.deleteFile(imageKey)
    const updated = (product.images || []).filter(img => img.key !== imageKey)
    await product.update({ images: updated })
    return success(res, { images: updated }, "Image deleted")
  } catch (err) { return error(res, err.message) }
}


const summary = async (req, res) => {
  try {
    const { FacebookPage } = require('../../models')
    const [products, pages] = await Promise.all([
      Product.findAll({ where: { is_active: true }, order: [['page_id', 'ASC'], ['sort_order', 'ASC']], raw: true }),
      FacebookPage.findAll({ attributes: ['page_id', 'page_name'], raw: true })
    ])

    const pageMap = {}
    for (const p of pages) pageMap[p.page_id] = p.page_name

    const byPage = {}
    for (const prod of products) {
      const pid = prod.page_id || 'unassigned'
      if (!byPage[pid]) byPage[pid] = { page_name: pageMap[pid] || 'ไม่ระบุเพจ', page_id: pid, products: [], count: 0 }
      byPage[pid].products.push(prod)
      byPage[pid].count++
    }

    return success(res, {
      total: products.length,
      pages: Object.values(byPage),
      all_products: products
    })
  } catch (err) { return error(res, err.message) }
}

module.exports = { summary, list, getOne, create, update, remove, toggleActive, deleteImage }
