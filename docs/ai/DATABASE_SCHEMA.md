# Database Schema

Source of truth: `backend/src/models/index.js`

## Core Tables

### RBAC / Users

| Model | Table | Notes |
| --- | --- | --- |
| `Role` | `roles` | enum `superadmin`, `admin`, `staff`, `viewer` |
| `Permission` | `permissions` | เก็บ `resource` + `action` |
| `RolePermission` | `role_permissions` | join table, `timestamps: false` |
| `User` | `users` | เก็บ account ภายในระบบและข้อมูลเชื่อม Facebook บางส่วน |

`User.role_id` default เป็น `3` และ `User` มี field ที่เกี่ยวกับ Messenger tester เช่น `facebook_psid`, `is_tester`, `facebook_name`

### Customers / CRM

| Model | Table | Notes |
| --- | --- | --- |
| `Customer` | `customers` | ลูกค้าหลัก |
| `CustomerAddress` | `customer_addresses` | ที่อยู่ลูกค้าแบบหลายรายการ |
| `Lead` | `leads` | lead ก่อน convert เป็น order |
| `LeadAttribution` | `lead_attributions` | เก็บ campaign/adset/ad attribution |

`Lead.status` enum:

- `new`
- `awaiting_details`
- `awaiting_photos`
- `awaiting_shipment`
- `converted`
- `lost`

### Orders / Operations

| Model | Table | Notes |
| --- | --- | --- |
| `Order` | `orders` | ออเดอร์หลัก |
| `OrderItem` | `order_items` | รายการบริการใน order |
| `OrderStatusLog` | `order_status_logs` | log การเปลี่ยนสถานะ |
| `OrderImage` | `order_images` | รูป before/after/payment/shipment |
| `Shipment` | `shipments` | ข้อมูลจัดส่งเข้า/ออก |
| `Payment` | `payments` | ข้อมูลชำระเงิน |

`Order.status` enum:

- `draft`
- `awaiting_inbound_shipment`
- `inbound_shipped`
- `received`
- `in_progress`
- `washing`
- `shaping`
- `qc`
- `completed`
- `awaiting_payment`
- `paid`
- `ready_to_ship`
- `shipped`
- `delivered`
- `closed`

`Order.payment_status` enum:

- `unpaid`
- `partial`
- `paid`

`Order.delivery_method` enum:

- `pickup`
- `postal`

`OrderImage.image_type` enum:

- `before`
- `after`
- `payment`
- `shipment`

`Shipment.direction` enum:

- `inbound`
- `outbound`

`Payment.status` enum:

- `pending`
- `verified`
- `rejected`

### Content / Site

| Model | Table | Notes |
| --- | --- | --- |
| `PortfolioItem` | `portfolio_items` | ผลงาน before/after |
| `Testimonial` | `testimonials` | รีวิวลูกค้า |
| `SiteSetting` | `site_settings` | key-value config, ไม่มี timestamps |
| `Product` | `products` | สินค้าในระบบ, มี JSON fields เช่น `images`, `options` |

### Messaging / AI

| Model | Table | Notes |
| --- | --- | --- |
| `ConversationThread` | `conversation_threads` | thread ฝั่ง Messenger |
| `ConversationMessage` | `conversation_messages` | ข้อความใน thread |
| `LinkedInPost` | `linkedin_posts` | generated posts |
| `FacebookPage` | `facebook_pages` | page config และ AI mode |
| `AiChatThread` | `ai_chat_threads` | thread ฝั่ง admin AI chat |
| `AiChatMessage` | `ai_chat_messages` | ข้อความใน admin AI chat |
| `AiChatAttachment` | `ai_chat_attachments` | file attachment ของ AI chat |

`ConversationMessage.direction` enum:

- `inbound`
- `outbound`

`LinkedInPost.status` enum:

- `draft`
- `approved`
- `posted`
- `skipped`

`FacebookPage.ai_mode` enum:

- `off`
- `test`
- `live`

`AiChatMessage.role` enum:

- `user`
- `assistant`

## Main Associations

### CRM

- `Customer hasMany Lead`
- `Lead belongsTo Customer`
- `Lead hasOne LeadAttribution`
- `Customer hasMany CustomerAddress`

### Order Domain

- `Customer hasMany Order`
- `Order belongsTo Customer`
- `Lead belongsTo User as assignee`
- `Order belongsTo User as assignee`
- `Order hasMany OrderItem`
- `Order hasMany OrderStatusLog`
- `Order hasMany OrderImage`
- `Order hasMany Shipment`
- `Order hasMany Payment`

### Messaging

- `Customer hasMany ConversationThread`
- `ConversationThread belongsTo Customer`
- `ConversationThread hasMany ConversationMessage`
- `ConversationMessage belongsTo ConversationThread`

### Admin AI Chat

- `AiChatThread belongsTo User`
- `AiChatThread hasMany AiChatMessage`
- `AiChatMessage belongsTo AiChatThread`
- `AiChatMessage hasMany AiChatAttachment`
- `AiChatAttachment belongsTo AiChatMessage`

### RBAC

- `Role belongsToMany Permission through RolePermission`
- `Permission belongsToMany Role through RolePermission`
- `User belongsTo Role as role`

## Practical Rules For AI

- ถ้าจะแก้ validation หรือ API input ห้ามเดา nullability เองจากชื่อ field
- ถ้าจะแก้ flow customer/order/lead ให้เช็ก relation chain ก่อนเสมอ
- `page_id` ปรากฏในหลาย model เช่น `customers`, `leads`, `orders`, `products`, `conversation_threads`, `facebook_pages`
- JSON columns ที่ต้องระวัง: `ConversationMessage.ai_extracted`, `ConversationMessage.raw_payload`, `Product.images`, `Product.options`

