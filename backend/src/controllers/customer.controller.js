// TODO: import Customer model when DB is ready
const list   = async (req, res) => res.json({ data: [], message: 'TODO: connect DB' })
const get    = async (req, res) => res.json({ data: null, id: req.params.id })
const create = async (req, res) => res.json({ data: req.body, message: 'TODO: save to DB' })
const update = async (req, res) => res.json({ data: req.body, id: req.params.id })

module.exports = { list, get, create, update }
