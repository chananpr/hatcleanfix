const linkedinService = require('./linkedin-post.service')

/**
 * POST /api/linkedin-posts/generate
 * Generate a single LinkedIn post draft
 */
const generate = async (req, res) => {
  try {
    const { topic, style } = req.body
    const result = await linkedinService.generatePost({ topic, style })
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('LinkedIn post generate error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * POST /api/linkedin-posts/generate-batch
 * Generate multiple posts for scheduling
 */
const generateBatch = async (req, res) => {
  try {
    const { count = 5 } = req.body
    const results = await linkedinService.generateBatch(Math.min(count, 10))
    res.json({ success: true, data: results, total: results.length })
  } catch (err) {
    console.error('LinkedIn batch generate error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
}

/**
 * GET /api/linkedin-posts/topics
 * Get available topic pool
 */
const getTopics = async (req, res) => {
  res.json({ success: true, data: linkedinService.TOPIC_POOL })
}

module.exports = { generate, generateBatch, getTopics }
