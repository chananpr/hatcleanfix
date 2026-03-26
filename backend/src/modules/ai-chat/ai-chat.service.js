const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const { AiChatThread, AiChatMessage, AiChatAttachment } = require('../../models')

const CLAUDE_PATH = path.join(process.env.HOME || '/home/ubuntu', '.nvm/versions/node/v24.14.0/bin/claude')
const PROJECT_DIR = '/home/ubuntu/hatcleanfix'
const UPLOAD_DIR = '/tmp/ai-chat-uploads'
const PERSISTENT_DIR = path.join(__dirname, '../../../uploads/ai-chat')

// Ensure upload dirs exist
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
if (!fs.existsSync(PERSISTENT_DIR)) fs.mkdirSync(PERSISTENT_DIR, { recursive: true })

const SYSTEM_PROMPT = `คุณคือผู้ช่วย AI developer ของ HATZ (HatFixClean) ธุรกิจบริการดูแลหมวก

ธุรกิจ:
- ซักหมวก, ดัดทรงหมวก, ซ่อมหมวก
- Flow: Lead → Order → รับหมวก → ดำเนินการ → QC → ชำระเงิน → จัดส่งคืน

โครงสร้างโปรเจกต์:
- backend/ — Express.js + Sequelize + MySQL (port 4000)
- admin/ — React + Vite + Tailwind CSS

คุณสามารถอ่านไฟล์, แก้ไขโค้ด, รันคำสั่ง, ค้นหาไฟล์ได้
เมื่อทำงาน ให้บอกว่ากำลังทำอะไร เป็นขั้นตอน
ตอบเป็นภาษาไทยเป็นหลัก ยกเว้นคำศัพท์เฉพาะทาง`

const listThreads = async (userId) => {
  return AiChatThread.findAll({
    where: { user_id: userId, is_archived: false },
    order: [['updatedAt', 'DESC']]
  })
}

const createThread = async (userId) => {
  return AiChatThread.create({ user_id: userId })
}

const getThread = async (threadId, userId) => {
  const thread = await AiChatThread.findOne({
    where: { id: threadId, user_id: userId, is_archived: false },
    include: [{
      model: AiChatMessage,
      order: [['createdAt', 'ASC']],
      include: [{ model: AiChatAttachment }]
    }]
  })
  return thread
}

const updateThread = async (threadId, userId, title) => {
  const thread = await AiChatThread.findOne({
    where: { id: threadId, user_id: userId, is_archived: false }
  })
  if (!thread) return null
  await thread.update({ title })
  return thread
}

const archiveThread = async (threadId, userId) => {
  const thread = await AiChatThread.findOne({
    where: { id: threadId, user_id: userId }
  })
  if (!thread) return false
  await thread.update({ is_archived: true })
  return true
}

const TOOL_LABELS = {
  Read: 'กำลังอ่านไฟล์',
  Edit: 'กำลังแก้ไขไฟล์',
  Write: 'กำลังเขียนไฟล์',
  Bash: 'กำลังรันคำสั่ง',
  Glob: 'กำลังค้นหาไฟล์',
  Grep: 'กำลังค้นหาในโค้ด',
  WebSearch: 'กำลังค้นหาเว็บ',
  WebFetch: 'กำลังดึงข้อมูลเว็บ',
  Agent: 'กำลังวิเคราะห์เชิงลึก',
}

/**
 * Build prompt with file attachments
 */
const buildPromptWithFiles = (content, files) => {
  if (!files || files.length === 0) return content

  let prompt = content + '\n\n'
  prompt += '--- ไฟล์แนบ ---\n'
  for (const file of files) {
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(file.originalname)
    const persistentPath = path.join(PERSISTENT_DIR, path.basename(file.path))
    if (isImage) {
      prompt += `รูปภาพ: ${file.originalname} → อ่านได้ที่ ${persistentPath}\n`
    } else {
      prompt += `ไฟล์: ${file.originalname} → อ่านได้ที่ ${persistentPath}\n`
    }
  }
  prompt += 'กรุณาใช้ Read tool เพื่ออ่านไฟล์ที่แนบมาก่อนตอบ'
  return prompt
}

/**
 * Move files to persistent storage and save attachment records
 */
const saveAttachments = async (messageId, files) => {
  if (!files || files.length === 0) return []
  const attachments = []
  for (const file of files) {
    const isImage = /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(file.originalname)
    const destPath = path.join(PERSISTENT_DIR, path.basename(file.path))
    try {
      fs.copyFileSync(file.path, destPath)
      fs.unlinkSync(file.path)
    } catch { /* if copy fails, file stays in tmp */ }
    const attachment = await AiChatAttachment.create({
      message_id: messageId,
      original_name: file.originalname,
      stored_path: `/uploads/ai-chat/${path.basename(file.path)}`,
      file_type: isImage ? 'image' : 'document',
      mime_type: file.mimetype,
      file_size: file.size
    })
    attachments.push(attachment)
  }
  return attachments
}

/**
 * Clean up temp files
 */
const cleanupFiles = (files) => {
  if (!files) return
  for (const file of files) {
    try { fs.unlinkSync(file.path) } catch { /* ignore */ }
  }
}

/**
 * Shared Claude streaming — SSE headers must already be set
 */
const streamClaudeRaw = async (thread, threadId, content, res) => {
  res.write(`data: ${JSON.stringify({ type: 'status', text: 'กำลังคิด...' })}\n\n`)

  const args = [
    '-p', content,
    '--output-format', 'stream-json',
    '--verbose',
    '--allowedTools', 'Read,Edit,Write,Bash,Glob,Grep,Agent',
    '--system-prompt', SYSTEM_PROMPT
  ]

  if (thread.claude_session_id) {
    args.push('--resume', thread.claude_session_id)
  }

  const claude = spawn(CLAUDE_PATH, args, {
    cwd: PROJECT_DIR,
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 300000
  })

  claude.stdin.end()

  let fullText = ''
  let buffer = ''
  let sessionId = thread.claude_session_id || null
  let clientDisconnected = false

  const safeSend = (data) => {
    if (!clientDisconnected && !res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }

  claude.stdout.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop()

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const json = JSON.parse(line)

        if (json.session_id && !sessionId) {
          sessionId = json.session_id
        }

        if (json.type === 'assistant') {
          if (json.message?.content) {
            for (const block of json.message.content) {
              if (block.type === 'text' && block.text) {
                const newText = block.text
                const delta = newText.slice(fullText.length)
                if (delta) {
                  fullText = newText
                  safeSend({ type: 'delta', text: delta })
                }
              }
              if (block.type === 'tool_use') {
                const toolName = block.name || ''
                const label = TOOL_LABELS[toolName] || `กำลังใช้ ${toolName}`
                let detail = ''
                if (block.input) {
                  if (block.input.file_path) {
                    detail = `: ${block.input.file_path.replace(PROJECT_DIR + '/', '')}`
                  }
                  else if (block.input.command) detail = `: ${block.input.command.substring(0, 80)}`
                  else if (block.input.pattern) detail = `: ${block.input.pattern}`
                }
                safeSend({ type: 'tool', tool: toolName, text: label + detail })
              }
            }
          }
        } else if (json.type === 'result') {
          if (json.session_id) sessionId = json.session_id
          if (json.result) fullText = json.result
        }
      } catch {
        // skip unparseable lines
      }
    }
  })

  claude.stderr.on('data', (chunk) => {
    console.error('claude stderr:', chunk.toString())
  })

  const onClose = () => {
    clientDisconnected = true
    claude.kill('SIGTERM')
  }
  res.on('close', onClose)

  return new Promise((resolve, reject) => {
    claude.on('close', async (code) => {
      res.removeListener('close', onClose)

      if (sessionId && !thread.claude_session_id) {
        await thread.update({ claude_session_id: sessionId })
      }

      const finalText = fullText.trim() || (clientDisconnected ? '(หยุดการสร้างคำตอบ)' : '(ไม่สามารถสร้างคำตอบได้ กรุณาลองใหม่)')
      const assistantMessage = await AiChatMessage.create({
        thread_id: threadId,
        role: 'assistant',
        content: finalText
      })

      await thread.changed('updatedAt', true)
      await thread.save()

      safeSend({ type: 'done', data: assistantMessage })
      if (!clientDisconnected && !res.writableEnded) {
        res.end()
      }
      resolve()
    })

    claude.on('error', (err) => {
      console.error('claude spawn error:', err)
      safeSend({ type: 'error', message: err.message })
      if (!clientDisconnected && !res.writableEnded) {
        res.end()
      }
      reject(err)
    })
  })
}

const sendMessageStream = async (threadId, userId, content, res, files) => {
  const thread = await AiChatThread.findOne({
    where: { id: threadId, user_id: userId, is_archived: false }
  })
  if (!thread) {
    cleanupFiles(files)
    return null
  }

  // Build display content (what user sees in chat) vs prompt (what Claude sees)
  const fileNames = files && files.length > 0
    ? files.map(f => f.originalname)
    : []
  const displayContent = fileNames.length > 0
    ? content + `\n\n📎 ${fileNames.join(', ')}`
    : content
  const promptContent = buildPromptWithFiles(content, files)

  // Save user message (display version)
  const userMessage = await AiChatMessage.create({
    thread_id: threadId,
    role: 'user',
    content: displayContent
  })

  // Save attachments to persistent storage
  const attachments = await saveAttachments(userMessage.id, files)
  userMessage.dataValues.AiChatAttachments = attachments

  // Auto-generate title from first message
  const messageCount = await AiChatMessage.count({ where: { thread_id: threadId } })
  if (messageCount === 1) {
    const title = content.length > 50 ? content.substring(0, 50) + '...' : content
    await thread.update({ title })
  }

  // Setup SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  })
  res.write(`data: ${JSON.stringify({ type: 'user_message', data: userMessage })}\n\n`)

  return streamClaudeRaw(thread, threadId, promptContent, res)
}

const regenerateStream = async (threadId, userId, messageId, res) => {
  const thread = await AiChatThread.findOne({
    where: { id: threadId, user_id: userId, is_archived: false }
  })
  if (!thread) return null

  const targetMsg = await AiChatMessage.findOne({
    where: { id: messageId, thread_id: threadId, role: 'assistant' }
  })
  if (!targetMsg) return 'not_found'

  const userMsg = await AiChatMessage.findOne({
    where: { thread_id: threadId, role: 'user' },
    order: [['createdAt', 'DESC']],
  })
  if (!userMsg) return 'no_user_message'

  await targetMsg.destroy()

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  })

  res.write(`data: ${JSON.stringify({ type: 'deleted_message', id: messageId })}\n\n`)

  return streamClaudeRaw(thread, threadId, userMsg.content, res)
}

module.exports = { listThreads, createThread, getThread, updateThread, archiveThread, sendMessageStream, regenerateStream }
