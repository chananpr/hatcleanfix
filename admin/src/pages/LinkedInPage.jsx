import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { linkedinPosts } from '../api/index.js'
import PageHeader from '../components/common/PageHeader.jsx'

const STYLES = [
  { value: 'story', label: 'Story', desc: 'เล่าเรื่องจากประสบการณ์จริง' },
  { value: 'tip', label: 'Tip', desc: 'แชร์ tips ที่ใช้งานได้จริง' },
  { value: 'behind-the-scenes', label: 'Behind the Scenes', desc: 'เบื้องหลังการสร้างระบบ' },
  { value: 'lesson', label: 'Lesson Learned', desc: 'บทเรียนจากความผิดพลาด' },
]

function PostCard({ post, index, onEdit, onCopy }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.post)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(editedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onEdit(index, editedContent)
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            #{index + 1}
          </span>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {post.style}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {post.hashtags?.length || 0} hashtags
          </span>
        </div>
      </div>

      {/* Topic */}
      <div className="px-5 pt-3">
        <p className="text-xs text-gray-400 mb-1">Topic</p>
        <p className="text-sm text-gray-600 italic">{post.topic}</p>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={12}
            className="w-full border border-blue-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          />
        ) : (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
              {editedContent}
            </pre>
          </div>
        )}
      </div>

      {/* Image Upload Area */}
      <div className="px-5 pb-3">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 mt-1">แปะรูปภาพประกอบ (optional)</p>
          <p className="text-xs text-gray-400">คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditedContent(post.post) }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
            >
              Edit
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            Post to LinkedIn
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LinkedInPage() {
  const [posts, setPosts] = useState([])
  const [customTopic, setCustomTopic] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('story')
  const [batchCount, setBatchCount] = useState(5)

  // Generate single post
  const generateMutation = useMutation({
    mutationFn: (data) => linkedinPosts.generate(data),
    onSuccess: (res) => {
      setPosts((prev) => [res.data, ...prev])
    },
  })

  // Generate batch
  const batchMutation = useMutation({
    mutationFn: (count) => linkedinPosts.generateBatch(count),
    onSuccess: (res) => {
      setPosts(res.data)
    },
  })

  // Get topics
  const { data: topicsData } = useQuery({
    queryKey: ['linkedin-topics'],
    queryFn: linkedinPosts.getTopics,
  })
  const topics = topicsData?.data || []

  const handleEditPost = (index, newContent) => {
    setPosts((prev) => prev.map((p, i) => i === index ? { ...p, post: newContent } : p))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="LinkedIn Posts"
        subtitle="สร้างและจัดการโพสต์ LinkedIn ด้วย AI"
      />

      {/* Generator Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Post</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic / Bullet Points
            </label>
            <textarea
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="เขียน bullet points สั้นๆ เช่น: วันนี้ migrate DB จาก Docker ไป AWS RDS สำเร็จ ใช้เวลา 30 นาที..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              ปล่อยว่างเพื่อให้ AI เลือก topic อัตโนมัติ
            </p>
          </div>

          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Post Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStyle(s.value)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedStyle === s.value
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{s.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => generateMutation.mutate({ topic: customTopic || undefined, style: selectedStyle })}
            disabled={generateMutation.isPending}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {generateMutation.isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                Generating...
              </>
            ) : (
              'Generate 1 Post'
            )}
          </button>

          <div className="flex items-center gap-2">
            <select
              value={batchCount}
              onChange={(e) => setBatchCount(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
            >
              {[3, 5, 7, 10].map((n) => (
                <option key={n} value={n}>{n} posts</option>
              ))}
            </select>
            <button
              onClick={() => batchMutation.mutate(batchCount)}
              disabled={batchMutation.isPending}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {batchMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Generating Batch...
                </>
              ) : (
                `Generate ${batchCount} Posts (2-3 วัน/โพสต์)`
              )}
            </button>
          </div>

          {posts.length > 0 && (
            <button
              onClick={() => setPosts([])}
              className="ml-auto px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Topic Pool */}
      {topics.length > 0 && (
        <details className="bg-white rounded-xl border border-gray-200">
          <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
            Topic Pool ({topics.length} topics) — คลิกเพื่อดู
          </summary>
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {topics.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setCustomTopic(t)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  {t.length > 60 ? t.slice(0, 60) + '...' : t}
                </button>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* Generated Posts */}
      {posts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Posts ({posts.length})
            </h3>
            <p className="text-sm text-gray-500">
              Review → Edit → แปะรูป → Post to LinkedIn
            </p>
          </div>

          {posts.map((post, index) => (
            <PostCard
              key={index}
              post={post}
              index={index}
              onEdit={handleEditPost}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !generateMutation.isPending && !batchMutation.isPending && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-700">ยังไม่มีโพสต์</h3>
          <p className="text-sm text-gray-500 mt-1">
            เขียน bullet points แล้วกด Generate หรือ Generate Batch สำหรับโพสต์ 2-3 วัน
          </p>
        </div>
      )}
    </div>
  )
}
