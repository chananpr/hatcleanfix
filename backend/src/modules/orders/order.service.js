const { Order, OrderItem, OrderStatusLog, OrderImage, Customer, User, Shipment, Payment } = require("../../models")

const list = async ({ status, page = 1, limit = 20, page_id }, user) => {
  const where = {}
  if (page_id) where.page_id = page_id
  if (status) where.status = status
  if (user.role === "staff") where.assigned_to = user.id

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: Customer, attributes: ["id", "name", "phone", "facebook_name"] },
      { model: User, as: "assignee", attributes: ["id", "name"], foreignKey: "assigned_to" }
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  })
  return { rows, count, page: parseInt(page), limit: parseInt(limit) }
}

const getById = async (id) => {
  const order = await Order.findOne({
    where: { id },
    include: [
      { model: Customer, attributes: ["id", "name", "facebook_name", "phone", "province"] },
      { model: User, as: "assignee", attributes: ["id", "name"] },
      { model: OrderItem },
      { model: OrderImage },
      { model: OrderStatusLog, order: [["createdAt", "ASC"]] },
      { model: Shipment },
      { model: Payment }
    ],
    order: [
      [OrderStatusLog, "createdAt", "ASC"]
    ]
  })

  if (!order) return null

  // Calculate amount paid from payments
  const amountPaid = (order.Payments || [])
    .filter(p => p.status === "verified")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)

  const transformed = {
    ...order.toJSON(),
    // Flatten customer
    customer_name: order.Customer?.name || order.Customer?.facebook_name || "",
    customer_phone: order.Customer?.phone || "",
    customer_province: order.Customer?.province || "",
    // Flatten assignee
    assigned_to_name: order.assignee?.name || "",
    // Notes
    notes: order.note || "",
    // Group images by type
    images_before: (order.OrderImages || []).filter(i => i.image_type === "before").map(i => i.url),
    images_after: (order.OrderImages || []).filter(i => i.image_type === "after").map(i => i.url),
    images_payment: (order.OrderImages || []).filter(i => i.image_type === "payment").map(i => i.url),
    images_shipment: (order.OrderImages || []).filter(i => i.image_type === "shipment").map(i => i.url),
    // Format items
    items: (order.OrderItems || []).map(i => ({
      name: i.service_type,
      quantity: i.quantity,
      unit_price: parseFloat(i.unit_price),
      total: parseFloat(i.total_price)
    })),
    // Status history
    status_history: (order.OrderStatusLogs || []).map(l => ({
      status: l.to_status,
      note: l.note,
      created_at: l.createdAt,
      created_by_name: l.changed_by_name || ""
    })),
    // Payment
    amount_paid: amountPaid,
    payment_slip: (order.OrderImages || []).find(i => i.image_type === "payment")?.url || null,
  }

  return transformed
}

const create = async (data) => {
  const order = await Order.create({ ...data, order_number: `ORD-${Date.now()}` })
  if (data.items?.length) {
    await OrderItem.bulkCreate(data.items.map(i => ({ ...i, order_id: order.id })))
  }
  return order
}

const update = async (id, data) => {
  const order = await Order.findByPk(id)
  if (!order) return null
  await order.update(data)
  return order
}

const updateStatus = async (id, status, note, userId) => {
  const order = await Order.findByPk(id)
  if (!order) return null

  await OrderStatusLog.create({
    order_id: order.id,
    from_status: order.status,
    to_status: status,
    note,
    changed_by: userId
  })
  await order.update({ status })
  return order
}

const addImages = async (id, files) => {
  const order = await Order.findByPk(id)
  if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 })

  await OrderImage.bulkCreate(
    files.map(f => ({
      order_id: id,
      url: f.url,
      image_type: "before",
      note: f.originalName
    }))
  )

  return getById(id)
}

module.exports = { list, getById, create, update, updateStatus, addImages }
