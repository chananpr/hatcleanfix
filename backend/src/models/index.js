const sequelize = require('../config/database')
const { DataTypes } = require('sequelize')

// ====== USER + RBAC ======

const Role = sequelize.define('Role', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.ENUM('superadmin','admin','staff','viewer'), unique: true },
  description: { type: DataTypes.STRING }
}, { tableName: 'roles' })

const Permission = sequelize.define('Permission', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  resource: { type: DataTypes.STRING },   // leads, orders, customers, users, content, reports
  action:   { type: DataTypes.STRING }    // read, create, update, delete
}, { tableName: 'permissions' })

const RolePermission = sequelize.define('RolePermission', {
  role_id:       { type: DataTypes.INTEGER },
  permission_id: { type: DataTypes.INTEGER }
}, { tableName: 'role_permissions', timestamps: false })

const User = sequelize.define('User', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:       { type: DataTypes.STRING, allowNull: false },
  email:      { type: DataTypes.STRING, unique: true, allowNull: false },
  password:   { type: DataTypes.STRING, allowNull: false },
  role_id:    { type: DataTypes.INTEGER, defaultValue: 3 }, // default: staff
  is_active:  { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login: { type: DataTypes.DATE }
}, { tableName: 'users' })

// ====== CUSTOMERS ======

const Customer = sequelize.define('Customer', {
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:               { type: DataTypes.STRING },
  phone:              { type: DataTypes.STRING },
  facebook_psid:      { type: DataTypes.STRING, unique: true },
  facebook_name:      { type: DataTypes.STRING },
  province:           { type: DataTypes.STRING },
  note:               { type: DataTypes.TEXT },
  source_campaign_id: { type: DataTypes.STRING }
}, { tableName: 'customers' })

const CustomerAddress = sequelize.define('CustomerAddress', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER },
  name:        { type: DataTypes.STRING },
  phone:       { type: DataTypes.STRING },
  address:     { type: DataTypes.TEXT },
  province:    { type: DataTypes.STRING },
  district:    { type: DataTypes.STRING },
  postcode:    { type: DataTypes.STRING },
  is_default:  { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'customer_addresses' })

// ====== LEADS + ATTRIBUTION ======

const Lead = sequelize.define('Lead', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id:   { type: DataTypes.INTEGER },
  status:        { type: DataTypes.ENUM('new','awaiting_details','awaiting_photos','awaiting_shipment','converted','lost'), defaultValue: 'new' },
  hat_count:     { type: DataTypes.INTEGER },
  province:      { type: DataTypes.STRING },
  needs_washing: { type: DataTypes.BOOLEAN, defaultValue: false },
  note:          { type: DataTypes.TEXT },
  assigned_to:   { type: DataTypes.INTEGER }
}, { tableName: 'leads' })

const LeadAttribution = sequelize.define('LeadAttribution', {
  id:             { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lead_id:        { type: DataTypes.INTEGER },
  source_type:    { type: DataTypes.STRING },
  campaign_id:    { type: DataTypes.STRING },
  campaign_name:  { type: DataTypes.STRING },
  adset_id:       { type: DataTypes.STRING },
  adset_name:     { type: DataTypes.STRING },
  ad_id:          { type: DataTypes.STRING },
  ad_name:        { type: DataTypes.STRING },
  ref:            { type: DataTypes.STRING },
  first_touch_at: { type: DataTypes.DATE }
}, { tableName: 'lead_attributions' })

// ====== ORDERS ======

const Order = sequelize.define('Order', {
  id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number:      { type: DataTypes.STRING, unique: true },
  customer_id:       { type: DataTypes.INTEGER },
  lead_id:           { type: DataTypes.INTEGER },
  assigned_to:       { type: DataTypes.INTEGER },
  status:            { type: DataTypes.ENUM(
    'draft','awaiting_inbound_shipment','inbound_shipped','received',
    'in_progress','washing','shaping','qc','completed',
    'awaiting_payment','paid','ready_to_ship','shipped','delivered','closed'
  ), defaultValue: 'draft' },
  hat_count:         { type: DataTypes.INTEGER },
  subtotal:          { type: DataTypes.DECIMAL(10,2) },
  shipping_cost:     { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  total:             { type: DataTypes.DECIMAL(10,2) },
  payment_status:    { type: DataTypes.ENUM('unpaid','partial','paid'), defaultValue: 'unpaid' },
  note:              { type: DataTypes.TEXT },
  inbound_tracking:  { type: DataTypes.STRING },
  outbound_tracking: { type: DataTypes.STRING },
  delivery_method:   { type: DataTypes.ENUM("pickup","postal"), defaultValue: "postal" },
  inbound_carrier:   { type: DataTypes.STRING },
  outbound_carrier:  { type: DataTypes.STRING },
  page_id:           { type: DataTypes.STRING }
}, { tableName: 'orders' })

const OrderItem = sequelize.define('OrderItem', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:     { type: DataTypes.INTEGER },
  service_type: { type: DataTypes.STRING },
  quantity:     { type: DataTypes.INTEGER },
  unit_price:   { type: DataTypes.DECIMAL(10,2) },
  total_price:  { type: DataTypes.DECIMAL(10,2) }
}, { tableName: 'order_items' })

const OrderStatusLog = sequelize.define('OrderStatusLog', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:    { type: DataTypes.INTEGER },
  from_status: { type: DataTypes.STRING },
  to_status:   { type: DataTypes.STRING },
  note:        { type: DataTypes.TEXT },
  changed_by:  { type: DataTypes.INTEGER }
}, { tableName: 'order_status_logs' })

const OrderImage = sequelize.define('OrderImage', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:   { type: DataTypes.INTEGER },
  image_type: { type: DataTypes.ENUM('before','after','payment','shipment') },
  url:        { type: DataTypes.STRING },
  note:       { type: DataTypes.STRING }
}, { tableName: 'order_images' })

// ====== SHIPMENTS ======

const Shipment = sequelize.define('Shipment', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:        { type: DataTypes.INTEGER },
  direction:       { type: DataTypes.ENUM('inbound','outbound') },
  courier:         { type: DataTypes.STRING },
  tracking_number: { type: DataTypes.STRING },
  label_url:       { type: DataTypes.STRING },
  cost:            { type: DataTypes.DECIMAL(10,2) },
  status:          { type: DataTypes.STRING },
  shipped_at:      { type: DataTypes.DATE },
  delivered_at:    { type: DataTypes.DATE }
}, { tableName: 'shipments' })

// ====== PAYMENTS ======

const Payment = sequelize.define('Payment', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id:    { type: DataTypes.INTEGER },
  amount:      { type: DataTypes.DECIMAL(10,2) },
  method:      { type: DataTypes.STRING },
  slip_url:    { type: DataTypes.STRING },
  status:      { type: DataTypes.ENUM('pending','verified','rejected'), defaultValue: 'pending' },
  verified_by: { type: DataTypes.INTEGER },
  verified_at: { type: DataTypes.DATE }
}, { tableName: 'payments' })

// ====== CONTENT ======

const PortfolioItem = sequelize.define('PortfolioItem', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:        { type: DataTypes.STRING },
  before_url:   { type: DataTypes.STRING },
  after_url:    { type: DataTypes.STRING },
  service_type: { type: DataTypes.STRING },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'portfolio_items' })

const Testimonial = sequelize.define('Testimonial', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_name: { type: DataTypes.STRING },
  rating:        { type: DataTypes.INTEGER },
  content:       { type: DataTypes.TEXT },
  source:        { type: DataTypes.STRING },
  is_published:  { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'testimonials' })

const SiteSetting = sequelize.define('SiteSetting', {
  key:   { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT }
}, { tableName: 'site_settings', timestamps: false })

// ====== CONVERSATIONS ======

const ConversationThread = sequelize.define('ConversationThread', {
  id:                 { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  customer_id:        { type: DataTypes.INTEGER },
  platform:           { type: DataTypes.STRING, defaultValue: 'messenger' },
  platform_thread_id: { type: DataTypes.STRING },
  page_id:            { type: DataTypes.STRING(50) }
}, { tableName: 'conversation_threads' })

const ConversationMessage = sequelize.define('ConversationMessage', {
  id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  thread_id:    { type: DataTypes.INTEGER },
  direction:    { type: DataTypes.ENUM('inbound','outbound') },
  content:      { type: DataTypes.TEXT },
  ai_extracted: { type: DataTypes.JSON },
  raw_payload:  { type: DataTypes.JSON }
}, { tableName: 'conversation_messages' })

// ====== LINKEDIN POSTS ======

const LinkedInPost = sequelize.define('LinkedInPost', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  content:     { type: DataTypes.TEXT, allowNull: false },
  topic:       { type: DataTypes.STRING },
  style:       { type: DataTypes.STRING },
  status:      { type: DataTypes.ENUM('draft', 'approved', 'posted', 'skipped'), defaultValue: 'draft' },
  posted_at:   { type: DataTypes.DATE },
  posted_url:  { type: DataTypes.STRING },
  note:        { type: DataTypes.TEXT },
  created_by:  { type: DataTypes.INTEGER },
}, { tableName: 'linkedin_posts' })


// ====== FACEBOOK PAGES (Multi-page support) ======

const FacebookPage = sequelize.define('FacebookPage', {
  id:                   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  page_id:              { type: DataTypes.STRING(50), unique: true, allowNull: false },
  page_name:            { type: DataTypes.STRING },
  access_token:         { type: DataTypes.TEXT, allowNull: false },
  is_active:            { type: DataTypes.BOOLEAN, defaultValue: true },
  ai_enabled:           { type: DataTypes.BOOLEAN, defaultValue: true },
  ai_persona:           { type: DataTypes.STRING(100), defaultValue: 'น้องแฮทซ์' },
  ai_system_prompt:     { type: DataTypes.TEXT },
  webhook_verify_token: { type: DataTypes.STRING(100), defaultValue: 'hatfixclean2026' },
  note:                 { type: DataTypes.TEXT },
  profile_picture_url:  { type: DataTypes.STRING(500) }
}, { tableName: 'facebook_pages' })

// ====== AI CHAT ======

const AiChatThread = sequelize.define('AiChatThread', {
  id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:           { type: DataTypes.INTEGER, allowNull: false },
  title:             { type: DataTypes.STRING, defaultValue: 'แชทใหม่' },
  claude_session_id: { type: DataTypes.STRING },
  is_archived:       { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'ai_chat_threads' })

const AiChatMessage = sequelize.define('AiChatMessage', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  thread_id: { type: DataTypes.INTEGER, allowNull: false },
  role:      { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  content:   { type: DataTypes.TEXT('long') }
}, { tableName: 'ai_chat_messages' })

const AiChatAttachment = sequelize.define('AiChatAttachment', {
  id:            { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  message_id:    { type: DataTypes.INTEGER, allowNull: false },
  original_name: { type: DataTypes.STRING },
  stored_path:   { type: DataTypes.STRING },
  file_type:     { type: DataTypes.STRING },
  mime_type:     { type: DataTypes.STRING },
  file_size:     { type: DataTypes.INTEGER }
}, { tableName: 'ai_chat_attachments' })

// ====== ASSOCIATIONS ======

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'role_id' })
Permission.belongsToMany(Role,  { through: RolePermission, foreignKey: 'permission_id' })
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' })
Role.hasMany(User,   { foreignKey: 'role_id' })

Customer.hasMany(Lead,            { foreignKey: 'customer_id' })
Lead.belongsTo(Customer,          { foreignKey: 'customer_id' })
Lead.hasOne(LeadAttribution,      { foreignKey: 'lead_id' })
LeadAttribution.belongsTo(Lead,   { foreignKey: 'lead_id' })
Customer.hasMany(CustomerAddress, { foreignKey: 'customer_id' })

Customer.hasMany(Order,           { foreignKey: 'customer_id' })
Order.belongsTo(Customer,         { foreignKey: 'customer_id' })
Lead.belongsTo(User,              { foreignKey: 'assigned_to', as: 'assignee' })
Order.belongsTo(User,             { foreignKey: 'assigned_to', as: 'assignee' })
Order.hasMany(OrderItem,          { foreignKey: 'order_id' })
Order.hasMany(OrderStatusLog,     { foreignKey: 'order_id' })
Order.hasMany(OrderImage,         { foreignKey: 'order_id' })
Order.hasMany(Shipment,           { foreignKey: 'order_id' })
Order.hasMany(Payment,            { foreignKey: 'order_id' })

Customer.hasMany(ConversationThread,       { foreignKey: 'customer_id' })
ConversationThread.belongsTo(Customer,     { foreignKey: 'customer_id' })
ConversationThread.hasMany(ConversationMessage, { foreignKey: 'thread_id' })
ConversationMessage.belongsTo(ConversationThread, { foreignKey: 'thread_id' })

AiChatThread.belongsTo(User, { foreignKey: 'user_id' })
AiChatThread.hasMany(AiChatMessage, { foreignKey: 'thread_id' })
AiChatMessage.belongsTo(AiChatThread, { foreignKey: 'thread_id' })
AiChatMessage.hasMany(AiChatAttachment, { foreignKey: 'message_id' })
AiChatAttachment.belongsTo(AiChatMessage, { foreignKey: 'message_id' })


// ==================== Product ====================
const Product = sequelize.define("Product", {
  name:        { type: DataTypes.STRING, allowNull: false },
  slug:        { type: DataTypes.STRING, unique: true },
  description: { type: DataTypes.TEXT },
  category:    { type: DataTypes.STRING, defaultValue: "general" },
  price:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  compare_price: { type: DataTypes.DECIMAL(10, 2) },
  sku:         { type: DataTypes.STRING },
  stock:       { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
  images:      { type: DataTypes.JSON, defaultValue: [] },
  options:     { type: DataTypes.JSON, defaultValue: {} },
  sort_order:  { type: DataTypes.INTEGER, defaultValue: 0 },
  page_id:    { type: DataTypes.STRING(50) },
}, { tableName: "products", timestamps: true })

module.exports = {
  sequelize,
  Role, Permission, RolePermission,
  User, Customer, CustomerAddress,
  Lead, LeadAttribution,
  Order, OrderItem, OrderStatusLog, OrderImage,
  Shipment, Payment,
  PortfolioItem, Testimonial, SiteSetting,
  ConversationThread, ConversationMessage,
  LinkedInPost,
  AiChatThread, AiChatMessage, AiChatAttachment,
  FacebookPage,
  Product
}
