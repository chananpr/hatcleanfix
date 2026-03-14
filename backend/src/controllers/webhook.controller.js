// Facebook Messenger webhook verification
const verifyMessenger = (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
    return res.status(200).send(challenge)
  }
  res.sendStatus(403)
}

// Facebook Messenger incoming message (raw)
const handleMessenger = async (req, res) => {
  const body = req.body
  if (body.object !== 'page') return res.sendStatus(404)

  // Forward to n8n for processing
  // or handle directly here
  for (const entry of body.entry) {
    for (const event of entry.messaging) {
      console.log('Messenger event:', JSON.stringify(event))
      // TODO: save conversation, extract lead data
    }
  }
  res.sendStatus(200)
}

// n8n → API: ส่งข้อมูลที่ AI extract แล้วเข้า system
const handleN8n = async (req, res) => {
  try {
    const { type, data } = req.body
    // type: 'new_lead' | 'update_lead' | 'create_order' | 'message_event'
    console.log('n8n webhook received:', type, data)
    // TODO: route to appropriate service
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = { verifyMessenger, handleMessenger, handleN8n }
