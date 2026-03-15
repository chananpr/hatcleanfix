const success = (res, data = null, message = 'Success', meta = null, statusCode = 200) => {
  const response = { success: true, data, message }
  if (meta) response.meta = meta
  return res.status(statusCode).json(response)
}

const error = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = { success: false, message }
  if (errors) response.errors = errors
  return res.status(statusCode).json(response)
}

const paginated = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    data,
    total,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    message,
    meta: {
      total,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      totalPages: Math.ceil(total / (parseInt(limit) || 20))
    }
  })
}

module.exports = { success, error, paginated }
