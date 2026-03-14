const list          = async (req, res) => res.json({ data: [] })
const get           = async (req, res) => res.json({ data: null, id: req.params.id })
const create        = async (req, res) => res.json({ data: req.body })
const update        = async (req, res) => res.json({ data: req.body })
const updateStatus  = async (req, res) => res.json({ status: req.body.status })
const convertToOrder = async (req, res) => res.json({ message: 'convert lead to order - TODO' })

module.exports = { list, get, create, update, updateStatus, convertToOrder }
