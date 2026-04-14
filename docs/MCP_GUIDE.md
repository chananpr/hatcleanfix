# MCP Development Guide

คู่มือนี้ใช้เป็น baseline context สำหรับ AI assistants ที่รองรับ MCP หรือมี workflow แบบ tool-augmented เช่น Claude, GPT, และ Gemini เพื่อช่วยพัฒนาโปรเจกต์ `hatcleanfix` ได้ตรงกับโครงสร้างจริงของระบบ ลดการเดา และลดความเสี่ยงจากการแก้ผิดส่วน

## 1. เป้าหมายของเอกสารนี้

- ทำให้ AI เข้าใจโครงสร้าง monorepo นี้ก่อนเริ่มแก้โค้ด
- กำหนดขอบเขตการใช้ tools, git, database, และ environment ให้ปลอดภัย
- ระบุ command พื้นฐานที่ใช้พัฒนาระบบจริง
- ให้ prompt template กลางที่ใช้ได้กับ Claude, GPT, และ Gemini

เอกสารนี้เป็น **project context** ไม่ใช่สเปกผูกกับ vendor รายใดรายหนึ่งโดยตรง ดังนั้นสามารถนำไปวางใน system prompt, project instruction, workspace memory, หรือ MCP resource ได้ตาม client ที่ใช้งาน

## 2. Project Summary

ชื่อระบบ: `HATZ / hatfixclean`

ลักษณะระบบ:

- Monorepo สำหรับธุรกิจทำความสะอาดและซ่อมหมวก
- มี `frontend`, `admin`, `backend`, และ `automation`
- ใช้งาน AI จริงใน production เช่น Claude SSE admin chat, Claude Messenger bot, LinkedIn content generation, และ ad attribution workflow

โครงสร้างหลัก:

```text
hatfixclean/
├── frontend/    Public storefront (React 19 + Vite + Tailwind)
├── admin/       Admin dashboard (React 19 + Vite)
├── backend/     Express API + Sequelize + MySQL
├── automation/  Automation / workflow assets
├── docs/        Project docs and changelogs
└── docker-compose.yml
```

## 3. Tech Stack ที่ AI ต้องรู้ก่อนทำงาน

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router

คำสั่ง:

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

### Admin

- React 19
- Vite
- React Query
- Zustand
- Socket.IO client

คำสั่ง:

```bash
cd admin
npm install
npm run dev
npm run build
```

### Backend

- Node.js
- Express.js
- Sequelize ORM
- MySQL
- Redis
- Anthropic SDK
- AWS S3 SDK

คำสั่ง:

```bash
cd backend
npm install
npm run sync-db
npm run dev
npm start
```

### Infrastructure

```bash
docker-compose up -d
```

## 4. Domain Areas ที่ AI ควรเข้าใจก่อนแก้

Backend modules สำคัญที่มีอยู่จริง:

- `auth`
- `users`
- `orders`
- `payments`
- `shipments`
- `customers`
- `leads`
- `conversations`
- `dashboard`
- `reports`
- `pricing`
- `products`
- `content`
- `facebook-pages`
- `campaigns`
- `address`
- `n8n`
- `ai-chat`
- `linkedin-post`
- `webhooks`

AI ต้องถือว่าโค้ดใน `backend/src/modules/webhooks` และ `backend/src/modules/ai-chat` เป็นจุดสำคัญ เพราะเกี่ยวกับ production AI flow โดยตรง

## 5. Recommended MCP Surface For Development

ถ้าจะเตรียม MCP ให้ AI ใช้งานกับ repo นี้ แนะนำให้มี resource/tool กลุ่มต่อไปนี้

### Required

- `filesystem`
  ใช้อ่านและแก้ไฟล์ใน monorepo
- `git`
  ใช้ดู diff, branch, status, commit history
- `shell`
  ใช้รัน dev server, test, lint, build, และ inspect logs

### Strongly Recommended

- `github`
  ใช้เปิด PR, อ่าน issue, review diff, push workflow
- `mysql`
  ใช้อ่าน schema และตรวจข้อมูลอย่างระมัดระวัง
- `docker`
  ใช้ดู container และ service state

### Optional

- `fetch/http`
  ใช้ตรวจ API endpoint หรือ docs ภายใน
- `memory`
  เก็บ coding conventions, decisions, rollout notes
- `playwright`
  ใช้ทดสอบ flow ฝั่ง `frontend` และ `admin`

## 6. Safe Operating Rules For Any AI

AI ทุกตัวต้องทำตามกติกานี้:

1. อ่านโครงสร้าง repo และไฟล์ที่เกี่ยวข้องก่อนแก้เสมอ
2. ห้ามเดา API contract, database schema, หรือ business flow ถ้ายังไม่ได้เปิดดูโค้ด
3. ห้ามแก้ `.env`, secret, credential, token, key หรือ production config โดยพลการ
4. ห้ามใช้คำสั่ง destructive เช่น `git reset --hard`, `git checkout --`, `rm -rf` ถ้าไม่มีคำสั่งชัดเจน
5. ถ้า worktree มีไฟล์อื่นถูกแก้อยู่ ให้หลบออกจาก scope นั้นและไม่ revert งานคนอื่น
6. ก่อน commit ต้องสรุปสิ่งที่แก้, ความเสี่ยง, และวิธี verify
7. ถ้ารัน test/build ไม่ได้ ต้องบอกชัดว่าเพราะอะไร

## 7. Git Workflow ที่ควรใช้

มาตรฐานขั้นต่ำ:

```bash
git status --short
git diff -- <file>
git add <file>
git commit -m "docs: add MCP development guide"
git push origin main
```

กติกา:

- commit message ให้สั้น ชัด และบอก intent
- ไม่รวมไฟล์ที่ไม่ได้เกี่ยวกับงานนี้
- ถ้ามีไฟล์อื่นค้างอยู่ใน repo ให้ stage เฉพาะไฟล์เอกสารที่เพิ่ม/แก้จริง

## 8. Suggested Project Context For AI System Prompt

ใช้ข้อความด้านล่างเป็น baseline prompt ได้:

```text
You are working in the hatfixclean monorepo.

Repository structure:
- frontend: public storefront built with React 19, Vite, Tailwind
- admin: internal dashboard built with React 19, Vite, React Query, Zustand
- backend: Express + Sequelize + MySQL API with AI integrations
- docs: project documentation and changelogs

Important business context:
- This is a real production business platform for hat cleaning and repair
- AI is used in admin chat, Messenger automation, LinkedIn content workflows, and attribution
- Protect production logic in backend/src/modules/webhooks and backend/src/modules/ai-chat

Working rules:
- Read relevant files first
- Do not assume schema or API behavior
- Avoid destructive git commands
- Do not revert unrelated changes
- Prefer minimal, targeted patches
- Always report verification status and residual risk
```

## 9. Prompt Templates แยกตาม AI

### Claude

```text
Use the repository context in docs/MCP_GUIDE.md as source of truth.
Before editing, inspect the relevant files and summarize the impacted modules.
Make the smallest safe patch possible.
If backend AI flows are touched, call out behavioral risk explicitly.
```

### GPT

```text
Act as a senior engineer working inside the hatfixclean monorepo.
Use docs/MCP_GUIDE.md as project context.
Do not make assumptions about database schema or API routes without reading code.
Prefer concrete diffs, exact file references, and explicit verification notes.
```

### Gemini

```text
Use docs/MCP_GUIDE.md as the repository operating manual.
Inspect the codebase first, then propose or apply minimal edits.
Preserve unrelated local changes.
Report what changed, how it was verified, and what still needs manual checking.
```

## 10. MCP Resource Ideas

ถ้าจะ expose context นี้ผ่าน MCP ให้สร้าง resource ที่ชื่อใกล้เคียงแบบนี้:

- `project://overview`
- `project://architecture`
- `project://commands`
- `project://git-rules`
- `project://ai-safety`

โดย resource เหล่านี้สามารถ map จากเอกสารนี้และ README หลักได้โดยตรง

## 11. Suggested MCP Server Responsibilities

### `project-context`

ให้ข้อมูล:

- repo structure
- business overview
- coding rules
- common commands

### `project-git`

ให้ความสามารถ:

- read branch/status/diff
- create focused commits
- avoid staging unrelated files by default

### `project-db`

ให้ความสามารถ:

- read schema
- inspect data safely
- block write operations unless explicitly approved

### `project-runtime`

ให้ความสามารถ:

- run `npm run dev`, `npm run build`, `npm run lint`
- inspect logs
- check container health

## 12. Verification Checklist สำหรับ AI

ก่อนปิดงานทุกครั้ง AI ควรเช็ก:

- ไฟล์ที่แก้ตรง scope จริงหรือไม่
- มี syntax/build/lint impact หรือไม่
- มีผลต่อ production AI flows หรือไม่
- มี migration/config/env dependency เพิ่มหรือไม่
- commit/push เฉพาะไฟล์ที่เกี่ยวข้องแล้วหรือยัง

## 13. Current Limitation

เอกสารนี้ intentionally เขียนแบบ vendor-neutral เพื่อใช้ร่วมกันได้กับหลาย AI client หาก client ใดต้องใช้ syntax config MCP เฉพาะของตัวเอง เช่น path ของ config file, JSON schema, หรือ launch format ให้ใช้เอกสารนี้เป็น source of truth ฝั่ง project context แล้วค่อย map ไปยังรูปแบบ config ของ client นั้น

