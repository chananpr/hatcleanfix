import { randomUUID } from "crypto";
import mysql from "mysql2/promise";

function createPool(config) {
  const { host, port, user, password, database, ssl } = config;
  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: ssl ? { rejectUnauthorized: false } : undefined,
  });
}

export function mysqlStore(config) {
  const pool = createPool(config);

  async function readContent() {
    const [queues] = await pool.query(
      "SELECT id, customer, quantity, deadline, status, notes, created_at AS createdAt FROM queues ORDER BY created_at DESC LIMIT 200"
    );
    const [articles] = await pool.query(
      "SELECT id, slug, title, summary, body, image_url AS imageUrl, video_url AS videoUrl, published_at AS publishedAt FROM articles ORDER BY published_at DESC LIMIT 500"
    );
    return { queues, articles };
  }

  async function addQueue(payload) {
    const id = randomUUID();
    const createdAt = new Date();
    const { customer, quantity, deadline, status, notes } = payload;
    await pool.query(
      "INSERT INTO queues (id, customer, quantity, deadline, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, customer, Number(quantity), deadline || null, status, notes || null, createdAt]
    );
    return { id, customer, quantity: Number(quantity), deadline, status, notes, createdAt };
  }

  async function addArticle(payload) {
    const id = randomUUID();
    const slug = slugify(payload.title);
    const publishedAt = new Date();
    const { title, summary, body, imageUrl, videoUrl } = payload;
    await pool.query(
      "INSERT INTO articles (id, slug, title, summary, body, image_url, video_url, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, slug, title, summary, body, imageUrl || null, videoUrl || null, publishedAt]
    );
    return { id, slug, title, summary, body, imageUrl, videoUrl, publishedAt };
  }

  async function getArticleBySlug(slug) {
    const [rows] = await pool.query(
      "SELECT id, slug, title, summary, body, image_url AS imageUrl, video_url AS videoUrl, published_at AS publishedAt FROM articles WHERE slug = ? LIMIT 1",
      [slug]
    );
    return rows[0] || null;
  }

  return { readContent, addQueue, addArticle, getArticleBySlug };
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
