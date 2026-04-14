# Project Overview

## System Summary

`hatfixclean` เป็น monorepo สำหรับธุรกิจทำความสะอาดและซ่อมหมวก ประกอบด้วย public storefront, admin dashboard, backend API, และ automation assets

ระบบนี้ใช้งานจริงกับ production workflows ไม่ใช่ demo project ดังนั้น AI ต้องระวัง side effect กับข้อมูลลูกค้า, ออเดอร์, payment, และ AI messaging flows

## Applications

### `frontend/`

- เว็บ public สำหรับลูกค้า
- ใช้ React 19 + Vite + Tailwind
- เส้นทางหลักคือหน้าหลัก, บริการ, สำหรับร้านค้า, ผลงาน, privacy policy

### `admin/`

- dashboard ภายในสำหรับทีม
- ใช้ React 19 + Vite
- มี RBAC ตาม role `superadmin`, `admin`, `staff`, `viewer`
- จัดการ leads, customers, orders, pricing, content, messenger, AI chat, และ settings

### `backend/`

- Express API ที่ต่อกับ MySQL ผ่าน Sequelize
- รวม business logic หลักทั้งหมด
- มี route ทั้งฝั่ง CRM, orders, payments, content, reports, AI chat, messenger webhook, และ page-specific configuration

### `automation/`

- workflow assets ภายนอกระบบหลัก
- มีความเกี่ยวข้องกับ automation/n8n แต่ปัจจุบัน AI messaging บางส่วนถูกย้ายมาวิ่งตรงผ่าน backend แล้ว

## Business Flows ที่สำคัญ

### Lead To Order

1. ลูกค้าเข้ามาจาก Messenger หรือช่องทางอื่น
2. ระบบสร้าง `customers` และ/หรือ `leads`
3. lead ถูกแปลงเป็น `orders`
4. order เดินตามสถานะการทำงานจนปิดงาน

### Order Lifecycle

สถานะ order ที่ใช้จริงใน model:

`draft -> awaiting_inbound_shipment -> inbound_shipped -> received -> in_progress -> washing -> shaping -> qc -> completed -> awaiting_payment -> paid -> ready_to_ship -> shipped -> delivered -> closed`

### Customer Messaging

เส้นทาง production ที่สำคัญ:

- Messenger webhook เข้าทาง `backend/src/modules/webhooks`
- conversation data อยู่ใน `conversation_threads` และ `conversation_messages`
- admin สามารถดู thread และส่ง `ai-reply` หรือ `manual-reply` ได้

### Admin AI Chat

- admin AI chat ใช้ route ใน `backend/src/modules/ai-chat`
- รองรับ thread, message, regenerate, และ file attachments
- จำกัดการเข้าถึงฝั่ง route ที่ `superadmin` และ `admin`

## Sensitive Areas

AI ต้องระวังเป็นพิเศษเมื่อแก้ส่วนต่อไปนี้:

- `backend/src/modules/webhooks/*`
- `backend/src/modules/ai-chat/*`
- `backend/src/modules/payments/*`
- `backend/src/modules/orders/*`
- `backend/src/modules/auth/*`
- `backend/src/models/index.js`

## Runtime Commands

```bash
docker-compose up -d

cd backend
npm install
npm run sync-db
npm run dev

cd admin
npm install
npm run dev

cd frontend
npm install
npm run dev
npm run build
npm run lint
```

