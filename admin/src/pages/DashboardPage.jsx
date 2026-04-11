import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboard } from '../api/index.js'
import { usePage } from '../contexts/PageContext.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

function KPICard({ icon, label, value, sub, color = 'red' }) {
  const colors = {
    red: 'bg-yellow-50 text-brand-red',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 h-28 shadow-sm border border-gray-100">
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
            <div className="h-6 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { selectedPage } = usePage()

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard', 'summary', selectedPage?.page_id],
    queryFn: () => dashboard.summary({ page_id: selectedPage?.page_id }),
    enabled: !!selectedPage?.page_id,
  })

  const { data: orderStats } = useQuery({
    queryKey: ['dashboard', 'orderStats', selectedPage?.page_id],
    queryFn: () => dashboard.orderStats({ page_id: selectedPage?.page_id }),
    enabled: !!selectedPage?.page_id,
  })

  const formatMoney = (n) =>
    n != null ? n.toLocaleString('th-TH') + ' ฿' : '—'

  const formatDate = (d) => {
    if (!d) return '—'
    try {
      return format(new Date(d), 'd MMM yy HH:mm', { locale: th })
    } catch {
      return d
    }
  }

  if (!selectedPage?.page_id) {
    return (
      <div>
        <PageHeader title="แดชบอร์ด" subtitle="ภาพรวมธุรกิจวันนี้" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-400 text-lg">กรุณาเลือกเพจจากเมนูด้านบน</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="แดชบอร์ด" subtitle="ภาพรวมธุรกิจวันนี้" />

      {loadingSummary ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              icon="📋"
              label="ลีดวันนี้"
              value={summary?.leads_today ?? 0}
              color="blue"
            />
            <KPICard
              icon="📦"
              label="ออเดอร์วันนี้"
              value={summary?.orders_today ?? 0}
              color="yellow"
            />
            <KPICard
              icon="⏳"
              label="ออเดอร์รอดำเนินการ"
              value={summary?.pending_orders ?? 0}
              color="purple"
            />
            <KPICard
              icon="💰"
              label="รายได้วันนี้"
              value={formatMoney(summary?.revenue_today)}
              sub={`เดือนนี้: ${formatMoney(summary?.revenue_month)}`}
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Order Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">สถานะออเดอร์</h3>
              {orderStats?.by_status && orderStats.by_status.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={orderStats.by_status} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#FFCC00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                  ไม่มีข้อมูล
                </div>
              )}
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-4">รายได้ 7 วันล่าสุด</h3>
              {orderStats?.revenue_7days && orderStats.revenue_7days.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={orderStats.revenue_7days} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [v.toLocaleString('th-TH') + ' ฿', 'รายได้']} />
                    <Bar dataKey="revenue" fill="#FFCC00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                  ไม่มีข้อมูล
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">ลีดล่าสุด</h3>
                <Link to="/leads" className="text-xs text-brand-red hover:underline">
                  ดูทั้งหมด
                </Link>
              </div>
              <div className="space-y-3">
                {summary?.recent_leads?.length > 0 ? (
                  summary.recent_leads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{lead.name}</div>
                        <div className="text-xs text-gray-400">{lead.phone} · {lead.hat_count} ใบ</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} type="lead" />
                        <span className="text-xs text-gray-400">{formatDate(lead.created_at)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-sm py-8">ไม่มีข้อมูลลีด</p>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">ออเดอร์ล่าสุด</h3>
                <Link to="/orders" className="text-xs text-brand-red hover:underline">
                  ดูทั้งหมด
                </Link>
              </div>
              <div className="space-y-3">
                {summary?.recent_orders?.length > 0 ? (
                  summary.recent_orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded -mx-1 px-1 transition"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          #{order.order_number}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.customer_name} · {order.hat_count} ใบ
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} type="order" />
                        <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-gray-400 text-sm py-8">ไม่มีข้อมูลออเดอร์</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
