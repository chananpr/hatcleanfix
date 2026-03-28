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
  summary: (params) => client.get('/api/dashboard/summary', { params }).then((r) => r.data),
  orderStats: (params) => client.get('/api/dashboard/order-stats', { params }).then((r) => r.data),
  revenue: (params) => client.get('/api/dashboard/revenue', { params }).then((r) => r.data),
  attribution: (params) =>
    client.get('/api/dashboard/attribution', { params }).then((r) => r.data),
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
export const pricing = {
  getRules: () => client.get("/api/pricing/rules").then((r) => r.data),
  updateRules: (data) => client.put("/api/pricing/rules", data).then((r) => r.data),
  calculate: (data) => client.post("/api/pricing/calculate", data).then((r) => r.data),
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

// ─── n8n / Automation ────────────────────────────────────────────────────────
export const n8n = {
  getStatus: () => client.get('/api/n8n/status').then((r) => r.data),
  getWorkflows: () => client.get('/api/n8n/workflows').then((r) => r.data),
  getCredentials: () => client.get('/api/n8n/credentials').then((r) => r.data),
  getExecutions: () => client.get('/api/n8n/executions').then((r) => r.data),
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────
export const aiChat = {
  listThreads: () => client.get('/api/ai-chat/threads').then((r) => r.data),
  createThread: () => client.post('/api/ai-chat/threads').then((r) => r.data),
  getThread: (id) => client.get(`/api/ai-chat/threads/${id}`).then((r) => r.data),
  updateThread: (id, title) => client.patch(`/api/ai-chat/threads/${id}`, { title }).then((r) => r.data),
  deleteThread: (id) => client.delete(`/api/ai-chat/threads/${id}`).then((r) => r.data),
  sendMessage: (id, data) => client.post(`/api/ai-chat/threads/${id}/messages`, data).then((r) => r.data),
  regenerate: (id) => client.post(`/api/ai-chat/threads/${id}/regenerate`).then((r) => r.data),
}

// ─── LinkedIn Posts ──────────────────────────────────────────────────────────
export const linkedinPosts = {
  list: () => client.get('/api/linkedin-posts').then((r) => r.data),
  generate: (data) => client.post('/api/linkedin-posts/generate', data).then((r) => r.data),
  generateBatch: (count) => client.post('/api/linkedin-posts/generate-batch', { count }).then((r) => r.data),
  getTopics: () => client.get('/api/linkedin-posts/topics').then((r) => r.data),
  updateStatus: (id, data) => client.patch('/api/linkedin-posts/' + id + '/status', data).then((r) => r.data),
  update: (id, data) => client.put('/api/linkedin-posts/' + id, data).then((r) => r.data),
  remove: (id) => client.delete('/api/linkedin-posts/' + id).then((r) => r.data),
}

// ─── Facebook Pages ──────────────────────────────────────────────────────────
export const facebookPages = {
  list: () => client.get('/api/facebook-pages').then((r) => r.data),
  get: (id) => client.get(`/api/facebook-pages/${id}`).then((r) => r.data),
  create: (data) => client.post('/api/facebook-pages', data).then((r) => r.data),
  update: (id, data) => client.put(`/api/facebook-pages/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/api/facebook-pages/${id}`).then((r) => r.data),
  toggleAi: (id) => client.post(`/api/facebook-pages/${id}/toggle-ai`).then((r) => r.data),
}

// ─── Conversations (Messenger) ───────────────────────────────────────────────
export const conversations = {
  list: (pageId) => client.get('/api/conversations', { params: { page_id: pageId } }).then((r) => r.data),
  getMessages: (threadId) => client.get(`/api/conversations/${threadId}/messages`).then((r) => r.data),
  aiReply: (threadId) => client.post(`/api/conversations/${threadId}/ai-reply`).then((r) => r.data),
  manualReply: (threadId, message) => client.post(`/api/conversations/${threadId}/manual-reply`, { message }).then((r) => r.data),
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = {
  list: (pageId) => client.get('/api/products', { params: { page_id: pageId } }).then(r => r.data),
  get: (id) => client.get(`/api/products/${id}`).then(r => r.data),
  create: (data) => client.post('/api/products', data).then(r => r.data),
  update: (id, data) => client.put(`/api/products/${id}`, data).then(r => r.data),
  remove: (id) => client.delete(`/api/products/${id}`).then(r => r.data),
  toggle: (id) => client.post(`/api/products/${id}/toggle`).then(r => r.data),
  uploadImage: (id, formData) => client.post(`/api/products/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  removeImage: (id, imageKey) => client.post(`/api/products/${id}/delete-image`, { imageKey }).then(r => r.data),
}
