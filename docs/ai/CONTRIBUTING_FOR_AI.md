# Contributing For AI

## Working Principles

1. อ่าน code ที่เกี่ยวข้องก่อนเสนอหรือแก้ไข
2. ยึดโค้ดเป็น source of truth ไม่ยึดความจำ
3. แก้ให้น้อยที่สุดแต่ครบตามเป้าหมาย
4. ระบุผลกระทบและความเสี่ยงทุกครั้งก่อนจบงาน

## Files To Check Before Editing

### ถ้าแก้ backend API

- `backend/src/index.js`
- `backend/src/modules/<module>/*.routes.js`
- `backend/src/modules/<module>/*.controller.js`
- `backend/src/modules/<module>/*.service.js`
- `backend/src/models/index.js`

### ถ้าแก้ admin

- `admin/src/App.jsx`
- `admin/src/api/index.js`
- page/component ที่เกี่ยวข้อง

### ถ้าแก้ storefront

- `frontend/src/routes/AppRouter.jsx`
- page/component/data file ที่เกี่ยวข้อง

## Safety Rules

- ห้ามเดา database relation เอง
- ห้ามเดา endpoint เอง
- ห้าม revert งานคนอื่น
- ห้ามใช้ destructive git commands ถ้าไม่ได้รับคำสั่งชัดเจน
- ห้ามแก้ secret, token, credential, หรือ production URLs โดยไม่มีเหตุผลชัด
- route ที่เกี่ยวกับ `webhooks`, `payments`, `orders`, `ai-chat`, `conversations` ให้ถือว่า high-risk

## Git Rules

- ก่อน stage ให้ตรวจ `git status --short`
- commit เฉพาะไฟล์ที่เกี่ยวกับงาน
- ถ้า worktree มีไฟล์อื่นแก้ค้างอยู่ ให้หลบออกจาก scope นั้นถ้าไม่เกี่ยว
- ใช้ commit message ที่บอก intent ชัด

## Verification Checklist

ก่อนปิดงาน ให้ตอบให้ได้ว่า:

- route path ยังตรงกับ backend route files หรือไม่
- data shape ยังตรงกับ model/controller หรือไม่
- role restrictions ยังถูกต้องหรือไม่
- มีผลกับ production AI flow หรือไม่
- ต้องรัน build/lint/test อะไรบ้าง
- มี code mismatch ใหม่ระหว่าง admin API client กับ backend หรือไม่

## Recommended Reading Order For AI

1. `docs/ai/PROJECT_OVERVIEW.md`
2. `docs/ai/ARCHITECTURE.md`
3. `docs/ai/DATABASE_SCHEMA.md` หรือ `docs/ai/API_REFERENCE.md` ตามงาน
4. `docs/ai/FRONTEND_ADMIN_GUIDE.md` ถ้าแตะ UI/admin
5. `docs/MCP_GUIDE.md` สำหรับ MCP/tooling context เพิ่มเติม

