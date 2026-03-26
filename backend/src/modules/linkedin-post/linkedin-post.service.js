const Anthropic = require('@anthropic-ai/sdk')

const SYSTEM_PROMPT = `You are a LinkedIn content writer for Chanan Preecha, a solo full-stack developer and AI integration engineer based in Bangkok.

PROFILE:
- Built 2 production platforms solo (enterprise SaaS + e-commerce)
- Tech: React 19, Node.js, Express, MySQL, Redis, AWS (EC2, S3, RDS), Docker
- AI: GPT-4o function-calling, Claude API streaming, n8n AI agents, Messenger bots
- Education: B.Eng Computer Engineering (AI), SIIT Thammasat University

WRITING STYLE:
- Professional but approachable, NOT corporate-sounding
- Short paragraphs (2-3 lines max)
- Use line breaks for readability
- Include 1-2 relevant emojis per post (not excessive)
- End with a question or call-to-action to drive engagement
- Mix English and Thai naturally (80% English, 20% Thai flavor)
- 150-250 words per post
- Include 3-5 relevant hashtags at the end
- Focus on: lessons learned, behind-the-scenes dev work, AI practical usage, startup mindset

TOPICS TO ROTATE:
1. Building with AI (Claude, GPT-4o, n8n agents) — practical, real examples
2. Solo developer life — challenges, wins, productivity tips
3. AWS infrastructure — real deployment stories (EC2, S3, RDS)
4. Full-stack development — React 19, Node.js, system design decisions
5. Startup/product building — shipping fast, making trade-offs
6. Tech career in Thailand — job market, growth, opportunities`

const TOPIC_POOL = [
  'How I used Claude API to build an admin chat that streams responses in real-time',
  'Migrating from Docker MySQL to AWS RDS — what I learned about production databases',
  'Building a Messenger AI bot with n8n + OpenAI that auto-replies to customers',
  'Why I chose to build everything solo instead of using no-code tools',
  'Setting up AWS S3 for file uploads — the gotchas nobody tells you about',
  'How function-calling in GPT-4o changed the way I build internal tools',
  'React 19 in production — what actually matters vs what is hype',
  'My e-commerce platform handles payments via Xendit QR webhooks — here is how',
  'The architecture behind running 4 services on a single EC2 instance',
  'Ad attribution tracking from Facebook to revenue — building it from scratch',
  'Why Redis is my secret weapon for a fast admin dashboard',
  'Deploying with Docker Compose, Nginx, and PM2 — my production stack',
  'How I built a 15-step order lifecycle system for a hat cleaning business',
  'Using Zustand instead of Redux — simplicity wins in production',
  'n8n workflows replaced 3 manual processes in my client operations',
  'Building RBAC from scratch — 4 roles, granular permissions, JWT tokens',
  'The cost of running a full production app on AWS — real numbers breakdown',
  'WebSocket real-time updates across orders, warehouse, and customer displays',
  'How I structure a Node.js monorepo for multiple frontends + API',
  'From university IoT project to production SaaS — my developer journey',
]

/**
 * Generate a LinkedIn post using Claude API
 * @param {Object} options
 * @param {string} [options.topic] - Specific topic or bullet points
 * @param {string} [options.style] - Post style: 'story', 'tip', 'behind-the-scenes', 'lesson'
 * @returns {Promise<{post: string, topic: string, hashtags: string[]}>}
 */
const generatePost = async ({ topic, style = 'story' } = {}) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const client = new Anthropic({ apiKey })

  // Pick random topic if not provided
  const selectedTopic = topic || TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)]

  const styleGuide = {
    story: 'Write as a personal story/experience. Start with a hook that grabs attention.',
    tip: 'Write as a practical tip or how-to. Be specific and actionable.',
    'behind-the-scenes': 'Write as a behind-the-scenes look at building something. Show the process.',
    lesson: 'Write as a lesson learned. Be honest about mistakes and what you would do differently.',
  }

  const userPrompt = `Write a LinkedIn post about this topic: "${selectedTopic}"

Style: ${styleGuide[style] || styleGuide.story}

Remember:
- 150-250 words
- Short paragraphs with line breaks
- End with engagement question
- 3-5 hashtags at the very end
- Sound authentic, not AI-generated
- Reference real tech/tools you actually use`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const postContent = response.content[0].text

  // Extract hashtags
  const hashtagMatch = postContent.match(/#\w+/g) || []

  return {
    post: postContent,
    topic: selectedTopic,
    style,
    hashtags: hashtagMatch,
    generatedAt: new Date().toISOString(),
    model: 'claude-sonnet-4-20250514',
  }
}

/**
 * Generate a batch of posts for scheduling
 * @param {number} count - Number of posts to generate
 * @returns {Promise<Array>}
 */
const generateBatch = async (count = 5) => {
  const styles = ['story', 'tip', 'behind-the-scenes', 'lesson']
  const usedTopics = new Set()
  const posts = []

  for (let i = 0; i < count; i++) {
    // Pick unique topic
    let topic
    do {
      topic = TOPIC_POOL[Math.floor(Math.random() * TOPIC_POOL.length)]
    } while (usedTopics.has(topic) && usedTopics.size < TOPIC_POOL.length)
    usedTopics.add(topic)

    const style = styles[i % styles.length]
    const result = await generatePost({ topic, style })
    posts.push({
      ...result,
      scheduledOrder: i + 1,
    })
  }

  return posts
}

module.exports = { generatePost, generateBatch, TOPIC_POOL }
