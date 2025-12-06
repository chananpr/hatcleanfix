import type { Article, ContentResponse, QueueEntry } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4001";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchContent(): Promise<ContentResponse> {
  const res = await fetch(`${API_BASE}/content`, { cache: "no-store" });
  return handleResponse<ContentResponse>(res);
}

export async function fetchArticle(slug: string): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${slug}`, { cache: "no-store" });
  return handleResponse<Article>(res);
}

export async function createQueue(payload: Omit<QueueEntry, "id" | "createdAt">): Promise<QueueEntry> {
  const res = await fetch(`${API_BASE}/admin/queues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_KEY ?? ""}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ queue: QueueEntry }>(res);
  return data.queue;
}

export async function createArticle(payload: Omit<Article, "id" | "slug" | "publishedAt">): Promise<Article> {
  const res = await fetch(`${API_BASE}/admin/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ADMIN_KEY ?? ""}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<{ article: Article }>(res);
  return data.article;
}
