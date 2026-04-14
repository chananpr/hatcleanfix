# Architecture

## Monorepo Layout

```text
hatfixclean/
├── frontend/    Public storefront
├── admin/       Internal dashboard
├── backend/     Express + Sequelize API
├── automation/  Workflow assets
├── docs/        Project documentation
└── docker-compose.yml
```

## System Boundaries

### Storefront

- Source: `frontend/src`
- Routing source of truth: `frontend/src/routes/AppRouter.jsx`
- ส่วนนี้เน้น content-driven pages และไม่ได้มี auth flow ของลูกค้าใน code ชุดที่อ่านมา

### Admin

- Source: `admin/src`
- Routing source of truth: `admin/src/App.jsx`
- auth gate ใช้ `admin/src/components/common/ProtectedRoute.jsx`
- auth state เก็บใน `admin/src/stores/auth.store.js`
- API wrappers รวมอยู่ใน `admin/src/api/index.js`

### Backend

- Entrypoint: `backend/src/index.js`
- route registration อยู่ในไฟล์เดียวนี้
- domain logic กระจายตาม `backend/src/modules/<module>`
- database models และ associations อยู่ที่ `backend/src/models/index.js`

## Backend Module Map

ลงทะเบียนจริงใน `backend/src/index.js`:

- `/api/auth`
- `/api/users`
- `/api/customers`
- `/api/leads`
- `/api/orders`
- `/api/shipments`
- `/api/payments`
- `/api/webhooks`
- `/api/dashboard`
- `/api/content`
- `/api/pricing`
- `/api/reports`
- `/api/linkedin-posts`
- `/api/n8n`
- `/api/ai-chat`
- `/api/facebook-pages`
- `/api/products`
- `/api/conversations`
- `/api/campaigns`
- `/api/address`

## Access Model

### Backend auth

- ส่วนใหญ่ใช้ `authMiddleware`
- บาง route ใช้ `requireRole`
- role ที่พบในระบบ: `superadmin`, `admin`, `staff`, `viewer`

### Admin auth

- token เก็บใน `localStorage` key `hatz_token`
- user object เก็บใน `localStorage` key `hatz_user`
- ถ้าไม่ authenticated จะถูก redirect ไป `/login`
- ถ้ามี role restriction แต่ role ไม่ตรง จะขึ้นหน้า "ไม่มีสิทธิ์เข้าถึง"

## Realtime / Streaming

- backend เปิด Socket.IO server ใน `backend/src/index.js`
- มี room แบบ `page_<pageId>`
- messenger services ผูก IO ผ่าน `setIO(io)`
- AI chat และ messenger flows จึงมีผลกับทั้ง API และ realtime behavior

## External Dependency Signals

จากโค้ดและ package files มี dependency ภายนอกที่สำคัญ:

- MySQL
- Redis
- AWS S3
- Anthropic SDK
- Facebook Messenger / Facebook Pages
- n8n

## Architecture Rules For AI

- อย่าเดา route path เอง ให้ยึด `backend/src/index.js` และ `*.routes.js`
- อย่าเดา table relation เอง ให้ยึด `backend/src/models/index.js`
- ส่วน `webhooks` และ `ai-chat` มีผลกับ production AI behavior โดยตรง
- ถ้าจะแก้ admin page ให้ตรวจ API wrapper ใน `admin/src/api/index.js` ควบคู่เสมอ

