# Hat Fix & Clean

Landing site + admin article tool for the hat laundry business. Frontend uses React (Vite + Tailwind). Backend uses Node.js + Express with MySQL (port 5000).

## Quick start

1) Database (MySQL 8+):
```sql
CREATE DATABASE hatfixclean CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hatfixclean;

CREATE TABLE queues (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  customer TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  deadline DATE NULL,
  status VARCHAR(100) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id)
);
CREATE INDEX queues_created_at_idx ON queues (created_at DESC);

CREATE TABLE articles (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  slug VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body LONGTEXT NOT NULL,
  image_url TEXT NULL,
  video_url TEXT NULL,
  published_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id)
);
CREATE INDEX articles_published_idx ON articles (published_at DESC);

CREATE TABLE admin_users (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id)
);
```

2) Backend (`backend/`)
```bash
cp .env.example .env              # fill DB + ADMIN_SECRET
npm install
npm run dev                       # or npm start
# server listens on PORT (default 5000)
```

API routes:
- `GET /api/articles`, `GET /api/articles/:slug`
- `POST /api/articles` (header `x-admin-secret`)
- `POST /api/queues`, `GET /api/queues` (admin header)

Create admin user (hashed password):
```bash
cd backend
npm run create-admin -- --email=you@example.com --password=SuperSecret123
```

3) Frontend (`frontend/`)
```bash
cp .env.example .env              # set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                       # Vite on http://localhost:5173
```

Pages:
- `/` landing page + article list + quick queue form
- `/articles/:slug` SEO article view
- `/admin` simple article creator (sends `x-admin-secret`)

Domains / CORS:
- Set `FRONTEND_ORIGIN` or `CLIENT_ORIGINS` (comma separated) in backend `.env`, e.g.
  `CLIENT_ORIGINS=https://www.hatfixclean.com,https://admin.hatfixclean.com`
- Point frontend to API domain via `VITE_API_URL` (e.g. `https://api.hatfixclean.com/api`).
- For managed MySQL (e.g. DigitalOcean), enable `DB_SSL=true` and set `DB_SSL_REJECT_UNAUTHORIZED=false` (or add CA in `DB_SSL_CA`).
