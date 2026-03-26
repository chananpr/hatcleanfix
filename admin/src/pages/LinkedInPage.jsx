import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { linkedinPosts } from '../api/index.js'
import PageHeader from '../components/common/PageHeader.jsx'

const STYLES = [
  { value: 'story', label: 'Story', desc: 'เล่าเรื่องจากประสบการณ์จริง' },
  { value: 'tip', label: 'Tip', desc: 'แชร์ tips ที่ใช้งานได้จริง' },
  { value: 'behind-the-scenes', label: 'Behind the Scenes', desc: 'เบื้องหลังการสร้างระบบ' },
  { value: 'lesson', label: 'Lesson Learned', desc: 'บทเรียนจากความผิดพลาด' },
]

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  approved: 'bg-blue-100 text-blue-700',
  posted: 'bg-green-100 text-green-700',
  skipped: 'bg-red-100 text-red-700',
}

function SavedPostCard({ post, onStatusChange, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(post.content)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={'rounded-xl border overflow-hidden ' + (post.status === 'posted' ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white')}>
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={'px-2.5 py-0.5 rounded-full text-xs font-semibold ' + (STATUS_COLORS[post.status] || STATUS_COLORS.draft)}>
            {post.status === 'posted' ? '✅ Posted' : post.status === 'approved' ? '👍 Approved' : post.status === 'skipped' ? '⏭ Skipped' : '📝 Draft'}
          </span>
          <span className="text-xs text-gray-500 uppercase tracking-wide">{post.style}</span>
          {post.posted_at && <span className="text-xs text-green-600">Posted: {new Date(post.posted_at).toLocaleDateString('th-TH')}</span>}
        </div>
        <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('th-TH')}</span>
      </div>

      {post.topic && (
        <div className="px-5 pt-3">
          <p className="text-xs text-gray-400">Topic: <span className="text-gray-600 italic">{post.topic}</span></p>
        </div>
      )}

      <div className="px-5 py-4">
        {editing ? (
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
            className="w-full border border-blue-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 resize-y" />
        ) : (
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-lg p-4">
            {content}
          </pre>
        )}
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => { onStatusChange(post.id, 'draft', content); setEditing(false) }}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">Save</button>
              <button onClick={() => { setContent(post.content); setEditing(false) }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300">Cancel</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300">Edit</button>
          )}
          <button onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300">
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>

        <div className="flex gap-2">
          {post.status !== 'posted' && (
            <button onClick={() => onStatusChange(post.id, 'posted')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">
              ✅ Mark as Posted
            </button>
          )}
          {post.status !== 'approved' && post.status !== 'posted' && (
            <button onClick={() => onStatusChange(post.id, 'approved')}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
              👍 Approve
            </button>
          )}
          {post.status !== 'skipped' && post.status !== 'posted' && (
            <button onClick={() => onStatusChange(post.id, 'skipped')}
              className="px-3 py-1.5 bg-gray-400 text-white rounded-lg text-xs hover:bg-gray-500">
              ⏭ Skip
            </button>
          )}
          {post.status === 'posted' && (
            <button onClick={() => onStatusChange(post.id, 'draft')}
              className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-300">
              ↩ Back to Draft
            </button>
          )}
          <button onClick={() => onDelete(post.id)}
            className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs hover:bg-red-200">
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LinkedInPage() {
  const qc = useQueryClient()
  const [customTopic, setCustomTopic] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('story')
  const [batchCount, setBatchCount] = useState(5)
  const [filter, setFilter] = useState('all')

  // Fetch saved posts
  const { data: savedData, isLoading } = useQuery({
    queryKey: ['linkedin-posts'],
    queryFn: linkedinPosts.list,
  })
  const savedPosts = savedData?.data || []

  // Generate single
  const generateMutation = useMutation({
    mutationFn: (data) => linkedinPosts.generate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['linkedin-posts'] }),
  })

  // Generate batch
  const batchMutation = useMutation({
    mutationFn: (count) => linkedinPosts.generateBatch(count),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['linkedin-posts'] }),
  })

  // Update status
  const statusMutation = useMutation({
    mutationFn: ({ id, status, content }) => {
      if (content) linkedinPosts.update(id, { content })
      return linkedinPosts.updateStatus(id, { status })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['linkedin-posts'] }),
  })

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id) => linkedinPosts.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['linkedin-posts'] }),
  })

  // Topics
  const { data: topicsData } = useQuery({
    queryKey: ['linkedin-topics'],
    queryFn: linkedinPosts.getTopics,
  })
  const topics = topicsData?.data || []

  const handleStatusChange = (id, status, content) => {
    statusMutation.mutate({ id, status, content })
  }

  const filteredPosts = filter === 'all' ? savedPosts : savedPosts.filter((p) => p.status === filter)

  // Stats
  const stats = {
    total: savedPosts.length,
    draft: savedPosts.filter((p) => p.status === 'draft').length,
    approved: savedPosts.filter((p) => p.status === 'approved').length,
    posted: savedPosts.filter((p) => p.status === 'posted').length,
  }

  return (
    <div className="space-y-6">
      <PageHeader title="LinkedIn Posts" subtitle="สร้างและจัดการโพสต์ LinkedIn ด้วย AI" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'ทั้งหมด', value: stats.total, color: 'bg-gray-100 text-gray-800', f: 'all' },
          { label: 'Draft', value: stats.draft, color: 'bg-yellow-100 text-yellow-800', f: 'draft' },
          { label: 'Approved', value: stats.approved, color: 'bg-blue-100 text-blue-800', f: 'approved' },
          { label: 'Posted ✅', value: stats.posted, color: 'bg-green-100 text-green-800', f: 'posted' },
        ].map((s) => (
          <button key={s.f} onClick={() => setFilter(s.f)}
            className={'rounded-xl p-4 text-center transition-all ' + s.color + (filter === s.f ? ' ring-2 ring-offset-2 ring-gray-400' : '')}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-1">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Generator */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Post</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Bullet Points</label>
            <textarea value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="เขียน bullet points สั้นๆ หรือ paste GitHub commit message..."
              rows={3} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 resize-none" />
            <p className="text-xs text-gray-400 mt-1">ปล่อยว่างเพื่อให้ AI เลือก topic อัตโนมัติ / Paste จาก GitHub ได้</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button key={s.value} onClick={() => setSelectedStyle(s.value)}
                  className={'p-2.5 rounded-lg border text-left transition-all ' +
                    (selectedStyle === s.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300')}>
                  <span className="text-sm font-medium text-gray-900">{s.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
          <button onClick={() => generateMutation.mutate({ topic: customTopic || undefined, style: selectedStyle })}
            disabled={generateMutation.isPending}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {generateMutation.isPending ? '⏳ Generating...' : '✨ Generate 1 Post'}
          </button>
          <div className="flex items-center gap-2">
            <select value={batchCount} onChange={(e) => setBatchCount(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
              {[3, 5, 7, 10].map((n) => (<option key={n} value={n}>{n} posts</option>))}
            </select>
            <button onClick={() => batchMutation.mutate(batchCount)}
              disabled={batchMutation.isPending}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">
              {batchMutation.isPending ? '⏳ Generating...' : '🚀 Generate Batch'}
            </button>
          </div>
        </div>
      </div>

      {/* Topic Pool */}
      {topics.length > 0 && (
        <details className="bg-white rounded-xl border border-gray-200">
          <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-gray-700">
            Topic Pool ({topics.length}) — คลิกเพื่อดู
          </summary>
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {topics.map((t, i) => (
              <button key={i} onClick={() => setCustomTopic(t)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-blue-50 hover:text-blue-700">
                {t.length > 60 ? t.slice(0, 60) + '...' : t}
              </button>
            ))}
          </div>
        </details>
      )}

      {/* Saved Posts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {filter === 'all' ? 'All Posts' : filter.charAt(0).toUpperCase() + filter.slice(1) + ' Posts'} ({filteredPosts.length})
        </h3>

        {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}

        {filteredPosts.map((post) => (
          <SavedPostCard key={post.id} post={post}
            onStatusChange={handleStatusChange}
            onDelete={(id) => deleteMutation.mutate(id)} />
        ))}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">ยังไม่มีโพสต์ — กด Generate เพื่อเริ่มสร้าง!</p>
          </div>
        )}
      </div>
    </div>
  )
}
