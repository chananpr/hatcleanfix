import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { customers } from "../api/index.js"
import StatusBadge from "../components/common/StatusBadge.jsx"
import { format } from "date-fns"
import { th } from "date-fns/locale"

const fmtDate = (d) => {
  if (!d) return "—"
  try { return format(new Date(d), "d MMM yyyy", { locale: th }) } catch { return "—" }
}
const fmtDateTime = (d) => {
  if (!d) return "—"
  try { return format(new Date(d), "d MMM yyyy HH:mm", { locale: th }) } catch { return "—" }
}
const fmtMoney = (v) => v != null ? Number(v).toLocaleString("th-TH") + " ฿" : "—"

// ====== Address Modal ======
function AddressModal({ address, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name: address?.name || "",
    phone: address?.phone || "",
    address: address?.address || "",
    postcode: address?.postcode || "",
    province: address?.province || "",
    district: address?.district || "",
    subdistrict: address?.subdistrict || "",
    is_default: address?.is_default || false,
  })
  const [suggestions, setSuggestions] = useState([])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handlePostcode = async (val) => {
    set("postcode", val)
    if (val.length >= 5) {
      try {
        const res = await customers.searchAddress(val)
        const data = res.data || res || []
        setSuggestions(data)
        if (data.length === 1) {
          set("province", data[0].province)
          set("district", data[0].amphoe)
          set("subdistrict", data[0].district)
        }
      } catch { setSuggestions([]) }
    } else {
      setSuggestions([])
    }
  }

  const pickSuggestion = (s) => {
    set("province", s.province)
    set("district", s.amphoe)
    set("subdistrict", s.district)
    set("postcode", String(s.zipcode))
    setSuggestions([])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h3 className="text-lg font-bold text-white">{address ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ชื่อผู้รับ</label>
              <input value={form.name} onChange={e => set("name", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">เบอร์โทร</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">ที่อยู่</label>
            <textarea value={form.address} onChange={e => set("address", e.target.value)} rows={2}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-400 mb-1">รหัสไปรษณีย์</label>
            <input value={form.postcode} onChange={e => handlePostcode(e.target.value)}
              placeholder="เช่น 10110"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            {suggestions.length > 1 && (
              <div className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => pickSuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 border-b border-gray-600 last:border-0">
                    {s.district} / {s.amphoe} / {s.province} {s.zipcode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">จังหวัด</label>
              <input value={form.province} onChange={e => set("province", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">อำเภอ</label>
              <input value={form.district} onChange={e => set("district", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">ตำบล</label>
              <input value={form.subdistrict} onChange={e => set("subdistrict", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-red-500 focus:border-transparent" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={e => set("is_default", e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-red-500 focus:ring-red-500" />
            ที่อยู่เริ่มต้น
          </label>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white">ยกเลิก</button>
          <button onClick={() => onSave(form)} disabled={saving}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ====== Main Page ======
// Socket.IO for real-time updates
import { io as socketIO } from 'socket.io-client'

export default function CustomerProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState("")
  const [noteChanged, setNoteChanged] = useState(false)
  const [addressModal, setAddressModal] = useState(null) // null | {} (new) | addr (edit)
  const [msg, setMsg] = useState("")

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3000) }

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await customers.getProfile(id)
      const c = res.data || res
      setCustomer(c)
      setNote(c.note || "")
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchCustomer() }, [fetchCustomer])

  // Real-time: auto-refresh when customer data changes
  useEffect(() => {
    const socket = socketIO('https://api.hatfixclean.com', { transports: ['websocket', 'polling'] })
    
    socket.on('connect', () => {
      socket.emit('join_page', customer?.page_id || '')
    })
    
    socket.on('customer_updated', (data) => {
      if (String(data.customer_id) === String(id)) {
        console.log('[Socket.IO] Customer updated, refreshing...')
        fetchCustomer()
      }
    })
    
    socket.on('new_message', (data) => {
      if (String(data.customer_id) === String(id)) {
        fetchCustomer() // Refresh to update message stats
      }
    })
    
    return () => socket.disconnect()
  }, [id, fetchCustomer])

  // Save note
  const saveNote = async () => {
    setSaving(true)
    try {
      await customers.updateCustomer(id, { note })
      setNoteChanged(false)
      flash("บันทึกเรียบร้อย")
    } catch { flash("บันทึกไม่สำเร็จ") }
    finally { setSaving(false) }
  }

  // Address handlers
  const handleSaveAddress = async (form) => {
    setSaving(true)
    try {
      if (addressModal?.id) {
        await customers.updateAddress(id, addressModal.id, form)
      } else {
        await customers.addAddress(id, form)
      }
      setAddressModal(null)
      flash("บันทึกที่อยู่เรียบร้อย")
      fetchCustomer()
    } catch { flash("บันทึกที่อยู่ไม่สำเร็จ") }
    finally { setSaving(false) }
  }

  const handleDeleteAddress = async (addrId) => {
    if (!confirm("ลบที่อยู่นี้?")) return
    try {
      await customers.deleteAddress(id, addrId)
      flash("ลบที่อยู่เรียบร้อย")
      fetchCustomer()
    } catch { flash("ลบไม่สำเร็จ") }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-600 border-t-red-500" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">ไม่พบข้อมูลลูกค้า</p>
        <button onClick={() => navigate("/customers")} className="mt-4 text-red-400 hover:underline text-sm">กลับหน้ารายชื่อ</button>
      </div>
    )
  }

  const addresses = customer.CustomerAddresses || customer.Addresses || []
  const recentOrders = customer.Orders || []
  const recentLeads = customer.Leads || []
  const stats = customer.orderSummary || {}
  const convStats = customer.conversationStats || {}

  return (
    <div className="max-w-7xl mx-auto">
      {/* Flash message */}
      {msg && (
        <div className="mb-4 px-4 py-2 bg-green-600/20 border border-green-600/30 rounded-lg text-green-400 text-sm text-center">
          {msg}
        </div>
      )}

      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        กลับ
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ====== LEFT COLUMN (2/3) ====== */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header Card */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {customer.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{customer.name || "ไม่ระบุชื่อ"}</h1>
                {customer.facebook_name && (
                  <p className="text-gray-400 text-sm truncate">FB: {customer.facebook_name}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {customer.phone}
                    </span>
                  )}
                  {customer.province && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {customer.province}
                    </span>
                  )}
                  {customer.page_id && (
                    <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">Page: {customer.page_id}</span>
                  )}
                  <span className="text-gray-500 text-xs">สร้าง {fmtDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">ที่อยู่จัดส่ง</h2>
              <button onClick={() => setAddressModal({})}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition">
                + เพิ่มที่อยู่ใหม่
              </button>
            </div>
            {addresses.length === 0 ? (
              <p className="text-gray-500 text-sm">ยังไม่มีที่อยู่</p>
            ) : (
              <div className="space-y-3">
                {addresses.map(a => (
                  <div key={a.id} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm">{a.name || "—"}</span>
                          {a.is_default && (
                            <span className="bg-red-600/20 text-red-400 px-2 py-0.5 rounded text-xs">ค่าเริ่มต้น</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{a.phone}</p>
                        <p className="text-gray-300 text-sm mt-1">
                          {[a.address, a.subdistrict, a.district, a.province, a.postcode].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button onClick={() => setAddressModal(a)}
                          className="p-1.5 text-gray-400 hover:text-yellow-400 transition" title="แก้ไข">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteAddress(a.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition" title="ลบ">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="font-bold text-white mb-3">บันทึก</h2>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); setNoteChanged(true) }}
              rows={4}
              placeholder="เพิ่มบันทึกเกี่ยวกับลูกค้า..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            {noteChanged && (
              <div className="flex justify-end mt-2">
                <button onClick={saveNote} disabled={saving}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50 transition">
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====== RIGHT COLUMN (1/3) ====== */}
        <div className="space-y-6">

          {/* Summary */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="font-bold text-white mb-4">สรุป</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">ออเดอร์ทั้งหมด</span>
                <span className="text-white font-bold text-lg">{stats.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">ยอดซื้อรวม</span>
                <span className="text-red-400 font-bold text-lg">{fmtMoney(stats.totalSpent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">ข้อความทั้งหมด</span>
                <span className="text-white font-medium">{convStats.totalMessages || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">ข้อความล่าสุด</span>
                <span className="text-gray-300 text-sm">{fmtDateTime(convStats.lastMessageDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">ติดต่อครั้งแรก</span>
                <span className="text-gray-300 text-sm">{fmtDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="font-bold text-white mb-4">ออเดอร์ล่าสุด</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">ยังไม่มีออเดอร์</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(o => (
                  <Link key={o.id} to={`/orders/${o.id}`}
                    className="block bg-gray-700/50 rounded-xl p-3 border border-gray-600/50 hover:border-red-600/50 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-red-400 text-sm">#{o.order_number}</span>
                      <StatusBadge status={o.status} type="order" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{o.hat_count || 0} ใบ</span>
                      <span className="text-white font-medium">{fmtMoney(o.total)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{fmtDate(o.createdAt)}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Leads */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="font-bold text-white mb-4">ลีดล่าสุด</h2>
            {recentLeads.length === 0 ? (
              <p className="text-gray-500 text-sm">ยังไม่มีลีด</p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map(l => (
                  <div key={l.id} className="bg-gray-700/50 rounded-xl p-3 border border-gray-600/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm font-medium">Lead #{l.id}</span>
                      <StatusBadge status={l.status} type="lead" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{l.hat_count || 0} ใบ</span>
                      <span>{fmtDate(l.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {addressModal !== null && (
        <AddressModal
          address={addressModal?.id ? addressModal : null}
          onSave={handleSaveAddress}
          onClose={() => setAddressModal(null)}
          saving={saving}
        />
      )}
    </div>
  )
}
