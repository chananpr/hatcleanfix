import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { Article, QueueEntry, SiteContent } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dataPath = path.join(dataDir, "content.json");

const emptyContent: SiteContent = { queues: [], articles: [] };

async function ensureFile(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify(emptyContent, null, 2), "utf8");
  }
}

export async function readContent(): Promise<SiteContent> {
  await ensureFile();
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw) as SiteContent;
    return {
      queues: parsed.queues ?? [],
      articles: parsed.articles ?? [],
    };
  } catch (error) {
    console.error("Failed to read content.json", error);
    return emptyContent;
  }
}

async function writeContent(content: SiteContent): Promise<void> {
  await ensureFile();
  await fs.writeFile(dataPath, JSON.stringify(content, null, 2), "utf8");
}

function slugify(title: string): string {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${safe || "article"}-${Date.now()}`;
}

export async function addQueue(
  payload: Omit<QueueEntry, "id" | "createdAt">
): Promise<QueueEntry> {
  const existing = await readContent();
  const entry: QueueEntry = {
    ...payload,
    quantity: Number(payload.quantity),
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  existing.queues = [entry, ...existing.queues].slice(0, 50);
  await writeContent(existing);
  return entry;
}

export async function addArticle(
  payload: Omit<Article, "id" | "slug" | "publishedAt">
): Promise<Article> {
  const existing = await readContent();
  const article: Article = {
    ...payload,
    id: randomUUID(),
    slug: slugify(payload.title),
    publishedAt: new Date().toISOString(),
  };
  existing.articles = [article, ...existing.articles].slice(0, 100);
  await writeContent(existing);
  return article;
}
