# HATZ Hat Fix & Clean - Monorepo

## Structure
```
hatfixclean/
├── frontend/        → www.hatfixclean.com  (Public site, React + Vite, port 3000)
├── admin/           → admin.hatfixclean.com (Backoffice, React + Vite, port 3001)
├── backend/         → api.hatfixclean.com  (Node.js API, port 4000)
├── automation/      → automation.hatfixclean.com (n8n, port 5678)
└── docker-compose.yml  → MySQL + Redis + n8n (dev)
```

## Quick Start (Dev)

### 1. Start infrastructure
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend (public)
```bash
cd frontend
npm run dev   # port 3000
```

### 4. Admin
```bash
cd admin
npm create vite@latest . -- --template react
npm install axios react-router-dom @tanstack/react-query tailwindcss postcss autoprefixer
npm run dev   # port 3001
```

### 5. n8n
Access: http://localhost:5678

## Ports
| Service   | Port |
|-----------|------|
| Public    | 3000 |
| Admin     | 3001 |
| API       | 4000 |
| n8n       | 5678 |
| MySQL     | 3306 |
| Redis     | 6379 |
