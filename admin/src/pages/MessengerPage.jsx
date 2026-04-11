import { useState, useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'
import { conversations } from '../api/index.js'
import { usePage } from '../contexts/PageContext.jsx'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'เมื่อกี้'
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} ชม.ที่แล้ว`
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
}

function formatTimestamp(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

export default function MessengerPage() {
  const { selectedPage } = usePage()
  const [threads, setThreads] = useState([])
  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [messages, setMessages] = useState([])
  const [manualMessage, setManualMessage] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)
  const socketRef = useRef(null)

  const selectedThread = threads.find(t => t.thread_id === selectedThreadId || t.id === selectedThreadId)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    if (!selectedPage?.page_id) {
      setThreads([])
      setLoadingThreads(false)
      return
    }
    try {
      const data = await conversations.list(selectedPage.page_id)
      const raw = data.data || data || []
      setThreads(raw.map(t => ({
        ...t,
        thread_id: t.id,
        facebook_name: t.Customer?.facebook_name || t.Customer?.name || t.facebook_name || '',
        last_message: t.last_message || null,
        last_message_at: t.last_message_at || t.updatedAt,
        profile_picture_url: t.Customer?.profile_picture_url || null,
        customer_name: t.Customer?.name || t.customer_name || '',
        phone: t.Customer?.phone || t.phone || '',
        province: t.Customer?.province || t.province || '',
        platform_thread_id: t.platform_thread_id || ''
      })))
    } catch (err) {
      console.error('Failed to fetch threads:', err)
    } finally {
      setLoadingThreads(false)
    }
  }, [selectedPage?.page_id])

  // Fetch messages for selected thread
  const fetchMessages = useCallback(async (threadId) => {
    if (!threadId) return
    try {
      const data = await conversations.getMessages(threadId)
      setMessages(data.data || data || [])
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [scrollToBottom])

  // Re-fetch when selectedPage changes
  useEffect(() => {
    setSelectedThreadId(null)
    setMessages([])
    setLoadingThreads(true)
    fetchThreads()
  }, [fetchThreads, selectedPage?.page_id])

  // Socket.IO real-time connection
  useEffect(() => {
    if (!selectedPage?.page_id) return

    const socket = io('https://api.hatfixclean.com', {
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected')
      socket.emit('join_page', selectedPage.page_id)
    })

    // Listen for new messages
    socket.on('new_message', (data) => {
      console.log('[Socket.IO] new_message received:', data.thread_id, data.content?.substring(0, 30))
      // Update threads list - move this thread to top with new message
      setThreads(prev => {
        let found = false
        const updated = prev.map(t => {
          if (String(t.thread_id) === String(data.thread_id) || String(t.id) === String(data.thread_id)) {
            found = true
            return { ...t, last_message: data.content, last_message_at: new Date().toISOString(), updatedAt: new Date().toISOString() }
          }
          return t
        })
        // If thread not found, re-fetch all threads
        if (!found) {
          fetchThreads()
          return prev
        }
        // Sort: latest message first
        return [...updated].sort((a, b) => {
          const dateA = new Date(a.last_message_at || a.updatedAt || 0)
          const dateB = new Date(b.last_message_at || b.updatedAt || 0)
          return dateB - dateA
        })
      })

      // If this thread is selected, add message to messages list
      setMessages(prev => {
        if (!selectedThreadId) return prev
        if (selectedThreadId !== data.thread_id) return prev
        return [...prev, {
          id: Date.now(),
          direction: data.direction,
          content: data.content,
          created_at: data.timestamp,
          createdAt: data.timestamp
        }]
      })
    })

    // Listen for new threads
    socket.on('new_thread', () => {
      fetchThreads()
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedPage?.page_id, selectedThreadId, fetchThreads])

  // When selecting a thread
  const selectThread = (threadId) => {
    setSelectedThreadId(threadId)
    setLoadingMessages(true)
    setMessages([])
    fetchMessages(threadId)
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // AI reply
  const handleAiReply = async () => {
    if (!selectedThreadId || aiLoading) return
    setAiLoading(true)
    try {
      await conversations.aiReply(selectedThreadId)
      await fetchMessages(selectedThreadId)
      await fetchThreads()
    } catch (err) {
      console.error('AI reply failed:', err)
    } finally {
      setAiLoading(false)
    }
  }

  // Manual reply
  const handleManualReply = async (e) => {
    e.preventDefault()
    if (!selectedThreadId || !manualMessage.trim() || sending) return
    setSending(true)
    try {
      await conversations.manualReply(selectedThreadId, manualMessage.trim())
      setManualMessage('')
      await fetchMessages(selectedThreadId)
      await fetchThreads()
    } catch (err) {
      console.error('Manual reply failed:', err)
    } finally {
      setSending(false)
    }
  }

  const filteredThreads = threads.filter(t => {
    if (!searchQuery) return true
    const name = (t.facebook_name || t.customer_name || t.platform_thread_id || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  // Show prompt to select a page if none selected
  if (!selectedPage?.page_id) {
    return (
      <div className="flex h-[calc(100vh-64px)] bg-gray-100 items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-lg font-medium">กรุณาเลือกเพจ</p>
          <p className="text-sm mt-1">เลือกเพจจากเมนูด้านบนเพื่อดูข้อความ</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-100">
      {/* Left Panel - Conversation List */}
      <div className="w-80 flex-shrink-0 bg-gray-900 text-white flex flex-col border-r border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            ข้อความ Messenger
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาลูกค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 pl-9 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-red-500" />
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center text-gray-500 py-12 px-4">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm font-medium">{searchQuery ? 'ไม่พบการสนทนา' : 'ยังไม่มีการสนทนาในเพจนี้'}</p>
              {!searchQuery && <p className="text-xs mt-1 text-gray-600">เมื่อลูกค้าส่งข้อความเข้ามาจะแสดงที่นี่</p>}
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const threadId = thread.thread_id || thread.id
              const isSelected = threadId === selectedThreadId
              return (
                <div
                  key={threadId}
                  onClick={() => selectThread(threadId)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-800/50 ${
                    isSelected ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-red-600 flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm">
                    {(thread.facebook_name || thread.customer_name || '?').charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">
                        {thread.facebook_name || thread.customer_name || 'ลูกค้า'}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(thread.last_message_at || thread.updated_at)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {thread.last_message || 'ยังไม่มีข้อความ'}
                    </p>
                  </div>
                  {/* Unread indicator */}
                  {thread.unread_count > 0 && (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold">{thread.unread_count}</span>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Panel - Chat View */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedThreadId ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium">เลือกการสนทนาเพื่อเริ่มต้น</p>
            <p className="text-sm mt-1">เลือกรายชื่อลูกค้าจากด้านซ้าย</p>
          </div>
        ) : (
          <>
            {/* Customer Info Bar */}
            <div className="px-6 py-3 bg-white border-b border-gray-200 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-semibold">
                {(selectedThread?.facebook_name || selectedThread?.customer_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {selectedThread?.facebook_name || selectedThread?.customer_name || 'ลูกค้า'}
                </h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {selectedPage?.page_name && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      {selectedPage.page_name}
                    </span>
                  )}
                  {selectedThread?.province && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedThread.province}
                    </span>
                  )}
                  {selectedThread?.phone && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {selectedThread.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  ออนไลน์
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-red-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  ยังไม่มีข้อความในการสนทนานี้
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isInbound = msg.direction === 'inbound' || msg.sender === 'customer'
                  return (
                    <div key={msg.id || idx} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%]`}>
                        {/* Sender label */}
                        <div className={`text-[10px] text-gray-400 mb-0.5 ${isInbound ? 'text-left' : 'text-right'}`}>
                          {isInbound ? (selectedThread?.facebook_name || 'ลูกค้า') : (msg.sender === 'ai' ? 'AI' : 'แอดมิน')}
                        </div>
                        {/* Bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            isInbound
                              ? 'bg-gray-200 text-gray-900 rounded-bl-md'
                              : msg.sender === 'ai'
                                ? 'bg-red-500 text-white rounded-br-md'
                                : 'bg-red-600 text-white rounded-br-md'
                          }`}
                        >
                          {msg.message || msg.text || msg.content}
                        </div>
                        {/* Timestamp */}
                        <div className={`text-[10px] text-gray-400 mt-0.5 ${isInbound ? 'text-left' : 'text-right'}`}>
                          {formatTimestamp(msg.created_at || msg.timestamp)}
                          {msg.sender === 'ai' && (
                            <span className="ml-1 text-red-400">AI</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Action Bar */}
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <form onSubmit={handleManualReply} className="flex items-center gap-2">
                {/* AI Reply Button */}
                <button
                  type="button"
                  onClick={handleAiReply}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {aiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-white" />
                      <span>กำลังสร้าง...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>AI ตอบ</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

                {/* Manual Message Input */}
                <input
                  type="text"
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!manualMessage.trim() || sending}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-300 border-t-white" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  <span>ส่ง</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
