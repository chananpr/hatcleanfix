import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orders } from '../api/index.js'
import StatusBadge, { ORDER_STATUSES } from '../components/common/StatusBadge.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const STATUS_FLOW = Object.keys(ORDER_STATUSES)

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-800 mb-4 text-base">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium text-right flex-1">{value ?? '—'}</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [imageTab, setImageTab] = useState('before')
  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orders.get(id),
  })

  const statusMutation = useMutation({
    mutationFn: ({ status, note }) => orders.updateStatus(id, status, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['order', id] })
      setStatusModal(false)
      setStatusNote('')
    },
  })

  const formatDate = (d) => {
    if (!d) return '—'
    try { return format(new Date(d), 'd MMMM yyyy HH:mm', { locale: th }) } catch { return d }
  }

  const formatMoney = (n) =>
    n != null ? n.toLocaleString('th-TH') + ' ฿' : '—'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        กำลังโหลด...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">😕</div>
        <p className="text-gray-500">ไม่พบออเดอร์นี้</p>
        <button onClick={() => navigate('/orders')} className="mt-4 text-brand-red text-sm hover:underline">
          กลับไปรายการออเดอร์
        </button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`ออเดอร์ #${order.order_number}`}
        subtitle={formatDate(order.created_at)}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} type="order" className="text-sm px-3 py-1" />
            <button
              onClick={() => { setNewStatus(order.status); setStatusModal(true) }}
              className="px-4 py-2 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              เปลี่ยนสถานะ
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              กลับ
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Section title="ข้อมูลออเดอร์">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <InfoRow label="เลขออเดอร์" value={`#${order.order_number}`} />
                <InfoRow label="ลูกค้า" value={order.customer_name} />
                <InfoRow label="เบอร์โทร" value={order.customer_phone} />
                <InfoRow label="จำนวนหมวก" value={`${order.hat_count} ใบ`} />
              </div>
              <div>
                <InfoRow label="มอบหมายให้" value={order.assigned_to_name} />
                <InfoRow label="จังหวัด" value={order.province} />
                <InfoRow label="ช่องทาง" value={order.campaign_source} />
                <InfoRow label="สถานะชำระ" value={
                  <StatusBadge status={order.payment_status} type="payment" />
                } />
              </div>
            </div>
            {order.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <span className="font-medium">หมายเหตุ: </span>{order.notes}
              </div>
            )}
          </Section>

          {/* Pricing Breakdown */}
          <Section title="รายละเอียดราคา">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">รายการ</th>
                  <th className="text-right py-2 text-gray-500 font-medium">จำนวน</th>
                  <th className="text-right py-2 text-gray-500 font-medium">ราคา/หน่วย</th>
                  <th className="text-right py-2 text-gray-500 font-medium">รวม</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.length > 0 ? (
                  order.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{item.name || 'ซ่อมหมวก'}</td>
                      <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">{formatMoney(item.unit_price)}</td>
                      <td className="py-2 text-right font-medium text-gray-800">{formatMoney(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">ค่าซ่อม/ทำความสะอาด ({order.hat_count} ใบ)</td>
                      <td className="py-2 text-right text-gray-600">{order.hat_count}</td>
                      <td className="py-2 text-right text-gray-600">{formatMoney(order.price_per_hat)}</td>
                      <td className="py-2 text-right font-medium text-gray-800">{formatMoney(order.subtotal)}</td>
                    </tr>
                    {order.washing_surcharge > 0 && (
                      <tr className="border-b border-gray-50">
                        <td className="py-2 text-gray-700">ค่าซักเพิ่ม</td>
                        <td className="py-2 text-right text-gray-600">{order.hat_count}</td>
                        <td className="py-2 text-right text-gray-600">50 ฿</td>
                        <td className="py-2 text-right font-medium text-gray-800">{formatMoney(order.washing_surcharge)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">ค่าจัดส่ง</td>
                      <td className="py-2 text-right text-gray-600">1</td>
                      <td className="py-2 text-right text-gray-600">{formatMoney(order.shipping_fee)}</td>
                      <td className="py-2 text-right font-medium text-gray-800">{formatMoney(order.shipping_fee)}</td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-gray-500">ส่วนลด</td>
                    <td className="py-2 text-right text-green-600 font-medium">-{formatMoney(order.discount)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="py-3 text-right font-bold text-gray-800 text-base">ยอดรวมทั้งสิ้น</td>
                  <td className="py-3 text-right font-bold text-brand-red text-lg">{formatMoney(order.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </Section>

          {/* Images */}
          <Section title="รูปภาพ">
            <div className="flex gap-2 mb-4">
              {['before', 'after'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setImageTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    imageTab === tab
                      ? 'bg-brand-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'before' ? 'ก่อนซ่อม' : 'หลังซ่อม'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {(imageTab === 'before' ? order.images_before : order.images_after)?.map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={img}
                    alt={`${imageTab} ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:opacity-80 transition"
                  />
                </a>
              ))}
              {!(imageTab === 'before' ? order.images_before : order.images_after)?.length && (
                <div className="col-span-4 py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  ยังไม่มีรูปภาพ{imageTab === 'before' ? 'ก่อน' : 'หลัง'}ซ่อม
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Tracking */}
          <Section title="การจัดส่ง">
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-500 mb-1">ขาเข้า (ลูกค้า → HATZ)</div>
                <div className="font-medium">{order.inbound_tracking || '—'}</div>
                {order.inbound_carrier && (
                  <div className="text-xs text-gray-400">{order.inbound_carrier}</div>
                )}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="text-gray-500 mb-1">ขาออก (HATZ → ลูกค้า)</div>
                <div className="font-medium">{order.outbound_tracking || '—'}</div>
                {order.outbound_carrier && (
                  <div className="text-xs text-gray-400">{order.outbound_carrier}</div>
                )}
              </div>
            </div>
          </Section>

          {/* Payment */}
          <Section title="การชำระเงิน">
            <div className="space-y-2 text-sm">
              <InfoRow label="ยอดที่ต้องชำระ" value={formatMoney(order.total_amount)} />
              <InfoRow label="ชำระแล้ว" value={formatMoney(order.amount_paid)} />
              <InfoRow label="คงเหลือ" value={formatMoney((order.total_amount || 0) - (order.amount_paid || 0))} />
              <InfoRow label="สถานะ" value={<StatusBadge status={order.payment_status} type="payment" />} />
            </div>
            {order.payment_slip && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-2">สลิปการโอน</div>
                <a href={order.payment_slip} target="_blank" rel="noreferrer">
                  <img src={order.payment_slip} alt="slip" className="w-full max-w-xs rounded-lg border" />
                </a>
              </div>
            )}
            {!order.payment_slip && (
              <div className="mt-3 border-2 border-dashed border-gray-200 rounded-lg py-4 text-center text-gray-400 text-xs">
                ยังไม่มีสลิปการโอน
              </div>
            )}
          </Section>

          {/* Status History */}
          <Section title="ประวัติสถานะ">
            <div className="space-y-3">
              {order.status_history?.length > 0 ? (
                order.status_history.map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-red mt-0.5 flex-shrink-0" />
                      {i < order.status_history.length - 1 && (
                        <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <StatusBadge status={h.status} type="order" />
                      {h.note && (
                        <p className="text-xs text-gray-500 mt-1">{h.note}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(h.created_at)} · {h.created_by_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">ไม่มีประวัติสถานะ</p>
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Status Change Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">เปลี่ยนสถานะออเดอร์</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">สถานะใหม่</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUSES[s]?.label || s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ (ถ้ามี)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  placeholder="บันทึกเพิ่มเติม..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setStatusModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => statusMutation.mutate({ status: newStatus, note: statusNote })}
                disabled={statusMutation.isPending}
                className="flex-1 py-2.5 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {statusMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
