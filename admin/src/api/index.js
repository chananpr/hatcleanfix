import client from './client.js'

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  login: (email, password) =>
    client.post('/api/auth/login', { email, password }).then((r) => r.data),
  me: () => client.get('/api/auth/me').then((r) => r.data),
}

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = {
  list: (params) => client.get('/api/leads', { params }).then((r) => r.data),
  get: (id) => client.get(`/api/leads/${id}`).then((r) => r.data),
  create: (data) => client.post('/api/leads', data).then((r) => r.data),
  update: (id, data) => client.put(`/api/leads/${id}`, data).then((r) => r.data),
  updateStatus: (id, status) =>
    client.patch(`/api/leads/${id}/status`, { status }).then((r) => r.data),
  convert: (id) => client.post(`/api/leads/${id}/convert`).then((r) => r.data),
  assign: (id, userId) =>
    client.patch(`/api/leads/${id}/assign`, { user_id: userId }).then((r) => r.data),
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = {
  list: (params) => client.get('/api/orders', { params }).then((r) => r.data),
  get: (id) => client.get(`/api/orders/${id}`).then((r) => r.data),
  create: (data) => client.post('/api/orders', data).then((r) => r.data),
  update: (id, data) => client.put(`/api/orders/${id}`, data).then((r) => r.data),
  updateStatus: (id, status, note) =>
    client.patch(`/api/orders/${id}/status`, { status, note }).then((r) => r.data),
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const customers = {
  list: (params) => client.get('/api/customers', { params }).then((r) => r.data),
  get: (id) => client.get(`/api/customers/${id}`).then((r) => r.data),
  create: (data) => client.post('/api/customers', data).then((r) => r.data),
  update: (id, data) => client.put(`/api/customers/${id}`, data).then((r) => r.data),
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = {
  list: () => client.get('/api/users').then((r) => r.data),
  get: (id) => client.get(`/api/users/${id}`).then((r) => r.data),
  create: (data) => client.post('/api/users', data).then((r) => r.data),
  update: (id, data) => client.put(`/api/users/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/api/users/${id}`).then((r) => r.data),
  listRoles: () => client.get('/api/users/roles').then((r) => r.data),
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboard = {
  summary: () => client.get('/api/dashboard/summary').then((r) => r.data),
  orderStats: () => client.get('/api/dashboard/order-stats').then((r) => r.data),
  revenue: (params) => client.get('/api/dashboard/revenue', { params }).then((r) => r.data),
  attribution: (params) =>
    client.get('/api/dashboard/attribution', { params }).then((r) => r.data),
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
export const pricing = {
  list: () => client.get('/api/pricing').then((r) => r.data),
  update: (data) => client.put('/api/pricing', data).then((r) => r.data),
}

// ─── Content ──────────────────────────────────────────────────────────────────
export const content = {
  portfolio: {
    list: () => client.get('/api/content/portfolio').then((r) => r.data),
    create: (data) => client.post('/api/content/portfolio', data).then((r) => r.data),
    toggle: (id) =>
      client.patch(`/api/content/portfolio/${id}/toggle`).then((r) => r.data),
    remove: (id) => client.delete(`/api/content/portfolio/${id}`).then((r) => r.data),
  },
  testimonials: {
    list: () => client.get('/api/content/testimonials').then((r) => r.data),
    create: (data) => client.post('/api/content/testimonials', data).then((r) => r.data),
    toggle: (id) =>
      client.patch(`/api/content/testimonials/${id}/toggle`).then((r) => r.data),
    remove: (id) => client.delete(`/api/content/testimonials/${id}`).then((r) => r.data),
  },
  settings: {
    get: () => client.get('/api/content/settings').then((r) => r.data),
    update: (data) => client.put('/api/content/settings', data).then((r) => r.data),
  },
}

// ─── LinkedIn Posts ──────────────────────────────────────────────────────────
export const linkedinPosts = {
  generate: (data) => client.post('/api/linkedin-posts/generate', data).then((r) => r.data),
  generateBatch: (count) => client.post('/api/linkedin-posts/generate-batch', { count }).then((r) => r.data),
  getTopics: () => client.get('/api/linkedin-posts/topics').then((r) => r.data),
}
