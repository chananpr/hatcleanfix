import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { dashboard } from '../api/index.js'
import PageHeader from '../components/common/PageHeader.jsx'
import { format, subDays } from 'date-fns'

export default function AttributionPage() {
  const [campaignNames, setCampaignNames] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  
  // Fetch campaign name mappings
  const { } = useQuery({
    queryKey: ['campaignNames'],
    queryFn: async () => {
      try {
        const res = await fetch('https://api.hatfixclean.com/api/campaigns/names', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('hatz_token') }
        })
        const data = await res.json()
        setCampaignNames(data.data || {})
        return data.data || {}
      } catch(e) { return {} }
    }
  })
  
  const saveCampaignName = async (id, name) => {
    try {
      await fetch('https://api.hatfixclean.com/api/campaigns/names', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('hatz_token') },
        body: JSON.stringify({ id, name })
      })
      setCampaignNames(prev => ({ ...prev, [id]: name }))
      setEditingId(null)
    } catch(e) {}
  }

  const today = new Date()
  const [dateFrom, setDateFrom] = useState(
    format(subDays(today, 29), 'yyyy-MM-dd')
  )
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'))

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'attribution', dateFrom, dateTo],
    queryFn: () =>
      dashboard.attribution({ date_from: dateFrom, date_to: dateTo }),
  })

  const campaigns = data?.campaigns || []
  const summary = data?.summary || {}

  const formatMoney = (n) =>
    n != null ? n.toLocaleString('th-TH') : '—'

  const convRate = (leads, orders) => {
    if (!leads || leads === 0) return '0%'
    return ((orders / leads) * 100).toFixed(1) + '%'
  }

  return (
    <div>
      <PageHeader
        title="การตลาด & Attribution"
        subtitle="ติดตามผลแคมเปญการตลาด"
      />

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">ช่วงเวลา:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
            <span className="text-gray-400">ถึง</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          <div className="flex gap-2">
            {[
              { label: '7 วัน', days: 7 },
              { label: '30 วัน', days: 30 },
              { label: '90 วัน', days: 90 },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => {
                  setDateFrom(format(subDays(today, p.days - 1), 'yyyy-MM-dd'))
                  setDateTo(format(today, 'yyyy-MM-dd'))
                }}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'ลีดทั้งหมด', value: formatMoney(summary.total_leads), icon: '📋', color: 'blue' },
          { label: 'ออเดอร์ทั้งหมด', value: formatMoney(summary.total_orders), icon: '📦', color: 'yellow' },
          { label: 'รายได้รวม', value: formatMoney(summary.total_revenue) + ' ฿', icon: '💰', color: 'green' },
          { label: 'อัตราแปลงรวม', value: convRate(summary.total_leads, summary.total_orders), icon: '📈', color: 'purple' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{isLoading ? '—' : k.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {!isLoading && campaigns.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">ลีดและออเดอร์ต่อแคมเปญ</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={campaigns} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="campaign" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads_count" name="ลีด" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="orders_count" name="ออเดอร์" fill="#FF0000" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">รายละเอียดตามแคมเปญ</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">แคมเปญ</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ลีด</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">ออเดอร์</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">รายได้</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">อัตราแปลง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      กำลังโหลด...
                    </div>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    ไม่มีข้อมูลในช่วงเวลานี้
                  </td>
                </tr>
              ) : (
                campaigns.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {editingId === c.campaign ? (
                        <div className="flex items-center gap-2">
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="border rounded px-2 py-1 text-sm w-40" autoFocus onKeyDown={e => { if (e.key === 'Enter') saveCampaignName(c.campaign, editName); if (e.key === 'Escape') setEditingId(null) }} />
                          <button onClick={() => saveCampaignName(c.campaign, editName)} className="text-green-600 text-xs">✓</button>
                          <button onClick={() => setEditingId(null)} className="text-red-600 text-xs">✕</button>
                        </div>
                      ) : (
                        <span onClick={() => { setEditingId(c.campaign); setEditName(campaignNames[c.campaign] || c.campaign || '') }} className="cursor-pointer hover:text-blue-600" title="คลิกเพื่อแก้ไขชื่อ">
                          {campaignNames[c.campaign] || c.campaign || '(ไม่ระบุ)'}
                          <span className="ml-1 text-gray-400 text-xs">✏</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{c.leads_count || 0}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{c.orders_count || 0}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {formatMoney(c.revenue)} ฿
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${
                        parseFloat(convRate(c.leads_count, c.orders_count)) >= 30
                          ? 'text-green-600'
                          : parseFloat(convRate(c.leads_count, c.orders_count)) >= 10
                          ? 'text-yellow-600'
                          : 'text-red-500'
                      }`}>
                        {convRate(c.leads_count, c.orders_count)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {campaigns.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td className="px-4 py-3 text-gray-800">รวมทั้งหมด</td>
                  <td className="px-4 py-3 text-right text-gray-800">{summary.total_leads || 0}</td>
                  <td className="px-4 py-3 text-right text-gray-800">{summary.total_orders || 0}</td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    {formatMoney(summary.total_revenue)} ฿
                  </td>
                  <td className="px-4 py-3 text-right text-brand-red">
                    {convRate(summary.total_leads, summary.total_orders)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
