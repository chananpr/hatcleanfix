# AI Handbook

ชุดเอกสารนี้เป็น handbook สำหรับ AI assistants ที่จะเข้ามาช่วยพัฒนา `hatfixclean` โดยใช้โค้ดจริงใน repo นี้เป็น source of truth

## เอกสารหลัก

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
  ภาพรวมระบบ, business context, app หลัก, และ flow ที่ต้องเข้าใจก่อนแตะโค้ด
- [ARCHITECTURE.md](ARCHITECTURE.md)
  โครงสร้าง monorepo, runtime map, module map, และ data flow ระดับระบบ
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
  ตารางหลัก, enum/status, และความสัมพันธ์ของ Sequelize models
- [API_REFERENCE.md](API_REFERENCE.md)
  route map ของ backend ตามที่ลงทะเบียนจริงใน `backend/src/index.js` และแต่ละ `*.routes.js`
- [FRONTEND_ADMIN_GUIDE.md](FRONTEND_ADMIN_GUIDE.md)
  route ฝั่ง storefront/admin, auth flow, API client usage, และหน้าใช้งานหลัก
- [CONTRIBUTING_FOR_AI.md](CONTRIBUTING_FOR_AI.md)
  กติกาการทำงาน, safety rules, git rules, และ verification checklist

## Source Of Truth

ถ้าเนื้อหาเอกสารไม่ตรงกับโค้ด ให้เชื่อโค้ดตามลำดับนี้:

1. `backend/src/index.js`
2. `backend/src/modules/*/*.routes.js`
3. `backend/src/models/index.js`
4. `admin/src/App.jsx`
5. `frontend/src/routes/AppRouter.jsx`

## การใช้งานกับ AI

ลำดับที่แนะนำก่อนเริ่มทำงาน:

1. อ่าน `PROJECT_OVERVIEW.md`
2. อ่าน `ARCHITECTURE.md`
3. อ่านเอกสารเฉพาะด้านที่เกี่ยวข้องกับ task
4. อ่าน `CONTRIBUTING_FOR_AI.md` ก่อนแก้โค้ดและก่อน commit

