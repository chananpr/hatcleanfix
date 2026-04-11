import { useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orders } from "../api/index.js"
import StatusBadge, { ORDER_STATUSES } from "../components/common/StatusBadge.jsx"
import PageHeader from "../components/common/PageHeader.jsx"
import { format } from "date-fns"
import { th } from "date-fns/locale"

const STATUS_FLOW = Object.keys(ORDER_STATUSES)
const CARRIERS = ["Kerry Express", "Flash Express", "J&T Express", "Thailand Post", "DHL", "Ninja Van", "Best Express", "SPX Express"]
const IMAGE_TYPES = [
  { value: "before", label: "ก่อนซ่อม" },
  { value: "after", label: "หลังซ่อม" },
  { value: "payment", label: "สลิปชำระเงิน" },
  { value: "shipment", label: "การจัดส่ง" },
]

function Section({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
      <span className="text-gray-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-gray-800 font-medium text-right flex-1">{value ?? "\u2014"}</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [imageTab, setImageTab] = useState("before")
  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")

  // Tracking edit state
  const [editTracking, setEditTracking] = useState(false)
  const [trackingForm, setTrackingForm] = useState({
    inbound_tracking: "", outbound_tracking: "",
    inbound_carrier: "", outbound_carrier: ""
  })

  // Image upload state
  const [uploadType, setUploadType] = useState("before")
  const [uploadFiles, setUploadFiles] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orders.get(id).then(r => r.data || r),
  })

  const statusMutation = useMutation({
    mutationFn: ({ status, note }) => orders.updateStatus(id, status, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", id] })
      setStatusModal(false)
      setStatusNote("")
    },
  })

  const trackingMutation = useMutation({
    mutationFn: (data) => orders.updateTracking(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", id] })
      setEditTracking(false)
    },
  })

  const handleUploadImages = async () => {
    if (!uploadFiles?.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      for (const f of uploadFiles) formData.append("images", f)
      formData.append("image_type", uploadType)
      await orders.uploadImages(id, formData)
      qc.invalidateQueries({ queryKey: ["order", id] })
      setUploadFiles(null)
      if (fileRef.current) fileRef.current.value = ""
    } catch (e) {
      alert("Upload failed: " + (e?.response?.data?.message || e.message))
    } finally {
      setUploading(false)
    }
  }

  const formatDate = (d) => {
    if (!d) return "\u2014"
    try { return format(new Date(d), "d MMMM yyyy HH:mm", { locale: th }) } catch { return d }
  }

  const formatMoney = (n) =>
    n != null ? Number(n).toLocaleString("th-TH") + " \u0E3F" : "\u2014"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Order not found</p>
        <button onClick={() => navigate("/orders")} className="mt-4 text-brand-red text-sm hover:underline">
          Back to orders
        </button>
      </div>
    )
  }

  const imgMap = {
    before: order.images_before || [],
    after: order.images_after || [],
    payment: order.images_payment || [],
    shipment: order.images_shipment || [],
  }

  return (
    <div>
      <PageHeader
        title={`Order #${order.order_number}`}
        subtitle={formatDate(order.createdAt || order.created_at)}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} type="order" className="text-sm px-3 py-1" />
            <button
              onClick={() => { setNewStatus(order.status); setStatusModal(true) }}
              className="px-4 py-2 bg-brand-red text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-400"
            >
              Change Status
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Section title="Order Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <InfoRow label="Order Number" value={`#${order.order_number}`} />
                <InfoRow label="Customer" value={order.customer_name} />
                <InfoRow label="Phone" value={order.customer_phone} />
                <InfoRow label="Hat Count" value={order.hat_count ? `${order.hat_count} pcs` : "\u2014"} />
              </div>
              <div>
                <InfoRow label="Assigned To" value={order.assigned_to_name} />
                <InfoRow label="Province" value={order.customer_province || order.province} />
                <InfoRow label="Source" value={order.campaign_source} />
                <InfoRow label="Payment Status" value={
                  <StatusBadge status={order.payment_status} type="payment" />
                } />
              </div>
            </div>
            {order.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <span className="font-medium">Notes: </span>{order.notes}
              </div>
            )}
          </Section>

          {/* Pricing Breakdown */}
          <Section title="Pricing Breakdown">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Item</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Qty</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Unit Price</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.length > 0 ? (
                  order.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">{item.name || "Hat repair"}</td>
                      <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                      <td className="py-2 text-right text-gray-600">{formatMoney(item.unit_price)}</td>
                      <td className="py-2 text-right font-medium text-gray-800">{formatMoney(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">Repair/Clean ({order.hat_count} pcs)</td>
                      <td className="py-2 text-right text-gray-600">{order.hat_count}</td>
                      <td className="py-2 text-right text-gray-600">{formatMoney(order.price_per_hat)}</td>
                      <td className="py-2 text-right font-medium text-gray-800">{formatMoney(order.subtotal)}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-700">Shipping</td>
                      <td className="py-2 text-right text-gray-600">1</td>
                      <td className="py-2 text-right text-gray-600">{formatMoney(order.shipping_cost)}</td>
                      <td className="py-2 text-right font-medium text-gray-800">{formatMoney(order.shipping_cost)}</td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-gray-500">Discount</td>
                    <td className="py-2 text-right text-green-600 font-medium">-{formatMoney(order.discount)}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="py-3 text-right font-bold text-gray-800 text-base">Grand Total</td>
                  <td className="py-3 text-right font-bold text-brand-red text-lg">{formatMoney(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </Section>

          {/* Images */}
          <Section title="Images">
            <div className="flex gap-2 mb-4 flex-wrap">
              {IMAGE_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setImageTab(t.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    imageTab === t.value
                      ? "bg-brand-red text-gray-900"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t.label} ({imgMap[t.value]?.length || 0})
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {imgMap[imageTab]?.map((img, i) => (
                <a key={i} href={img} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={img}
                    alt={`${imageTab} ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:opacity-80 transition"
                  />
                </a>
              ))}
              {!imgMap[imageTab]?.length && (
                <div className="col-span-4 py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  No {IMAGE_TYPES.find(t => t.value === imageTab)?.label} images yet
                </div>
              )}
            </div>
          </Section>

          {/* Upload Images */}
          <Section title="Upload Images">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  {IMAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Files</label>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setUploadFiles(e.target.files?.length ? Array.from(e.target.files) : null)}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20"
                />
              </div>
              <button
                onClick={handleUploadImages}
                disabled={!uploadFiles?.length || uploading}
                className="px-5 py-2 bg-brand-red text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-400 disabled:opacity-50 whitespace-nowrap"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
            {uploadFiles?.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">{uploadFiles.length} file(s) selected</p>
            )}
          </Section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Tracking */}
          <Section
            title="Shipping"
            action={
              !editTracking && (
                <button
                  onClick={() => {
                    setTrackingForm({
                      inbound_tracking: order.inbound_tracking || "",
                      outbound_tracking: order.outbound_tracking || "",
                      inbound_carrier: order.inbound_carrier || "",
                      outbound_carrier: order.outbound_carrier || "",
                    })
                    setEditTracking(true)
                  }}
                  className="text-xs text-brand-red hover:underline font-medium"
                >
                  Edit
                </button>
              )
            }
          >
            {editTracking ? (
              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-gray-500 mb-1 text-xs font-medium">Inbound Tracking</label>
                  <input
                    value={trackingForm.inbound_tracking}
                    onChange={(e) => setTrackingForm(f => ({ ...f, inbound_tracking: e.target.value }))}
                    placeholder="Tracking number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                  <select
                    value={trackingForm.inbound_carrier}
                    onChange={(e) => setTrackingForm(f => ({ ...f, inbound_carrier: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="">-- Select carrier --</option>
                    {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <label className="block text-gray-500 mb-1 text-xs font-medium">Outbound Tracking</label>
                  <input
                    value={trackingForm.outbound_tracking}
                    onChange={(e) => setTrackingForm(f => ({ ...f, outbound_tracking: e.target.value }))}
                    placeholder="Tracking number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                  <select
                    value={trackingForm.outbound_carrier}
                    onChange={(e) => setTrackingForm(f => ({ ...f, outbound_carrier: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-2 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="">-- Select carrier --</option>
                    {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEditTracking(false)}
                    className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => trackingMutation.mutate(trackingForm)}
                    disabled={trackingMutation.isPending}
                    className="flex-1 py-2 bg-brand-red text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-400 disabled:opacity-60"
                  >
                    {trackingMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Inbound (Customer to HATZ)</div>
                  <div className="font-medium">{order.inbound_tracking || "\u2014"}</div>
                  {order.inbound_carrier && (
                    <div className="text-xs text-gray-400">{order.inbound_carrier}</div>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-gray-500 mb-1">Outbound (HATZ to Customer)</div>
                  <div className="font-medium">{order.outbound_tracking || "\u2014"}</div>
                  {order.outbound_carrier && (
                    <div className="text-xs text-gray-400">{order.outbound_carrier}</div>
                  )}
                </div>
              </div>
            )}
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <div className="space-y-2 text-sm">
              <InfoRow label="Total Due" value={formatMoney(order.total)} />
              <InfoRow label="Paid" value={formatMoney(order.amount_paid)} />
              <InfoRow label="Remaining" value={formatMoney((parseFloat(order.total) || 0) - (order.amount_paid || 0))} />
              <InfoRow label="Status" value={<StatusBadge status={order.payment_status} type="payment" />} />
            </div>
            {order.payment_slip && (
              <div className="mt-3">
                <div className="text-xs text-gray-500 mb-2">Payment Slip</div>
                <a href={order.payment_slip} target="_blank" rel="noreferrer">
                  <img src={order.payment_slip} alt="slip" className="w-full max-w-xs rounded-lg border" />
                </a>
              </div>
            )}
            {!order.payment_slip && (
              <div className="mt-3 border-2 border-dashed border-gray-200 rounded-lg py-4 text-center text-gray-400 text-xs">
                No payment slip uploaded
              </div>
            )}
          </Section>

          {/* Status History */}
          <Section title="Status History">
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
                        {formatDate(h.created_at)} {h.created_by_name && `\u00B7 ${h.created_by_name}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No status history</p>
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Status Change Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Change Order Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Status</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={3}
                  placeholder="Add a note..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setStatusModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => statusMutation.mutate({ status: newStatus, note: statusNote })}
                disabled={statusMutation.isPending}
                className="flex-1 py-2.5 bg-brand-red text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {statusMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
