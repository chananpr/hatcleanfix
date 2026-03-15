const ORDER_STATUSES = [
  'draft', 'awaiting_inbound_shipment', 'inbound_shipped', 'received',
  'in_progress', 'washing', 'shaping', 'qc', 'completed',
  'awaiting_payment', 'paid', 'ready_to_ship', 'shipped', 'delivered', 'closed'
]

const LEAD_STATUSES = ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment', 'converted', 'lost']

const ACTIVE_LEAD_STATUSES = ['new', 'awaiting_details', 'awaiting_photos', 'awaiting_shipment']

const ROLES = ['superadmin', 'admin', 'staff', 'viewer']

const PAYMENT_STATUSES = ['pending', 'verified', 'rejected']

const IMAGE_TYPES = ['before', 'after', 'payment', 'shipment']

const SHIPMENT_DIRECTIONS = ['inbound', 'outbound']

module.exports = {
  ORDER_STATUSES, LEAD_STATUSES, ACTIVE_LEAD_STATUSES,
  ROLES, PAYMENT_STATUSES, IMAGE_TYPES, SHIPMENT_DIRECTIONS
}
