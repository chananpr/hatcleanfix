# API Reference

Source of truth:

1. `backend/src/index.js`
2. `backend/src/modules/*/*.routes.js`

## Global Notes

- health check: `GET /health`
- route ส่วนใหญ่ใช้ JSON API
- route ที่ไม่ระบุ auth ในเอกสารนี้ ให้ตรวจ route file อีกครั้งก่อนใช้งานจริง
- auth-protected routes ส่วนมากต้องส่ง bearer token จาก admin login

## Route Groups

### `/api/auth`

ไฟล์: `backend/src/modules/auth/auth.routes.js`

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

### `/api/users`

ไฟล์: `backend/src/modules/users/user.routes.js`

- `GET /api/users/me/profile`
- `PUT /api/users/me/profile`
- `PUT /api/users/me/password`
- `PUT /api/users/me/facebook`
- `GET /api/users/roles`
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

Role restrictions:

- list/get: `superadmin`, `admin`
- create/update/delete: `superadmin`

### `/api/customers`

ไฟล์: `backend/src/modules/customers/customer.routes.js`

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `PATCH /api/customers/:id`
- `POST /api/customers/:id/addresses`
- `PUT /api/customers/:id/addresses/:addressId`
- `DELETE /api/customers/:id/addresses/:addressId`

### `/api/address`

ไฟล์: `backend/src/modules/address/address.routes.js`

- `GET /api/address/search`

### `/api/leads`

ไฟล์: `backend/src/modules/leads/lead.routes.js`

- `GET /api/leads`
- `GET /api/leads/:id`
- `POST /api/leads`
- `PUT /api/leads/:id`
- `PUT /api/leads/:id/status`
- `PATCH /api/leads/:id/status`
- `PUT /api/leads/:id/convert`
- `POST /api/leads/:id/convert`
- `PATCH /api/leads/:id/assign`

### `/api/orders`

ไฟล์: `backend/src/modules/orders/order.routes.js`

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `PUT /api/orders/:id/status`
- `PATCH /api/orders/:id/status`
- `POST /api/orders/:id/images`
- `PUT /api/orders/:id/tracking`
- `POST /api/orders/:id/typed-images`

Notes:

- image upload ใช้ middleware `uploadOrderImages`
- tracking และ typed image routes มีผลกับ order operations flow โดยตรง

### `/api/shipments`

ไฟล์: `backend/src/modules/shipments/shipment.routes.js`

- `GET /api/shipments`
- `GET /api/shipments/:id`
- `POST /api/shipments`
- `PUT /api/shipments/:id`
- `GET /api/shipments/:id/track`

### `/api/payments`

ไฟล์: `backend/src/modules/payments/payment.routes.js`

- `GET /api/payments`
- `GET /api/payments/:id`
- `POST /api/payments`
- `PUT /api/payments/:id/verify`
- `PATCH /api/payments/:id/verify`
- `PUT /api/payments/:id/reject`
- `PATCH /api/payments/:id/reject`

Role restrictions:

- verify/reject: `superadmin`, `admin`

### `/api/dashboard`

ไฟล์: `backend/src/modules/dashboard/dashboard.routes.js`

- `GET /api/dashboard/summary`
- `GET /api/dashboard/orders`
- `GET /api/dashboard/order-stats`
- `GET /api/dashboard/revenue`
- `GET /api/dashboard/attribution`

### `/api/content`

ไฟล์: `backend/src/modules/content/content.routes.js`

Public:

- `GET /api/content/portfolio`
- `GET /api/content/testimonials`
- `GET /api/content/settings`

Auth required:

- `POST /api/content/portfolio`
- `PUT /api/content/portfolio/:id`
- `PATCH /api/content/portfolio/:id/toggle`
- `DELETE /api/content/portfolio/:id`
- `POST /api/content/testimonials`
- `PATCH /api/content/testimonials/:id/toggle`
- `DELETE /api/content/testimonials/:id`
- `PUT /api/content/settings`

### `/api/pricing`

ไฟล์: `backend/src/modules/pricing/pricing.routes.js`

Public:

- `POST /api/pricing/calculate`
- `GET /api/pricing/rules`
- `GET /api/pricing`

Restricted:

- `PUT /api/pricing/rules`
- `PUT /api/pricing`

Role restrictions:

- update rules: `superadmin`, `admin`

### `/api/reports`

ไฟล์: `backend/src/modules/reports/report.routes.js`

- `GET /api/reports/revenue`
- `GET /api/reports/leads`
- `GET /api/reports/orders`
- `GET /api/reports/campaigns`

### `/api/linkedin-posts`

ไฟล์: `backend/src/modules/linkedin-post/linkedin-post.routes.js`

- `GET /api/linkedin-posts`
- `POST /api/linkedin-posts/generate`
- `POST /api/linkedin-posts/generate-batch`
- `GET /api/linkedin-posts/topics`
- `PATCH /api/linkedin-posts/:id/status`
- `PUT /api/linkedin-posts/:id`
- `DELETE /api/linkedin-posts/:id`

Role restrictions:

- route group นี้ใช้ `requireRole('superadmin')`

### `/api/n8n`

ไฟล์: `backend/src/modules/n8n/n8n.routes.js`

- `GET /api/n8n/status`
- `GET /api/n8n/workflows`
- `GET /api/n8n/credentials`
- `GET /api/n8n/executions`

Role restrictions:

- `superadmin`, `admin`

### `/api/ai-chat`

ไฟล์: `backend/src/modules/ai-chat/ai-chat.routes.js`

- `GET /api/ai-chat/threads`
- `POST /api/ai-chat/threads`
- `GET /api/ai-chat/threads/:id`
- `PATCH /api/ai-chat/threads/:id`
- `DELETE /api/ai-chat/threads/:id`
- `POST /api/ai-chat/threads/:id/messages`
- `POST /api/ai-chat/threads/:id/regenerate`

Role restrictions:

- `superadmin`, `admin`

Special notes:

- attachment upload ใช้ `multer`
- รองรับไฟล์ได้หลายชนิด รวมถึง code/text/pdf/image
- upload dir ปัจจุบันอยู่ที่ `/tmp/ai-chat-uploads`

### `/api/facebook-pages`

ไฟล์: `backend/src/modules/facebook-pages/facebook-pages.routes.js`

- `GET /api/facebook-pages`
- `GET /api/facebook-pages/:id`
- `POST /api/facebook-pages`
- `PUT /api/facebook-pages/:id`
- `DELETE /api/facebook-pages/:id`
- `POST /api/facebook-pages/:id/ai-mode`

### `/api/products`

ไฟล์: `backend/src/modules/products/products.routes.js`

- `GET /api/products/summary`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/products/:id/toggle`
- `POST /api/products/:id/delete-image`

Notes:

- image upload ใช้ `uploadProductImages`
- current backend route file ไม่มี `POST /api/products/:id/images`

### `/api/conversations`

ไฟล์: `backend/src/modules/conversations/conversations.routes.js`

- `GET /api/conversations`
- `GET /api/conversations/:threadId/messages`
- `POST /api/conversations/:threadId/ai-reply`
- `POST /api/conversations/:threadId/manual-reply`

Notes:

- admin UI ใช้ route นี้กับ Messenger threads
- AI reply มีผลกับ production messaging flow

### `/api/campaigns`

ไฟล์: `backend/src/modules/campaigns/campaign.routes.js`

- `GET /api/campaigns/names`
- `PUT /api/campaigns/names`

### `/api/webhooks`

ไฟล์: `backend/src/modules/webhooks/webhook.routes.js`

- `GET /api/webhooks/messenger`
- `POST /api/webhooks/messenger`
- `POST /api/webhooks/n8n`

Webhook routes เป็น public-facing integration points และต้องระวังผลกระทบ production สูง

## Known Codebase Mismatches To Watch

จากการอ่าน code:

- `admin/src/api/index.js` มี helper `users.generateLinkCode()` แต่ route นี้ไม่พบใน `backend/src/modules/users/user.routes.js`
- `admin/src/api/index.js` มี helper `products.uploadImage()` ที่ยิง `POST /api/products/:id/images` แต่ route นี้ไม่พบใน `backend/src/modules/products/products.routes.js`

ถ้าจะแก้ส่วนนี้ ให้ยึด backend route files เป็น source of truth ก่อน

