import { useState, useEffect, useRef, useCallback } from 'react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { aiChat } from '../api/index.js'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.hatfixclean.com'

const TOOL_ICONS = {
  Read: '📄', Edit: '✏️', Write: '📝', Bash: '⚡',
  Glob: '🔍', Grep: '🔎', Agent: '🤖',
  WebSearch: '🌐', WebFetch: '🌐',
}

const LANG_LABELS = {
  js: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', tsx: 'TSX',
  py: 'Python', python: 'Python', rb: 'Ruby', go: 'Go',
  java: 'Java', cpp: 'C++', c: 'C', cs: 'C#',
  html: 'HTML', css: 'CSS', scss: 'SCSS', json: 'JSON',
  yaml: 'YAML', yml: 'YAML', xml: 'XML', sql: 'SQL',
  bash: 'Bash', sh: 'Shell', zsh: 'Shell',
  dockerfile: 'Dockerfile', docker: 'Docker',
  markdown: 'Markdown', md: 'Markdown',
  javascript: 'JavaScript', typescript: 'TypeScript',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, '')
  const lang = language || ''
  const label = LANG_LABELS[lang] || lang.toUpperCase() || 'CODE'

  return (
    <div className="rounded-lg overflow-hidden my-3 border border-gray-700">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs text-gray-400 font-mono">{label}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={lang || 'text'}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, background: '#1e1e2e', fontSize: '0.75rem', padding: '0.75rem', overflowX: 'auto' }}
        showLineNumbers={code.split('\n').length > 3}
        lineNumberStyle={{ color: '#4a4a5a', fontSize: '0.7rem', minWidth: '2em' }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

const markdownComponents = {
  code({ inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    if (!inline && (match || String(children).includes('\n'))) {
      return <CodeBlock language={match?.[1]}>{children}</CodeBlock>
    }
    return (
      <code className="text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 px-1.5 py-0.5 rounded text-[0.85em] font-mono" {...props}>
        {children}
      </code>
    )
  },
  pre({ children }) {
    return <>{children}</>
  }
}

function ImageLightbox({ src, alt, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 text-lg">&times;</button>
      <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
    </div>
  )
}

function AttachmentGallery({ attachments }) {
  const [lightbox, setLightbox] = useState(null)
  if (!attachments || attachments.length === 0) return null

  const images = attachments.filter(a => a.file_type === 'image')
  const docs = attachments.filter(a => a.file_type !== 'image')

  return (
    <>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map(img => (
            <img
              key={img.id}
              src={`${API_URL}${img.stored_path}`}
              alt={img.original_name}
              className="max-w-[120px] max-h-[90px] sm:max-w-[200px] sm:max-h-[150px] rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-200 dark:border-gray-600"
              onClick={() => setLightbox(img)}
            />
          ))}
        </div>
      )}
      {docs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {docs.map(doc => (
            <a
              key={doc.id}
              href={`${API_URL}${doc.stored_path}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              📄 {doc.original_name}
            </a>
          ))}
        </div>
      )}
      {lightbox && (
        <ImageLightbox
          src={`${API_URL}${lightbox.stored_path}`}
          alt={lightbox.original_name}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}

function ChatBubble({ role, content, attachments, isLast, loading, onRetry }) {
  const isUser = role === 'user'
  const isAssistant = role === 'assistant'
  return (
    <div className={`group/msg flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold mr-1.5 sm:mr-2 flex-shrink-0 mt-1">
          AI
        </div>
      )}
      <div className="flex flex-col max-w-[88%] sm:max-w-[80%] lg:max-w-[75%]">
        <div
          className={`rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm ${
            isUser
              ? 'bg-gray-900 dark:bg-gray-700 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
          }`}
        >
          {isUser && <AttachmentGallery attachments={attachments} />}
          {isUser ? (
            <span className="whitespace-pre-wrap">{content}</span>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-0 prose-code:before:content-none prose-code:after:content-none">
              <Markdown components={markdownComponents}>{content}</Markdown>
            </div>
          )}
        </div>
        {isAssistant && isLast && !loading && onRetry && (
          <div className="flex items-center gap-1 mt-1 ml-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="สร้างคำตอบใหม่"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              <span>สร้างใหม่</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ToolActivity({ activities }) {
  if (!activities.length) return null
  return (
    <div className="flex justify-start">
      <div className="w-7 h-7 sm:w-8 sm:h-8 mr-1.5 sm:mr-2 flex-shrink-0" /> {/* spacer for avatar alignment */}
      <div className="space-y-1 max-w-[88%] sm:max-w-[80%] lg:max-w-[75%]">
        {activities.map((act, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all ${
              i === activities.length - 1
                ? 'bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
            }`}
          >
            <span>{TOOL_ICONS[act.tool] || '⚙️'}</span>
            <span className="truncate">{act.text}</span>
            {i === activities.length - 1 && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse ml-auto flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusIndicator({ text }) {
  return (
    <div className="flex justify-start">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-1.5 sm:mr-2 flex-shrink-0">
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" strokeLinecap="round" />
        </svg>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        {text}
      </div>
    </div>
  )
}

function StreamingBubble({ text }) {
  return (
    <div className="flex justify-start">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold mr-1.5 sm:mr-2 flex-shrink-0 mt-1">
        AI
      </div>
      <div className="max-w-[88%] sm:max-w-[80%] lg:max-w-[75%] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md px-3 py-2.5 sm:px-4 sm:py-3 text-sm">
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:my-0 prose-code:before:content-none prose-code:after:content-none">
          <Markdown components={markdownComponents}>{text}</Markdown>
        </div>
        <span className="inline-block w-1.5 h-4 bg-violet-400 ml-0.5 animate-pulse align-middle rounded-sm" />
      </div>
    </div>
  )
}

export default function AiChatPage() {
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [statusText, setStatusText] = useState('')
  const [toolActivities, setToolActivities] = useState([])
  const [threadsLoading, setThreadsLoading] = useState(true)
  const [editingThreadId, setEditingThreadId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const dragCountRef = useRef(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const editInputRef = useRef(null)
  const abortRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, streamingText, statusText, toolActivities, scrollToBottom])
  useEffect(() => { loadThreads() }, [])

  const loadThreads = async () => {
    try {
      setThreadsLoading(true)
      const res = await aiChat.listThreads()
      setThreads(res.data || [])
    } catch (err) {
      console.error('Failed to load threads:', err)
    } finally {
      setThreadsLoading(false)
    }
  }

  const selectThread = async (threadId) => {
    if (loading) return
    setActiveThreadId(threadId)
    setSidebarOpen(false)
    try {
      const res = await aiChat.getThread(threadId)
      setMessages(res.data?.AiChatMessages || [])
    } catch (err) {
      console.error('Failed to load thread:', err)
    }
  }

  const handleNewThread = async () => {
    if (loading) return
    try {
      const res = await aiChat.createThread()
      const thread = res.data
      setThreads((prev) => [thread, ...prev])
      setActiveThreadId(thread.id)
      setMessages([])
      setTimeout(() => inputRef.current?.focus(), 100)
    } catch (err) {
      console.error('Failed to create thread:', err)
    }
  }

  const handleDeleteThread = async (e, threadId) => {
    e.stopPropagation()
    if (!confirm('ต้องการลบสนทนานี้?')) return
    try {
      await aiChat.deleteThread(threadId)
      setThreads((prev) => prev.filter((t) => t.id !== threadId))
      if (activeThreadId === threadId) {
        setActiveThreadId(null)
        setMessages([])
      }
    } catch (err) {
      console.error('Failed to delete thread:', err)
    }
  }

  const startEditThread = (e, thread) => {
    e.stopPropagation()
    setEditingThreadId(thread.id)
    setEditingTitle(thread.title)
    setTimeout(() => editInputRef.current?.focus(), 50)
  }

  const handleRenameThread = async (threadId) => {
    const trimmed = editingTitle.trim()
    if (!trimmed) {
      setEditingThreadId(null)
      return
    }
    try {
      await aiChat.updateThread(threadId, trimmed)
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, title: trimmed } : t))
      )
    } catch (err) {
      console.error('Failed to rename thread:', err)
    } finally {
      setEditingThreadId(null)
    }
  }

  const handleEditKeyDown = (e, threadId) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleRenameThread(threadId)
    } else if (e.key === 'Escape') {
      setEditingThreadId(null)
    }
  }

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files || [])
    setAttachedFiles((prev) => [...prev, ...newFiles].slice(0, 5))
    e.target.value = ''
  }

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current++
    if (dragCountRef.current === 1) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current--
    if (dragCountRef.current === 0) setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCountRef.current = 0
    setIsDragging(false)
    if (loading) return
    const droppedFiles = Array.from(e.dataTransfer.files || [])
    if (droppedFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...droppedFiles].slice(0, 5))
    }
  }

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || loading) return
    let threadId = activeThreadId

    if (!threadId) {
      try {
        const res = await aiChat.createThread()
        const thread = res.data
        setThreads((prev) => [thread, ...prev])
        setActiveThreadId(thread.id)
        threadId = thread.id
      } catch (err) {
        console.error('Failed to create thread:', err)
        return
      }
    }

    const filesToSend = [...attachedFiles]
    await sendToThread(threadId, input.trim(), filesToSend)
  }

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  const sendToThread = async (threadId, content, files = []) => {
    setInput('')
    setAttachedFiles([])
    setLoading(true)
    setStreamingText('')
    setStatusText('กำลังเชื่อมต่อ...')
    setToolActivities([])

    const token = localStorage.getItem('hatz_token')
    const controller = new AbortController()
    abortRef.current = controller

    let accumulatedText = ''

    // Use FormData to support file uploads
    const formData = new FormData()
    formData.append('content', content || '(ดูไฟล์แนบ)')
    for (const file of files) {
      formData.append('files', file)
    }

    try {
      const response = await fetch(`${API_URL}/api/ai-chat/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'user_message') {
              setMessages((prev) => [...prev, event.data])
            } else if (event.type === 'status') {
              setStatusText(event.text)
            } else if (event.type === 'tool') {
              setToolActivities((prev) => [...prev, { tool: event.tool, text: event.text }])
              setStatusText('')
            } else if (event.type === 'delta') {
              setStatusText('')
              setToolActivities([])
              accumulatedText += event.text
              setStreamingText(accumulatedText)
            } else if (event.type === 'done') {
              setStreamingText('')
              setStatusText('')
              setToolActivities([])
              setMessages((prev) => [...prev, event.data])
              loadThreads()
            } else if (event.type === 'error') {
              console.error('AI error:', event.message)
              setStatusText('')
              setToolActivities([])
              alert('เกิดข้อผิดพลาด: ' + event.message)
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // User stopped generation — save partial text as a message
        if (accumulatedText.trim()) {
          setMessages((prev) => [...prev, {
            id: `stopped-${Date.now()}`,
            role: 'assistant',
            content: accumulatedText.trim() + '\n\n---\n*หยุดการสร้างคำตอบ*'
          }])
        }
      } else {
        console.error('Failed to send message:', err)
        alert('ไม่สามารถส่งข้อความได้ กรุณาลองใหม่')
      }
    } finally {
      abortRef.current = null
      setLoading(false)
      setStreamingText('')
      setStatusText('')
      setToolActivities([])
    }
  }

  const handleRegenerate = async (messageId) => {
    if (loading || !activeThreadId) return

    setLoading(true)
    setStreamingText('')
    setStatusText('กำลังสร้างคำตอบใหม่...')
    setToolActivities([])

    const token = localStorage.getItem('hatz_token')
    const controller = new AbortController()
    abortRef.current = controller

    let accumulatedText = ''

    try {
      const response = await fetch(`${API_URL}/api/ai-chat/threads/${activeThreadId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageId }),
        signal: controller.signal
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6))

            if (event.type === 'deleted_message') {
              // Remove old assistant message from local state
              setMessages((prev) => prev.filter((m) => m.id !== event.id && m.id !== messageId))
            } else if (event.type === 'status') {
              setStatusText(event.text)
            } else if (event.type === 'tool') {
              setToolActivities((prev) => [...prev, { tool: event.tool, text: event.text }])
              setStatusText('')
            } else if (event.type === 'delta') {
              setStatusText('')
              setToolActivities([])
              accumulatedText += event.text
              setStreamingText(accumulatedText)
            } else if (event.type === 'done') {
              setStreamingText('')
              setStatusText('')
              setToolActivities([])
              setMessages((prev) => [...prev, event.data])
              loadThreads()
            } else if (event.type === 'error') {
              console.error('AI error:', event.message)
              setStatusText('')
              setToolActivities([])
              alert('เกิดข้อผิดพลาด: ' + event.message)
            }
          } catch {
            // skip
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        if (accumulatedText.trim()) {
          setMessages((prev) => [...prev, {
            id: `stopped-${Date.now()}`,
            role: 'assistant',
            content: accumulatedText.trim() + '\n\n---\n*หยุดการสร้างคำตอบ*'
          }])
        }
      } else {
        console.error('Failed to regenerate:', err)
        alert('ไม่สามารถสร้างคำตอบใหม่ได้ กรุณาลองใหม่')
      }
    } finally {
      abortRef.current = null
      setLoading(false)
      setStreamingText('')
      setStatusText('')
      setToolActivities([])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.6)*2)] -m-6 bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900 flex-shrink-0
        transform transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <button
            onClick={handleNewThread}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors text-sm font-medium disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            สนทนาใหม่
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threadsLoading ? (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">กำลังโหลด...</div>
          ) : threads.length === 0 ? (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">ยังไม่มีสนทนา</div>
          ) : (
            <div className="py-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => selectThread(thread.id)}
                  className={`group flex items-center gap-2 px-4 py-3 cursor-pointer text-sm transition-colors ${
                    activeThreadId === thread.id
                      ? 'bg-red-50 dark:bg-brand-red/10 text-gray-900 dark:text-white border-r-2 border-brand-red'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 opacity-50">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {editingThreadId === thread.id ? (
                    <input
                      ref={editInputRef}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, thread.id)}
                      onBlur={() => handleRenameThread(thread.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                      maxLength={100}
                    />
                  ) : (
                    <span className="flex-1 truncate" onDoubleClick={(e) => startEditThread(e, thread)}>
                      {thread.title}
                    </span>
                  )}
                  {editingThreadId !== thread.id && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => startEditThread(e, thread)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-violet-600 transition-all"
                        title="แก้ไขชื่อ"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteThread(e, thread.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-all"
                        title="ลบ"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className="flex-1 flex flex-col min-w-0 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Mobile header bar */}
        <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {threads.find(t => t.id === activeThreadId)?.title || 'AI แชท'}
          </span>
        </div>

        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-30 bg-violet-500/10 border-2 border-dashed border-violet-400 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-violet-500 mb-3">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-violet-600 dark:text-violet-400 font-medium">วางไฟล์ที่นี่</p>
              <p className="text-violet-400 dark:text-violet-500 text-xs mt-1">สูงสุด 5 ไฟล์, 10MB ต่อไฟล์</p>
            </div>
          </div>
        )}
        {!activeThreadId && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-500 sm:w-9 sm:h-9">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">AI แชท</h3>
              <p className="text-gray-400 dark:text-gray-500 text-sm mb-2">Claude AI พร้อมช่วยงานทุกอย่าง</p>
              <p className="text-gray-300 dark:text-gray-600 text-xs mb-6">อ่านไฟล์ / แก้โค้ด / รันคำสั่ง / ค้นหา</p>
              <button
                onClick={handleNewThread}
                className="px-5 py-2.5 bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors text-sm font-medium"
              >
                เริ่มสนทนาใหม่
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
              {messages.map((msg, idx) => (
                <ChatBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  attachments={msg.AiChatAttachments}
                  isLast={idx === messages.length - 1}
                  loading={loading}
                  onRetry={msg.role === 'assistant' ? () => handleRegenerate(msg.id) : undefined}
                />
              ))}

              {/* Tool activity log */}
              {toolActivities.length > 0 && <ToolActivity activities={toolActivities} />}

              {/* Streaming AI response */}
              {streamingText && <StreamingBubble text={streamingText} />}

              {/* Status indicator (before any tool/text) */}
              {loading && !streamingText && !toolActivities.length && statusText && (
                <StatusIndicator text={statusText} />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2 sm:p-3 lg:p-4 bg-white dark:bg-gray-800">
              <div className="max-w-4xl mx-auto">
                {/* File preview chips */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                    {attachedFiles.map((file, i) => {
                      const isImage = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(file.name)
                      return (
                        <div key={i} className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg text-xs text-violet-700 dark:text-violet-300">
                          <span>{isImage ? '🖼️' : '📄'}</span>
                          <span className="max-w-[80px] sm:max-w-[150px] truncate">{file.name}</span>
                          <span className="text-violet-400 hidden sm:inline">({(file.size / 1024).toFixed(0)}KB)</span>
                          <button
                            onClick={() => removeFile(i)}
                            className="ml-0.5 p-0.5 rounded hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex items-end gap-1.5 sm:gap-2">
                  {/* Attach button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.md,.js,.jsx,.ts,.tsx,.json,.csv,.html,.css,.sql,.py,.log,.env,.yml,.yaml,.xml,.sh"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || attachedFiles.length >= 5}
                    className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="แนบไฟล์ (สูงสุด 5 ไฟล์, 10MB ต่อไฟล์)"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>

                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="พิมพ์ข้อความ..."
                    rows={1}
                    disabled={loading}
                    className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2.5 sm:px-4 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-400 transition-colors"
                    style={{ maxHeight: '120px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                  />

                  {loading ? (
                    <button
                      onClick={handleStop}
                      className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                      title="หยุดการสร้างคำตอบ"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="4" y="4" width="16" height="16" rx="2" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() && attachedFiles.length === 0}
                      className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-brand-red text-white rounded-xl hover:bg-brand-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
