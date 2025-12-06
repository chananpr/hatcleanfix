import axios from 'axios';
import { Article, QueueJob } from '../types';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBase
});

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
  adminSecret: string
): Promise<Article> {
  const { data } = await api.post<Article>('/articles', payload, {
    headers: { 'x-admin-secret': adminSecret }
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
