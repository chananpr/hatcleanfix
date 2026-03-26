# HATZ - Hat Fix & Clean Platform

> Full-stack e-commerce + operations platform for a hat cleaning & restoration business.
> Built solo from scratch — React 19, Node.js/Express, MySQL, Redis, AI agents, deployed on AWS.

**Live:** [hatfixclean.com](https://hatfixclean.com) &nbsp;|&nbsp; **Admin:** [admin.hatfixclean.com](https://admin.hatfixclean.com) &nbsp;|&nbsp; **API:** [api.hatfixclean.com](https://api.hatfixclean.com)

---

## Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              Cloudflare DNS              │
                    └──────┬──────────┬──────────┬────────────┘
                           │          │          │
                    ┌──────▼──┐ ┌─────▼────┐ ┌──▼───────────┐
                    │ Frontend│ │  Admin   │ │ Automation   │
                    │ React 19│ │ React 19 │ │ n8n + AI     │
                    │ Vite    │ │ Vite     │ │ Messenger Bot│
                    └────┬────┘ └────┬─────┘ └──────┬───────┘
                         │          │               │
                    ┌────▼──────────▼───────────────▼───────┐
                    │         Express.js REST API            │
                    │  JWT/RBAC · 12 modules · 75 files     │
                    └──┬─────────┬──────────┬───────────────┘
                       │         │          │
                 ┌─────▼──┐ ┌───▼───┐ ┌────▼────────────┐
                 │AWS RDS │ │ Redis │ │   AWS S3        │
                 │MySQL 8 │ │ Cache │ │ Media Storage   │
                 └────────┘ └───────┘ └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Zustand, React Query, Recharts |
| **Admin** | React 19, Vite, Tailwind CSS, 4-role RBAC dashboard |
| **Backend** | Node.js, Express.js, Sequelize ORM, Zod validation |
| **Database** | AWS RDS (MySQL 8.0), Redis 7 (session/cache) |
| **Storage** | AWS S3 (product images, order photos) |
| **AI** | Claude API (SSE streaming admin chat), OpenAI GPT-4o (Messenger bot) |
| **Automation** | n8n workflows, Facebook Messenger webhooks |
| **Infra** | AWS EC2, Docker Compose, Nginx, PM2, CI/CD |
| **Payments** | Xendit QR Gateway (webhook-based) |
| **Logistics** | iShip API (shipment creation, tracking) |

## Features

### E-Commerce & Orders
- Public storefront with service catalog and pricing
- 15-step order lifecycle (draft → payment → cleaning → QC → delivery)
- Webhook-based payment confirmation (Xendit QR)
- Automated shipment creation & tracking (iShip API)
- S3 image upload for before/after order photos

### Admin Dashboard
- Role-based access control (superadmin, admin, staff, viewer)
- Real-time order management with WebSocket updates
- Customer CRM with Facebook Messenger integration
- Revenue reports & analytics with Recharts
- Lead tracking with ad attribution (campaign → adset → ad ROI)

### AI Integration
- **Claude Admin Chat** — SSE streaming chat for internal operations
- **Messenger AI Bot** — n8n + OpenAI auto-reply with buffer memory
- **Ad Attribution** — Automatic customer profiling from Facebook ads

## Project Structure

```
hatfixclean/
├── frontend/          → Public site (React + Vite, port 3000)
├── admin/             → Backoffice dashboard (React + Vite, port 3001)
├── backend/           → REST API (Node.js/Express, port 4000)
│   ├── src/
│   │   ├── config/        → Database, S3, constants
│   │   ├── middlewares/   → Auth, validation, S3 upload
│   │   ├── models/        → 22 Sequelize models
│   │   ├── modules/       → 12 domain modules
│   │   │   ├── auth/          → JWT authentication
│   │   │   ├── orders/        → Order lifecycle management
│   │   │   ├── customers/     → CRM & customer profiles
│   │   │   ├── payments/      → Xendit payment processing
│   │   │   ├── shipments/     → iShip logistics
│   │   │   ├── leads/         → Lead & attribution tracking
│   │   │   ├── ai-chat/       → Claude AI integration
│   │   │   ├── webhooks/      → Messenger & payment webhooks
│   │   │   ├── dashboard/     → Analytics & reports
│   │   │   ├── pricing/       → Service pricing engine
│   │   │   ├── content/       → CMS (portfolio, testimonials)
│   │   │   └── reports/       → Revenue & performance reports
│   │   └── services/      → S3 file management
│   └── .env.example
├── automation/        → n8n workflows & AI agent configs
└── docker-compose.yml → MySQL + Redis + n8n (dev)
```

## Quick Start

```bash
# 1. Infrastructure
docker-compose up -d

# 2. Backend
cd backend
cp .env.example .env   # Configure DB, S3, API keys
npm install
npm run sync-db        # Create tables + seed data
npm run dev

# 3. Frontend
cd frontend && npm install && npm run dev    # port 3000

# 4. Admin
cd admin && npm install && npm run dev       # port 3001
```

## Infrastructure

| Service | Provider | Details |
|---------|----------|---------|
| Compute | AWS EC2 | Ubuntu, Singapore (ap-southeast-1) |
| Database | AWS RDS | MySQL 8.0, db.t4g.micro |
| Storage | AWS S3 | `hatfixclean-media` bucket |
| Cache | Redis 7 | Docker container |
| Automation | n8n | Self-hosted, Docker |
| DNS/CDN | Cloudflare | SSL, caching, DNS management |

## Author

**Chanan Preecha** — Solo developer & technical owner
[LinkedIn](https://www.linkedin.com/in/chanan-preecha-898750278/) · [GitHub](https://github.com/chananpr)
