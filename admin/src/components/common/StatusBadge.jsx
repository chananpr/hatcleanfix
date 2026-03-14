const ORDER_STATUSES = {
  draft: { label: 'ร่าง', color: 'bg-gray-100 text-gray-700' },
  awaiting_inbound_shipment: { label: 'รอรับพัสดุ', color: 'bg-blue-100 text-blue-700' },
  received: { label: 'รับแล้ว', color: 'bg-cyan-100 text-cyan-700' },
  in_progress: { label: 'กำลังดำเนินการ', color: 'bg-yellow-100 text-yellow-700' },
  qc: { label: 'ตรวจสอบคุณภาพ', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'เสร็จสิ้น', color: 'bg-green-100 text-green-700' },
  awaiting_payment: { label: 'รอชำระเงิน', color: 'bg-orange-100 text-orange-700' },
  paid: { label: 'ชำระแล้ว', color: 'bg-emerald-100 text-emerald-700' },
  shipped: { label: 'จัดส่งแล้ว', color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'ส่งถึงแล้ว', color: 'bg-green-200 text-green-800' },
  closed: { label: 'ปิด', color: 'bg-gray-200 text-gray-600' },
}

const LEAD_STATUSES = {
  new: { label: 'ใหม่', color: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'ติดต่อแล้ว', color: 'bg-yellow-100 text-yellow-700' },
  waiting_photos: { label: 'รอรูปภาพ', color: 'bg-orange-100 text-orange-700' },
  waiting_shipment: { label: 'รอจัดส่ง', color: 'bg-indigo-100 text-indigo-700' },
  converted: { label: 'แปลงเป็นออเดอร์', color: 'bg-green-100 text-green-700' },
  lost: { label: 'เสียลูกค้า', color: 'bg-red-100 text-red-700' },
}

const ROLE_BADGES = {
  superadmin: { label: 'ซูเปอร์แอดมิน', color: 'bg-red-100 text-red-700' },
  admin: { label: 'แอดมิน', color: 'bg-orange-100 text-orange-700' },
  staff: { label: 'พนักงาน', color: 'bg-blue-100 text-blue-700' },
  viewer: { label: 'ผู้ชม', color: 'bg-gray-100 text-gray-700' },
}

const PAYMENT_STATUSES = {
  pending: { label: 'รอชำระ', color: 'bg-yellow-100 text-yellow-700' },
  partial: { label: 'ชำระบางส่วน', color: 'bg-orange-100 text-orange-700' },
  paid: { label: 'ชำระแล้ว', color: 'bg-green-100 text-green-700' },
  refunded: { label: 'คืนเงิน', color: 'bg-purple-100 text-purple-700' },
}

export default function StatusBadge({ status, type = 'order', className = '' }) {
  let map
  if (type === 'order') map = ORDER_STATUSES
  else if (type === 'lead') map = LEAD_STATUSES
  else if (type === 'role') map = ROLE_BADGES
  else if (type === 'payment') map = PAYMENT_STATUSES
  else map = ORDER_STATUSES

  const info = map[status] || { label: status, color: 'bg-gray-100 text-gray-600' }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color} ${className}`}
    >
      {info.label}
    </span>
  )
}

export { ORDER_STATUSES, LEAD_STATUSES, ROLE_BADGES, PAYMENT_STATUSES }
