const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body)
    req.body = parsed
    next()
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors?.map(e => ({ field: e.path.join('.'), message: e.message })) || [{ message: err.message }]
    })
  }
}

const validateQuery = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.query)
    req.query = parsed
    next()
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: err.errors?.map(e => ({ field: e.path.join('.'), message: e.message })) || [{ message: err.message }]
    })
  }
}

module.exports = { validate, validateQuery }
