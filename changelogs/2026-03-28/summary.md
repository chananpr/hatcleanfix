# Changelog — 28 มีนาคม 2026

## สรุปงานที่ทำวันนี้

### 1. ระบบ Claude AI Messenger (แทน n8n)
- สร้าง  — เรียก Claude Sonnet API ตรงจาก backend
- ตัด n8n ออกจาก flow ทั้งหมด — webhook ส่งตรงไป Claude เลย
- AI อ่านข้อมูลจากระบบได้: ลูกค้า, ออเดอร์, Lead, ประวัติแชท, สินค้า, ราคา
- สกัดข้อมูลลูกค้าอัตโนมัติ (ชื่อ, จังหวัด, เบอร์โทร) จากบทสนทนา

### 2. Multi-Page Support (รองรับหลายเพจ Facebook)
- สร้างตาราง  — เก็บ page_id, token, AI settings แยกแต่ละเพจ
- สร้าง  +  component — เลือกเพจจาก sidebar
- ทุกหน้า (Dashboard, Leads, Orders, Customers, Products) filter ตาม page_id
- Top bar แสดงเพจที่กำลังดูอยู่ + สถานะ AI

### 3. Facebook App ใหม่ (HATZ Production)
- สร้างแอพ Facebook ใหม่ HATZ Production (App ID: 1345963747555331)
- เชื่อม Webhook + Subscribe 32 ช่อง
- เพิ่มเพจ Hat Fix & Clean (page_id: 920530444474351) พร้อม token

### 4. Admin Panel — หน้าใหม่
- **Messenger Page** () — ดูแชทลูกค้า, กดให้ AI ตอบ, พิมพ์ตอบเอง
- **AI Settings Page** () — เปิด/ปิด AI, ตั้ง persona, แก้ system prompt
  - Redesign UX: Active Page Badge, Toggle Switch, Chat Preview, Collapsible Prompt
- **Products Page** () — สินค้าแยกตามเพจ + S3 upload
- **Page Selector** — dropdown เลือกเพจ ด้านซ้ายบน sidebar

### 5. Backend — Modules ใหม่
-  — CRUD API จัดการเพจ + toggle AI
-  — API ดูแชท + สั่ง AI ตอบ + ส่งข้อความ
-  — CRUD สินค้า + S3 upload + summary endpoint
- อัพเดท  ให้ดึงสินค้า + ราคาจาก DB ส่งให้ AI

### 6. GitHub Profile README
- สร้าง repo  + push profile README
- อัพเดท  README — เพิ่ม badges, AI systems, architecture

---

## ไฟล์ที่แก้ไข/สร้างใหม่

### Backend (สร้างใหม่)
- 
- 
- 
- 
- 
- 
- 

### Backend (แก้ไข)
-  — เพิ่ม routes ใหม่
-  — เพิ่ม FacebookPage model
-  — ใช้ Claude แทน n8n
-  — เพิ่ม page_id filter ทุก controller

### Frontend (สร้างใหม่)
- 
- 
- 
- 
- 
- 
- 

### Frontend (แก้ไข)
-  — เพิ่ม routes ใหม่
-  — เพิ่ม API functions
-  — เพิ่ม PageSelector + top bar
-  — filter ตาม page_id
-  — filter ตาม page_id
-  — filter ตาม page_id
-  — filter ตาม page_id
-  — filter ตาม page_id

---

## Tech Stack ที่ใช้
- **AI**: Claude Sonnet (Anthropic API) — แทน GPT-4o + n8n
- **Backend**: Node.js + Express + Sequelize + MySQL (RDS)
- **Frontend**: React + Vite + Tailwind CSS
- **Infra**: AWS EC2 + PM2 + Docker (Redis, MySQL)
- **Facebook**: Messenger Platform API v19.0
