// Models will be defined here and associated
// Import sequelize instance
const sequelize = require('../config/database')
const { DataTypes } = require('sequelize')

// ====== MODELS ======

const User = sequelize.define('User', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:     { type: DataTypes.STRING },
  email:    { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role:     { type: DataTypes.ENUM('admin', 'staff'), defaultValue: 'staff' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
})

const Customer = sequelize.define('Customer', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:             { type: DataTypes.STRING },
  phone:            { type: DataTypes.STRING },
  facebook_psid:    { type: DataTypes.STRING, unique: true },
  facebook_name:    { type: DataTypes.STRING },
  province:         { type: DataTypes.STRING },
  note:             { type: DataTypes.TEXT },
  source_campaign_id: { type: DataTypes.INTEGER }
})

const Lead = sequelize.define('Lead', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id:  { type: DataTypes.INTEGER },
  status:       { type: DataTypes.ENUM('new','awaiting_details','awaiting_photos','awaiting_shipment','converted','lost'), defaultValue: 'new' },
  hat_count:    { type: DataTypes.INTEGER },
  province:     { type: DataTypes.STRING },
  needs_washing: { type: DataTypes.BOOLEAN, defaultValue: false },
  note:         { type: DataTypes.TEXT },
  assigned_to:  { type: DataTypes.INTEGER }
})

const LeadAttribution = sequelize.define('LeadAttribution', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lead_id:       { type: DataTypes.INTEGER },
  source_type:   { type: DataTypes.STRING },  // facebook_ads | organic | referral
  campaign_id:   { type: DataTypes.STRING },
  campaign_name: { type: DataTypes.STRING },
  adset_id:      { type: DataTypes.STRING },
  adset_name:    { type: DataTypes.STRING },
  ad_id:         { type: DataTypes.STRING },
  ad_name:       { type: DataTypes.STRING },
  ref:           { type: DataTypes.STRING },
  first_touch_at: { type: DataTypes.DATE }
})

const Order = sequelize.define('Order', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number:     { type: DataTypes.STRING, unique: true },
  customer_id:      { type: DataTypes.INTEGER },
  lead_id:          { type: DataTypes.INTEGER },
  status:           { type: DataTypes.ENUM(
    'draft','awaiting_inbound_shipment','inbound_shipped','received',
    'in_progress','washing','shaping','qc','completed',
    'awaiting_payment','paid','ready_to_ship','shipped','delivered','closed'
  ), defaultValue: 'draft' },
  hat_count:        { type: DataTypes.INTEGER },
  subtotal:         { type: DataTypes.DECIMAL(10,2) },
  shipping_cost:    { type: DataTypes.DECIMAL(10,2) },
  total:            { type: DataTypes.DECIMAL(10,2) },
  payment_status:   { type: DataTypes.ENUM('unpaid','partial','paid'), defaultValue: 'unpaid' },
  note:             { type: DataTypes.TEXT },
  inbound_tracking: { type: DataTypes.STRING },
  outbound_tracking: { type: DataTypes.STRING }
})

const OrderItem = sequelize.define('OrderItem', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:     { type: DataTypes.INTEGER },
  service_type: { type: DataTypes.STRING },
  quantity:     { type: DataTypes.INTEGER },
  unit_price:   { type: DataTypes.DECIMAL(10,2) },
  total_price:  { type: DataTypes.DECIMAL(10,2) }
})

const OrderImage = sequelize.define('OrderImage', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:   { type: DataTypes.INTEGER },
  image_type: { type: DataTypes.ENUM('before','after','payment','shipment') },
  url:        { type: DataTypes.STRING },
  note:       { type: DataTypes.STRING }
})

const Shipment = sequelize.define('Shipment', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:       { type: DataTypes.INTEGER },
  direction:      { type: DataTypes.ENUM('inbound','outbound') },
  courier:        { type: DataTypes.STRING },
  tracking_number: { type: DataTypes.STRING },
  label_url:      { type: DataTypes.STRING },
  cost:           { type: DataTypes.DECIMAL(10,2) },
  status:         { type: DataTypes.STRING },
  shipped_at:     { type: DataTypes.DATE },
  delivered_at:   { type: DataTypes.DATE }
})

const Payment = sequelize.define('Payment', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:    { type: DataTypes.INTEGER },
  amount:      { type: DataTypes.DECIMAL(10,2) },
  method:      { type: DataTypes.STRING },
  slip_url:    { type: DataTypes.STRING },
  status:      { type: DataTypes.ENUM('pending','verified','rejected'), defaultValue: 'pending' },
  verified_by: { type: DataTypes.INTEGER },
  verified_at: { type: DataTypes.DATE }
})

// ====== ASSOCIATIONS ======
Customer.hasMany(Lead,    { foreignKey: 'customer_id' })
Lead.belongsTo(Customer, { foreignKey: 'customer_id' })
Lead.hasOne(LeadAttribution, { foreignKey: 'lead_id' })

Customer.hasMany(Order,  { foreignKey: 'customer_id' })
Order.belongsTo(Customer,{ foreignKey: 'customer_id' })
Order.hasMany(OrderItem, { foreignKey: 'order_id' })
Order.hasMany(OrderImage,{ foreignKey: 'order_id' })
Order.hasMany(Shipment,  { foreignKey: 'order_id' })
Order.hasMany(Payment,   { foreignKey: 'order_id' })

module.exports = { sequelize, User, Customer, Lead, LeadAttribution, Order, OrderItem, OrderImage, Shipment, Payment }
