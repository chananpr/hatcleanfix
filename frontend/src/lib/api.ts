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

export async function uploadMedia(
  files: {
    main?: File | null;
    video?: File | null;
    gallery?: File[];
  },
  token: string
): Promise<{
  main: { url: string; key: string; mime: string; size: number } | null;
  video: { url: string; key: string; mime: string; size: number } | null;
  gallery: { url: string; key: string; mime: string; size: number }[];
}> {
  const form = new FormData();
  if (files.main) form.append('main', files.main);
  if (files.video) form.append('video', files.video);
  files.gallery?.forEach((f) => form.append('gallery', f));

  const { data } = await api.post('/uploads', form, {
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
