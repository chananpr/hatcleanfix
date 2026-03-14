const list   = async (req, res) => res.json({ data: [] })
const get    = async (req, res) => res.json({ data: null, id: req.params.id })
const create = async (req, res) => res.json({ data: req.body })
const verify = async (req, res) => res.json({ message: 'payment verified - TODO', id: req.params.id })

module.exports = { list, get, create, verify }
