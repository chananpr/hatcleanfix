import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leads } from '../api/index.js'
import { usePage } from '../contexts/PageContext.jsx'
import StatusBadge, { LEAD_STATUSES } from '../components/common/StatusBadge.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_TABS = [
  { key: '', label: 'ทั้งหมด' },
  { key: 'new', label: 'ใหม่' },
  { key: 'contacted', label: 'ติดต่อแล้ว' },
  { key: 'waiting_photos', label: 'รอรูปภาพ' },
  { key: 'waiting_shipment', label: 'รอจัดส่ง' },
  { key: 'converted', label: 'แปลงแล้ว' },
  { key: 'lost', label: 'เสียลูกค้า' },
]

function LeadDetailModal({ lead, onClose, onStatusChange, onConvert }) {
  const [status, setStatus] = useState(lead.status)
  const [saving, setSaving] = useState(false)

  const handleStatusChange = async () => {
    setSaving(true)
    await onStatusChange(lead.id, status)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold">รายละเอียดลีด</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">ชื่อ</div>
              <div className="font-medium">{lead.name}</div>
            </div>
            <div>
              <div className="text-gray-500">เบอร์โทร</div>
              <div className="font-medium">{lead.phone}</div>
            </div>
            <div>
              <div className="text-gray-500">Facebook</div>
              <div className="font-medium">{lead.facebook_name || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">จังหวัด</div>
              <div className="font-medium">{lead.province || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">จำนวนหมวก</div>
              <div className="font-medium">{lead.hat_count} ใบ</div>
            </div>
            <div>
              <div className="text-gray-500">แคมเปญ</div>
              <div className="font-medium">{lead.campaign_source || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500">หมายเหตุ</div>
              <div className="font-medium col-span-2">{lead.notes || '—'}</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">เปลี่ยนสถานะ</label>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                {Object.entries(LEAD_STATUSES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <button
                onClick={handleStatusChange}
                disabled={saving || status === lead.status}
                className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>

          {lead.status !== 'converted' && lead.status !== 'lost' && (
            <button
              onClick={() => onConvert(lead.id)}
              className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              แปลงเป็นออเดอร์
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const qc = useQueryClient()
  const { selectedPage } = usePage()
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['leads', activeTab, search, page, selectedPage?.page_id],
    queryFn: () =>
      leads.list({ status: activeTab || undefined, search: search || undefined, page, limit: 20, page_id: selectedPage?.page_id }),
    enabled: !!selectedPage?.page_id,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => leads.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      setSelectedLead(null)
    },
  })

  const convertMutation = useMutation({
    mutationFn: (id) => leads.convert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      setSelectedLead(null)
      alert('แปลงเป็นออเดอร์สำเร็จ')
    },
  })

  const formatDate = (d) => {
    if (!d) return '—'
    try { return format(new Date(d), 'd MMM yy', { locale: th }) } catch { return d }
  }

  const items = data?.data || data?.leads || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20) || 1

  if (!selectedPage?.page_id) {
    return (
      <div>
        <PageHeader title="จัดการลีด" subtitle="" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg">กรุณาเลือกเพจจากเมนูด้านบน</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="จัดการลีด"
        subtitle={`ทั้งหมด ${total} รายการ`}
      />

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.key
                ? 'bg-brand-red text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อ เบอร์โทร..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ชื่อ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">เบอร์โทร</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">หมวก</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">จังหวัด</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">แคมเปญ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">มอบหมาย</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">วันที่</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      กำลังโหลด...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                items.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.hat_count}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.province || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} type="lead" />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{lead.campaign_source || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{lead.assigned_to_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-brand-red hover:text-red-700 text-xs font-medium"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              หน้า {page} / {totalPages} (ทั้งหมด {total} รายการ)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={(id, status) =>
            statusMutation.mutateAsync({ id, status })
          }
          onConvert={(id) => convertMutation.mutate(id)}
        />
      )}
    </div>
  )
}
