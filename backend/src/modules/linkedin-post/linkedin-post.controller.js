const linkedinService = require('./linkedin-post.service')
const { LinkedInPost } = require('../../models')

// POST /generate — generate + save as draft
const generate = async (req, res) => {
  try {
    const { topic, style } = req.body
    const result = await linkedinService.generatePost({ topic, style })

    const saved = await LinkedInPost.create({
      content: result.post,
      topic: result.topic,
      style: result.style,
      status: 'draft',
      created_by: req.user.id,
    })

    res.json({ success: true, data: { ...result, id: saved.id } })
  } catch (err) {
    console.error('LinkedIn post generate error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
}

// POST /generate-batch — generate multiple + save
const generateBatch = async (req, res) => {
  try {
    const { count = 5 } = req.body
    const results = await linkedinService.generateBatch(Math.min(count, 10))

    const saved = await Promise.all(results.map((r) =>
      LinkedInPost.create({
        content: r.post,
        topic: r.topic,
        style: r.style,
        status: 'draft',
        created_by: req.user.id,
      })
    ))

    const data = results.map((r, i) => ({ ...r, id: saved[i].id }))
    res.json({ success: true, data, total: data.length })
  } catch (err) {
    console.error('LinkedIn batch generate error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
}

// GET /topics
const getTopics = async (req, res) => {
  res.json({ success: true, data: linkedinService.TOPIC_POOL })
}

// GET / — list all saved posts
const list = async (req, res) => {
  try {
    const posts = await LinkedInPost.findAll({ order: [['createdAt', 'DESC']] })
    res.json({ success: true, data: posts })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// PATCH /:id/status — update status (draft/approved/posted/skipped)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, note, posted_url } = req.body
    const post = await LinkedInPost.findByPk(id)
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })

    const updates = { status }
    if (note) updates.note = note
    if (posted_url) updates.posted_url = posted_url
    if (status === 'posted') updates.posted_at = new Date()

    await post.update(updates)
    res.json({ success: true, data: post })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// PUT /:id — update content
const update = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const post = await LinkedInPost.findByPk(id)
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' })

    await post.update({ content })
    res.json({ success: true, data: post })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// DELETE /:id
const remove = async (req, res) => {
  try {
    const { id } = req.params
    await LinkedInPost.destroy({ where: { id } })
    res.json({ success: true, message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = { generate, generateBatch, getTopics, list, updateStatus, update, remove }
