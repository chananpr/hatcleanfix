import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { content } from '../api/index.js'
import PageHeader from '../components/common/PageHeader.jsx'

// ─── Portfolio Tab ─────────────────────────────────────────────────────────────
function PortfolioTab() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['content', 'portfolio'],
    queryFn: content.portfolio.list,
  })

  const createMutation = useMutation({
    mutationFn: content.portfolio.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['content', 'portfolio'] }); reset(); setShowAdd(false) },
  })

  const toggleMutation = useMutation({
    mutationFn: content.portfolio.toggle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', 'portfolio'] }),
  })

  const removeMutation = useMutation({
    mutationFn: content.portfolio.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', 'portfolio'] }),
  })

  const items = data?.data || data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">รูปผลงานก่อน-หลังซ่อม</p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600"
        >
          + เพิ่มผลงาน
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <h4 className="font-semibold text-gray-700 text-sm">เพิ่มผลงานใหม่</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL รูปก่อน</label>
              <input type="url" placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('before_image_url', { required: true })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL รูปหลัง</label>
              <input type="url" placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('after_image_url', { required: true })} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">คำอธิบาย</label>
              <input type="text" placeholder="คำอธิบายผลงาน" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('caption')} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowAdd(false); reset() }} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600">ยกเลิก</button>
            <button type="submit" disabled={createMutation.isPending} className="px-3 py-1.5 bg-brand-red text-white rounded-lg text-sm font-medium disabled:opacity-60">บันทึก</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">ยังไม่มีผลงาน</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-2 gap-0">
                <div className="relative">
                  <img src={item.before_image_url} alt="ก่อน" className="w-full aspect-square object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">ก่อน</span>
                </div>
                <div className="relative">
                  <img src={item.after_image_url} alt="หลัง" className="w-full aspect-square object-cover" />
                  <span className="absolute bottom-1 left-1 bg-brand-red/80 text-white text-xs px-1.5 py-0.5 rounded">หลัง</span>
                </div>
              </div>
              {item.caption && (
                <div className="px-3 py-2 text-xs text-gray-600">{item.caption}</div>
              )}
              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                <button
                  onClick={() => toggleMutation.mutate(item.id)}
                  className={`text-xs font-medium ${item.is_published ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {item.is_published ? '● เผยแพร่' : '○ ซ่อน'}
                </button>
                <button
                  onClick={() => { if (confirm('ลบผลงานนี้?')) removeMutation.mutate(item.id) }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Testimonials Tab ──────────────────────────────────────────────────────────
function TestimonialsTab() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['content', 'testimonials'],
    queryFn: content.testimonials.list,
  })

  const createMutation = useMutation({
    mutationFn: content.testimonials.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['content', 'testimonials'] }); reset(); setShowAdd(false) },
  })

  const toggleMutation = useMutation({
    mutationFn: content.testimonials.toggle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', 'testimonials'] }),
  })

  const removeMutation = useMutation({
    mutationFn: content.testimonials.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content', 'testimonials'] }),
  })

  const items = data?.data || data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">รีวิวจากลูกค้า</p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600"
        >
          + เพิ่มรีวิว
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <h4 className="font-semibold text-gray-700 text-sm">เพิ่มรีวิวใหม่</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">ชื่อลูกค้า</label>
              <input type="text" placeholder="ชื่อ" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('customer_name', { required: true })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">คะแนน (1-5)</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('rating')}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ดาว</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">ข้อความรีวิว</label>
              <textarea rows={3} placeholder="รีวิว..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" {...register('content_text', { required: true })} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL รูป (ถ้ามี)</label>
              <input type="url" placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('image_url')} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowAdd(false); reset() }} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600">ยกเลิก</button>
            <button type="submit" disabled={createMutation.isPending} className="px-3 py-1.5 bg-brand-red text-white rounded-lg text-sm font-medium disabled:opacity-60">บันทึก</button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">ยังไม่มีรีวิว</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {item.image_url && (
                  <img src={item.image_url} alt={item.customer_name} className="w-10 h-10 rounded-full object-cover" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-800">{item.customer_name}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < item.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{item.content_text}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                <button
                  onClick={() => toggleMutation.mutate(item.id)}
                  className={`text-xs font-medium ${item.is_published ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {item.is_published ? '● เผยแพร่' : '○ ซ่อน'}
                </button>
                <button
                  onClick={() => { if (confirm('ลบรีวิวนี้?')) removeMutation.mutate(item.id) }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab() {
  const qc = useQueryClient()
  const { register, handleSubmit, reset } = useForm()
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['content', 'settings'],
    queryFn: content.settings.get,
    onSuccess: (d) => reset(d),
  })

  const saveMutation = useMutation({
    mutationFn: content.settings.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['content', 'settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  if (isLoading) {
    return <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-lg" />)}</div>
  }

  return (
    <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h4 className="font-semibold text-gray-800">ข้อมูลติดต่อ</h4>
        {[
          { name: 'phone', label: 'เบอร์โทรศัพท์', placeholder: '0xx-xxx-xxxx' },
          { name: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
          { name: 'line_id', label: 'LINE ID', placeholder: '@hatzhatfix' },
          { name: 'email', label: 'อีเมล', placeholder: 'contact@hatfixclean.com' },
          { name: 'address', label: 'ที่อยู่', placeholder: 'ที่อยู่ร้าน' },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
            <input
              type="text"
              placeholder={f.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              {...register(f.name)}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h4 className="font-semibold text-gray-800">บัญชีธนาคาร</h4>
        {[
          { name: 'bank_name_1', label: 'ธนาคาร 1', placeholder: 'กสิกรไทย' },
          { name: 'bank_account_1', label: 'เลขบัญชี 1', placeholder: 'xxx-x-xxxxx-x' },
          { name: 'bank_name_2', label: 'ธนาคาร 2', placeholder: 'กรุงไทย' },
          { name: 'bank_account_2', label: 'เลขบัญชี 2', placeholder: 'xxx-x-xxxxx-x' },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
            <input
              type="text"
              placeholder={f.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              {...register(f.name)}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h4 className="font-semibold text-gray-800">เวลาทำการ</h4>
        {[
          { name: 'hours_weekday', label: 'วันธรรมดา', placeholder: 'จ-ศ 09:00-18:00' },
          { name: 'hours_weekend', label: 'วันหยุด', placeholder: 'ส-อา 09:00-17:00' },
        ].map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
            <input
              type="text"
              placeholder={f.placeholder}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              {...register(f.name)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="px-6 py-2.5 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
        >
          {saveMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
        {saved && (
          <span className="text-green-600 text-sm font-medium">บันทึกสำเร็จ ✓</span>
        )}
      </div>
    </form>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'portfolio', label: 'ผลงาน (Portfolio)' },
  { key: 'testimonials', label: 'รีวิว' },
  { key: 'settings', label: 'ตั้งค่าเว็บไซต์' },
]

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('portfolio')

  return (
    <div>
      <PageHeader title="จัดการคอนเทนต์" subtitle="ผลงาน รีวิว และการตั้งค่าเว็บไซต์" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              activeTab === tab.key
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'portfolio' && <PortfolioTab />}
      {activeTab === 'testimonials' && <TestimonialsTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  )
}
