const list   = async (req, res) => res.json({ data: [] })
const get    = async (req, res) => res.json({ data: null, id: req.params.id })
const update = async (req, res) => res.json({ data: req.body })
const track  = async (req, res) => res.json({ tracking: null, id: req.params.id })

// สร้าง iShip shipment
const create = async (req, res) => {
  try {
    // TODO: call iShip API
    // const response = await ishipping.createShipment(req.body)
    res.json({ message: 'iShip integration - TODO', data: req.body })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { list, get, create, update, track }
