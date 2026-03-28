import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { customers } from '../api/index.js'
import { usePage } from '../contexts/PageContext.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

function CustomerDetailModal({ customer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold">รายละเอียดลูกค้า</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-red/10 flex items-center justify-center text-2xl font-bold text-brand-red">
              {customer.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">{customer.name}</h4>
              <p className="text-gray-500 text-sm">{customer.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-brand-red">{customer.total_orders || 0}</div>
              <div className="text-gray-500 text-xs mt-1">ออเดอร์ทั้งหมด</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {customer.total_spent?.toLocaleString('th-TH') || 0}
              </div>
              <div className="text-gray-500 text-xs mt-1">ยอดซื้อรวม (฿)</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {[
              ['Facebook', customer.facebook_name],
              ['จังหวัด', customer.province],
              ['แคมเปญ', customer.campaign_source],
              ['สมัครเมื่อ', customer.created_at
                ? format(new Date(customer.created_at), 'd MMMM yyyy', { locale: th })
                : '—'],
              ['บันทึก', customer.notes],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800 text-right max-w-48 truncate">{val || '—'}</span>
              </div>
            ))}
          </div>

          {customer.orders?.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold text-gray-700 mb-2 text-sm">ออเดอร์ล่าสุด</h5>
              <div className="space-y-2">
                {customer.orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="flex justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-mono text-brand-red">#{o.order_number}</span>
                    <span className="text-gray-600">{o.hat_count} ใบ</span>
                    <span className="text-gray-800 font-medium">{o.total_amount?.toLocaleString('th-TH')} ฿</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const { selectedPage } = usePage()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page, selectedPage?.page_id],
    queryFn: () =>
      customers.list({ search: search || undefined, page, limit: 20, page_id: selectedPage?.page_id }),
    enabled: !!selectedPage?.page_id,
  })

  const formatDate = (d) => {
    if (!d) return '—'
    try { return format(new Date(d), 'd MMM yy', { locale: th }) } catch { return d }
  }

  const items = data?.data || data?.customers || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20) || 1

  if (!selectedPage?.page_id) {
    return (
      <div>
        <PageHeader title="ลูกค้า" subtitle="" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg">กรุณาเลือกเพจจากเมนูด้านบน</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="ลูกค้า" subtitle={`ทั้งหมด ${total} ราย`} />

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อ เบอร์โทร Facebook..."
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
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Facebook</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">จังหวัด</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ออเดอร์</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ยอดรวม</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">แคมเปญ</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">สมัครเมื่อ</th>
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
                  <td colSpan={8} className="text-center py-12 text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-500">{c.facebook_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.province || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{c.total_orders || 0}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {c.total_spent != null
                        ? c.total_spent.toLocaleString('th-TH') + ' ฿'
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{c.campaign_source || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(c.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              หน้า {page} / {totalPages} (ทั้งหมด {total} ราย)
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

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  )
}
