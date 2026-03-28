import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { orders } from '../api/index.js'
import { usePage } from '../contexts/PageContext.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_TABS = [
  { key: '', label: 'ทั้งหมด' },
  { key: 'draft', label: 'ร่าง' },
  { key: 'awaiting_inbound_shipment', label: 'รอรับพัสดุ' },
  { key: 'received', label: 'รับแล้ว' },
  { key: 'in_progress', label: 'กำลังดำเนินการ' },
  { key: 'qc', label: 'QC' },
  { key: 'completed', label: 'เสร็จสิ้น' },
  { key: 'awaiting_payment', label: 'รอชำระ' },
  { key: 'paid', label: 'ชำระแล้ว' },
  { key: 'shipped', label: 'จัดส่ง' },
  { key: 'delivered', label: 'ส่งถึงแล้ว' },
  { key: 'closed', label: 'ปิด' },
]

export default function OrdersPage() {
  const navigate = useNavigate()
  const { selectedPage } = usePage()
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', activeTab, search, page, selectedPage?.page_id],
    queryFn: () =>
      orders.list({ status: activeTab || undefined, search: search || undefined, page, limit: 20, page_id: selectedPage?.page_id }),
    enabled: !!selectedPage?.page_id,
  })

  const formatDate = (d) => {
    if (!d) return '—'
    try { return format(new Date(d), 'd MMM yy', { locale: th }) } catch { return d }
  }

  const formatMoney = (n) =>
    n != null ? n.toLocaleString('th-TH') + ' ฿' : '—'

  const items = data?.data || data?.orders || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20) || 1

  if (!selectedPage?.page_id) {
    return (
      <div>
        <PageHeader title="จัดการออเดอร์" subtitle="" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg">กรุณาเลือกเพจจากเมนูด้านบน</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="จัดการออเดอร์" subtitle={`ทั้งหมด ${total} รายการ`} />

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1) }}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
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
          placeholder="ค้นหาเลขออเดอร์ ชื่อลูกค้า..."
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">เลขออเดอร์</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ลูกค้า</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">หมวก</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">การชำระ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ยอดรวม</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">มอบหมาย</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">วันที่</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
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
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                items.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-brand-red">
                      #{order.order_number}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{order.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600">{order.hat_count} ใบ</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.payment_status} type="payment" />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {formatMoney(order.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{order.assigned_to_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(order.created_at)}</td>
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
    </div>
  )
}
