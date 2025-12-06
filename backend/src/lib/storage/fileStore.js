import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const DEFAULT_PATH = path.join(process.cwd(), "data", "content.json");

async function ensureFile(dataFile = DEFAULT_PATH) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify({ queues: [], articles: [] }, null, 2));
  }
}

export async function readContent(dataFile = DEFAULT_PATH) {
  await ensureFile(dataFile);
  const raw = await fs.readFile(dataFile, "utf8");
  const parsed = JSON.parse(raw);
  return {
    queues: parsed.queues ?? [],
    articles: parsed.articles ?? [],
  };
}

async function writeContent(content, dataFile = DEFAULT_PATH) {
  await ensureFile(dataFile);
  await fs.writeFile(dataFile, JSON.stringify(content, null, 2), "utf8");
}

export async function addQueue(payload, dataFile = DEFAULT_PATH) {
  const existing = await readContent(dataFile);
  const entry = {
    ...payload,
    quantity: Number(payload.quantity),
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  existing.queues = [entry, ...existing.queues].slice(0, 200);
  await writeContent(existing, dataFile);
  return entry;
}

export async function addArticle(payload, dataFile = DEFAULT_PATH) {
  const existing = await readContent(dataFile);
  const slug = slugify(payload.title);
  const article = {
    ...payload,
    id: randomUUID(),
    slug,
    publishedAt: new Date().toISOString(),
  };
  existing.articles = [article, ...existing.articles].slice(0, 500);
  await writeContent(existing, dataFile);
  return article;
}

export async function getArticleBySlug(slug, dataFile = DEFAULT_PATH) {
  const { articles } = await readContent(dataFile);
  return articles.find((a) => a.slug === slug) || null;
}

function slugify(title) {
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${safe || "article"}-${Date.now()}`;
}
