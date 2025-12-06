import axios from 'axios';
import type { Article, QueueJob } from '../types';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBase
});

export async function login(
  identifier: string,
  password: string
): Promise<{ token: string; email: string; role: string }> {
  const { data } = await api.post('/auth/login', { identifier, password });
  return data;
}

export async function fetchArticles(): Promise<Article[]> {
  const { data } = await api.get<Article[]>('/articles');
  return data;
}

export async function fetchArticle(slug: string): Promise<Article> {
  const { data } = await api.get<Article>(`/articles/${slug}`);
  return data;
}

export async function createArticle(
  payload: Omit<Article, 'id' | 'publishedAt'> & { publishedAt?: string },
  token: string
): Promise<Article> {
  const { data } = await api.post<Article>('/articles', payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data;
}

export async function createQueueJob(payload: {
  customer: string;
  quantity: number;
  deadline?: string;
  status?: string;
  notes?: string;
}): Promise<QueueJob> {
  const { data } = await api.post<QueueJob>('/queues', payload);
  return data;
}
