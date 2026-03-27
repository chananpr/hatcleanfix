<div align="center">

# 🎩 HATZ — Hat Fix & Clean Platform

### AI-Powered E-Commerce & Operations Platform

**Solo-built.** Production-grade. Real AI in production — not demos.

[![Live](https://img.shields.io/badge/🌐_Live-hatfixclean.com-blue?style=for-the-badge)](https://hatfixclean.com)
[![Admin](https://img.shields.io/badge/🔧_Admin-admin.hatfixclean.com-green?style=for-the-badge)](https://admin.hatfixclean.com)
[![API](https://img.shields.io/badge/⚡_API-api.hatfixclean.com-orange?style=for-the-badge)](https://api.hatfixclean.com)

</div>

---

## 📸 Screenshots

| Admin Dashboard | AI Chat (Claude SSE) | Messenger Bot Flow |
|:---:|:---:|:---:|
| ![Dashboard](docs/screenshots/dashboard.png) | ![AI Chat](docs/screenshots/ai-chat.png) | ![Messenger Flow](docs/screenshots/messenger-flow.png) |

| Order Lifecycle | Payment & Logistics | LinkedIn AI Engine |
|:---:|:---:|:---:|
| ![Orders](docs/screenshots/orders.png) | ![Payment](docs/screenshots/payment.png) | ![LinkedIn](docs/screenshots/linkedin-ai.png) |

---

## 🧠 Overview

A complete **production SaaS platform** for a hat cleaning business — handling everything from customer-facing e-commerce to internal operations, payments, logistics, and AI-powered automation.

**This is not a tutorial project.** It runs a real business with real customers, real payments, and real AI agents working 24/7.

> **One person. Four AI systems. Two platforms. Zero excuses.**

---

## 🤖 AI Systems — The Core Differentiator

> 90% of developers don't have this. This is the killer point.

### 1. 💬 Claude Admin Chat — SSE Streaming
Real-time AI assistant inside the admin dashboard. Streams responses instantly via Server-Sent Events.

```
Admin asks question → Claude API → SSE Stream → Real-time response
```

- Anthropic Claude API with conversation memory
- Server-Sent Events for instant streaming UX
- Used daily for operations support

### 2. 🤖 Messenger AI Bot — GPT-4o + n8n (16 Functions)
Fully automated customer support on Facebook Messenger. **Zero human intervention.**

```
Customer message → Facebook Webhook → n8n → GPT-4o (16 functions) → Auto-reply + CRM update
```

- OpenAI GPT-4o with **16 function calling tools**
- Auto-extracts: name, phone, address, service needed
- Creates leads & orders from conversation
- Context-aware responses with buffer memory

### 3. ✍️ LinkedIn AI Engine — Content Generation
AI-powered content system for personal branding. Generate → Edit → Post → Track.

```
Select topic → Claude generates draft → Review/Edit → Post to LinkedIn → Track performance
```

- 20-topic rotation, 4 writing styles
- Full post lifecycle management
- Performance tracking per post

### 4. 📊 Ad Attribution Intelligence
Automatic tracking: **Facebook Ad Click → Customer Conversion → Revenue**

```
Ad click → Messenger → Extract campaign/adset/ad → Link to customer → Calculate ROI
```

- Real ROI per ad campaign
- Campaign → Adset → Ad level tracking
- Revenue attribution per customer

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CDN["☁️ Cloudflare CDN / SSL"]
    end

    subgraph Clients["Client Layer"]
        FE["🌐 Storefront<br/>React 19 · Vite"]
        ADMIN["🔧 Admin Panel<br/>React 19 · 4-Role RBAC"]
        N8N["⚡ n8n<br/>AI Workflows"]
    end

    subgraph API["🖥️ Express.js API — 15 Modules · 23 Models"]
        AUTH["🔐 Auth · JWT · RBAC"]
        ORDERS["📦 Orders · 15-Step"]
        PAY["💳 Xendit QR"]
        SHIP["🚚 iShip API"]
        CRM["👥 CRM · Leads"]
        DASH["📊 Analytics"]
    end

    subgraph AI["🤖 AI Layer"]
        CLAUDE["Claude API<br/>SSE Streaming"]
        GPT["GPT-4o<br/>16 Functions"]
        LINKEDIN["Claude AI<br/>Content Engine"]
        ATTR["Ad Attribution<br/>ROI Tracking"]
    end

    subgraph Cloud["☁️ AWS"]
        RDS[("MySQL 8.0<br/>AWS RDS")]
        S3["S3 Storage"]
        REDIS["Redis 7<br/>Cache"]
    end

    CDN --> Clients
    Clients --> API
    API --> AI
    API --> Cloud
    AI --> Cloud

    style AI fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style CLAUDE fill:#d946ef,stroke:#c026d3,color:#fff
    style GPT fill:#06b6d4,stroke:#0891b2,color:#fff
    style LINKEDIN fill:#3b82f6,stroke:#2563eb,color:#fff
```

### AI Data Flow

```mermaid
flowchart LR
    A["👤 Customer"] -->|message| B["📨 Messenger"]
    B --> C["⚡ n8n"]
    C --> D["🤖 GPT-4o<br/>16 functions"]
    D -->|auto-reply| A
    C -->|extract data| E[("🗄️ CRM")]
    C -->|track| F["📊 Ad ROI"]

    G["👨‍💻 Admin"] -->|chat| H["🤖 Claude<br/>SSE Stream"]
    H -->|response| G
    G -->|generate| I["✍️ LinkedIn AI"]
    I -->|draft| G

    style D fill:#06b6d4,stroke:#0891b2,color:#fff
    style H fill:#d946ef,stroke:#c026d3,color:#fff
    style I fill:#3b82f6,stroke:#2563eb,color:#fff
```

---

## 🏪 Core Features

### E-Commerce & Orders
- 🛒 Public storefront with service catalog & pricing engine
- 📦 **15-step order lifecycle** (draft → payment → cleaning → QC → delivery)
- 💳 Webhook-based Xendit QR payments (idempotent processing)
- 🚚 Automated shipment creation & tracking (iShip API)
- 📸 S3 image upload for before/after photos

### Admin Dashboard (4-Role RBAC)
- 📊 Real-time analytics with Recharts
- 📋 Order management with WebSocket live updates
- 👥 Customer CRM with Messenger integration
- 💰 Revenue reports & ad attribution
- 🤖 AI Chat, LinkedIn AI, Automation monitoring

---

## 🛠️ Tech Stack

| Layer | Technology |
|:--|:--|
| **Frontend** | React 19, Vite, Tailwind CSS, Zustand, React Query |
| **Backend** | Node.js, Express.js, Sequelize ORM, Zod |
| **Database** | AWS RDS MySQL 8.0, Redis 7 |
| **AI** | Claude API (SSE), OpenAI GPT-4o (16 function calls), n8n AI agents |
| **Payments** | Xendit QR Gateway (webhook) |
| **Logistics** | iShip API |
| **Infra** | AWS EC2 + RDS + S3, Docker, Nginx, PM2, Cloudflare |

---

## 🚀 Quick Start

```bash
# Infrastructure
docker-compose up -d          # MySQL + Redis + n8n

# Backend
cd backend && cp .env.example .env && npm install
npm run sync-db && npm run dev   # → port 4000

# Frontend
cd frontend && npm install && npm run dev    # → port 3000

# Admin
cd admin && npm install && npm run dev       # → port 3001
```

---

## 📁 Project Structure

```
hatfixclean/
├── frontend/          → Public storefront (React 19)
├── admin/             → Backoffice dashboard (React 19, RBAC)
├── backend/src/modules/
│   ├── ai-chat/       → Claude SSE streaming
│   ├── linkedin-post/ → AI content engine
│   ├── webhooks/      → Messenger + payment webhooks
│   ├── orders/        → 15-step order lifecycle
│   ├── payments/      → Xendit QR processing
│   ├── shipments/     → iShip logistics
│   ├── leads/         → Lead + ad attribution
│   ├── customers/     → CRM
│   └── ... 15 modules total
├── automation/        → n8n workflows & AI configs
└── docker-compose.yml
```

---

## 💡 Key Takeaways

- ✅ **Production system**, not a prototype — serves real customers daily
- ✅ **4 AI systems** integrated into actual business operations
- ✅ **Full ownership** — every architecture decision, every deployment, one person
- ✅ **Real payments**, real logistics, real data — not mock APIs
- ✅ **Scalable infrastructure** — 99.9% uptime on AWS

---

## 👤 Author

**Chanan Preecha (Mai)** — Solo developer & system builder

I'm particularly interested in working as an early technical member to help build and scale products with real impact.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/chanan-preecha-898750278/)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=flat-square&logo=gmail)](mailto:chanan.pr1145x@gmail.com)
