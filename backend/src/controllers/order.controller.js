const list         = async (req, res) => res.json({ data: [] })
const get          = async (req, res) => res.json({ data: null, id: req.params.id })
const create       = async (req, res) => res.json({ data: req.body })
const update       = async (req, res) => res.json({ data: req.body })
const updateStatus = async (req, res) => res.json({ status: req.body.status })
const uploadImages = async (req, res) => res.json({ message: 'upload images - TODO' })

module.exports = { list, get, create, update, updateStatus, uploadImages }
