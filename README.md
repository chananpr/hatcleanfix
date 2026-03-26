# HATZ - Hat Fix & Clean Platform

> **Solo-built** production e-commerce + operations platform with **real AI shipped to production** — not demos, not tutorials, actual AI agents handling live customers and automating business operations daily.

**Live:** [hatfixclean.com](https://hatfixclean.com) &nbsp;|&nbsp; **Admin:** [admin.hatfixclean.com](https://admin.hatfixclean.com) &nbsp;|&nbsp; **API:** [api.hatfixclean.com](https://api.hatfixclean.com)

---

## Why This Project Matters

Most developers add "AI" to their resume after calling one API endpoint. This platform has **4 separate AI systems running in production**, each solving a real business problem — from auto-replying to customers on Messenger to generating content for LinkedIn. Every line of code, every architecture decision, every deployment — built and owned by one person.

---

## Architecture

```
                         ┌──────────────────────────────┐
                         │       Cloudflare DNS/CDN      │
                         └─────┬────────┬────────┬──────┘
                               │        │        │
                  ┌────────────▼─┐ ┌────▼─────┐ ┌▼──────────────┐
                  │   Frontend   │ │  Admin   │ │  Automation   │
                  │   React 19   │ │ React 19 │ │  n8n + AI     │
                  │   Storefront │ │ 4-Role   │ │  Messenger    │
                  │              │ │ RBAC     │ │  Bot          │
                  └──────┬───────┘ └────┬─────┘ └──────┬────────┘
                         │             │               │
                  ┌──────▼─────────────▼───────────────▼────────┐
                  │            Express.js REST API               │
                  │   JWT Auth · 15 Modules · 23 Models · RBAC  │
                  │                                              │
                  │  ┌─────────────────────────────────────┐    │
                  │  │         AI Integration Layer         │    │
                  │  │  Claude SSE · GPT-4o · n8n Agents   │    │
                  │  │  LinkedIn AI · Messenger Bot         │    │
                  │  └─────────────────────────────────────┘    │
                  └──┬──────────┬──────────┬────────────────────┘
                     │          │          │
               ┌─────▼──┐ ┌────▼───┐ ┌────▼───────────┐
               │AWS RDS │ │ Redis  │ │   AWS S3       │
               │MySQL 8 │ │ Cache  │ │ Media Storage  │
               └────────┘ └────────┘ └────────────────┘
```

---

## AI & Automation — The Core Differentiator

This isn't a CRUD app with an AI chatbot bolted on. AI is deeply integrated into the business workflow:

### 1. Claude Admin Chat (SSE Streaming)
Real-time AI assistant inside the admin dashboard. Streams responses via Server-Sent Events for instant feedback. Used daily by the team for operations support.
- **Tech:** Anthropic Claude API, SSE streaming, conversation memory
- **Module:** `backend/src/modules/ai-chat/`

### 2. Messenger AI Bot (n8n + OpenAI)
Fully automated customer support bot on Facebook Messenger. Handles inquiries, collects customer data, and creates lead profiles — all without human intervention.
- **Tech:** n8n workflows, OpenAI GPT-4o, buffer memory, Facebook Messenger API
- **How it works:** Customer messages → n8n webhook → OpenAI processes with context → auto-reply + extract customer data → save to CRM
- **Module:** `automation/` + `backend/src/modules/webhooks/`

### 3. LinkedIn Content Engine (Claude AI)
AI-powered content generation system for LinkedIn personal branding. Generate, review, edit, and track posts — all from the admin panel.
- **Tech:** Claude API, 20-topic rotation, 4 writing styles, post status tracking
- **Flow:** Generate draft → Edit/Review → Copy to LinkedIn → Mark as Posted
- **Module:** `backend/src/modules/linkedin-post/`

### 4. Ad Attribution Intelligence
Automatic tracking from Facebook ad click to customer conversion. Links campaign → adset → ad to actual revenue — giving real ROI per ad.
- **Tech:** Facebook Messenger webhook data extraction, campaign/adset/ad parsing
- **Module:** `backend/src/modules/leads/`

### Automation Workflows (n8n)
Self-hosted n8n instance running production workflows:
- Customer message → AI reply → CRM update (fully automated)
- Payment webhook → Order status update → Customer notification
- Shipment creation → Tracking number → Delivery updates

---

## System Builder Mindset

This project demonstrates end-to-end system ownership — not just writing code, but making every product and infrastructure decision:

| Responsibility | What I Built |
|---|---|
| **Database Design** | 23 Sequelize models, relational schema, migration strategy |
| **API Architecture** | 15 domain modules, clean separation of concerns, middleware chain |
| **Auth & Security** | JWT tokens, 4-role RBAC, route-level permission guards |
| **Payment System** | Xendit QR gateway, webhook-based idempotent processing |
| **Logistics** | iShip API integration, automated shipment creation & tracking |
| **Real-time** | WebSocket (Socket.IO) for live order/warehouse updates |
| **AI Integration** | 4 separate AI systems, each solving different business problems |
| **Infrastructure** | AWS EC2 + RDS + S3, Docker, Nginx, PM2, CI/CD |
| **Frontend** | 2 React 19 apps (storefront + admin), responsive, fast |
| **Automation** | n8n workflows replacing manual business processes |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Zustand, React Query, Recharts |
| **Admin** | React 19, Vite, Tailwind CSS, 4-role RBAC dashboard |
| **Backend** | Node.js, Express.js, Sequelize ORM, Zod validation |
| **Database** | AWS RDS (MySQL 8.0), Redis 7 (session/cache) |
| **Storage** | AWS S3 (media uploads, order photos) |
| **AI** | Claude API (SSE), OpenAI GPT-4o (function calling), n8n AI agents |
| **Automation** | n8n (self-hosted), Facebook Messenger webhooks |
| **Infra** | AWS EC2, Docker Compose, Nginx, PM2 |
| **Payments** | Xendit QR Gateway (webhook-based, idempotent) |
| **Logistics** | iShip API (shipment creation, tracking) |
| **DNS/CDN** | Cloudflare (SSL, caching, DNS) |

## Features

### E-Commerce & Orders
- Public storefront with service catalog and pricing engine
- 15-step order lifecycle (draft → payment → cleaning → QC → delivery)
- Webhook-based payment confirmation (Xendit QR) — orders created only after confirmed payment
- Automated shipment creation & tracking (iShip API)
- S3 image upload for before/after order photos

### Admin Dashboard
- Role-based access control (superadmin, admin, staff, viewer)
- Real-time order management with WebSocket updates
- Customer CRM with Facebook Messenger integration
- Revenue reports & analytics with Recharts
- Lead tracking with ad attribution (campaign → adset → ad ROI)
- AI Chat assistant (Claude SSE streaming)
- LinkedIn content management with AI generation
- n8n automation monitoring

## Project Structure

```
hatfixclean/
├── frontend/          → Public storefront (React 19 + Vite)
├── admin/             → Backoffice dashboard (React 19 + Vite)
│   └── src/pages/
│       ├── DashboardPage     → Analytics overview
│       ├── OrdersPage        → Order lifecycle management
│       ├── AiChatPage        → Claude AI assistant
│       ├── LinkedInPage      → AI content generation + tracking
│       └── AutomationPage    → n8n workflow monitoring
├── backend/           → REST API (Node.js/Express)
│   └── src/modules/
│       ├── ai-chat/       → Claude API (SSE streaming)
│       ├── linkedin-post/ → AI content engine + post tracking
│       ├── webhooks/      → Messenger + payment webhooks
│       ├── orders/        → 15-step order lifecycle
│       ├── payments/      → Xendit QR processing
│       ├── shipments/     → iShip logistics
│       ├── leads/         → Lead + ad attribution tracking
│       ├── customers/     → CRM & customer profiles
│       ├── n8n/           → Automation management
│       ├── dashboard/     → Analytics & reports
│       ├── pricing/       → Service pricing engine
│       ├── content/       → CMS (portfolio, testimonials)
│       ├── auth/          → JWT + RBAC authentication
│       ├── users/         → User management
│       └── reports/       → Revenue & performance
├── automation/        → n8n workflows & AI agent configs
└── docker-compose.yml → MySQL + Redis + n8n
```

## Infrastructure

| Service | Provider | Details |
|---------|----------|---------|
| Compute | AWS EC2 | Ubuntu, ap-southeast-1 (Singapore) |
| Database | AWS RDS | MySQL 8.0, db.t4g.micro |
| Storage | AWS S3 | `hatfixclean-media` bucket |
| Cache | Redis 7 | Docker, session & query cache |
| Automation | n8n | Self-hosted, Docker, production workflows |
| DNS/CDN | Cloudflare | SSL termination, caching, DDoS protection |

## Quick Start

```bash
# 1. Infrastructure
docker-compose up -d   # MySQL + Redis + n8n

# 2. Backend
cd backend
cp .env.example .env   # Configure DB, S3, AI API keys
npm install
npm run sync-db        # Create tables + seed data
npm run dev            # port 4000

# 3. Frontend
cd frontend && npm install && npm run dev    # port 3000

# 4. Admin
cd admin && npm install && npm run dev       # port 3001
```

## Author

**Chanan Preecha** — Solo developer, system builder, AI integration engineer

One person. Two production platforms. Four AI systems. Zero excuses.

[LinkedIn](https://www.linkedin.com/in/chanan-preecha-898750278/) · [GitHub](https://github.com/chananpr)
