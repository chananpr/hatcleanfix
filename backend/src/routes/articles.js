import { Router } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, slug, title, summary, body, category, main_image_url AS mainImageUrl, gallery_urls AS galleryUrls, image_url AS imageUrl, video_url AS videoUrl, published_at AS publishedAt
       FROM articles
       ORDER BY published_at DESC`
    );
    const normalized = rows.map((r) => ({
      ...r,
      galleryUrls: r.galleryUrls ? JSON.parse(r.galleryUrls) : []
    }));
    return res.json(normalized);
  } catch (err) {
    console.error('Error fetching articles', err);
    return res.status(500).json({ message: 'Failed to load articles' });
  }
});

router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT id, slug, title, summary, body, category, main_image_url AS mainImageUrl, gallery_urls AS galleryUrls, image_url AS imageUrl, video_url AS videoUrl, published_at AS publishedAt
       FROM articles WHERE slug = :slug LIMIT 1`,
      { slug }
    );
    if (!rows.length) return res.status(404).json({ message: 'Article not found' });
    const row = rows[0];
    return res.json({ ...row, galleryUrls: row.galleryUrls ? JSON.parse(row.galleryUrls) : [] });
  } catch (err) {
    console.error('Error fetching article', err);
    return res.status(500).json({ message: 'Failed to load article' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { slug, title, summary, body, imageUrl, videoUrl, publishedAt, category = 'article', mainImageUrl, galleryUrls } =
    req.body || {};

  if (!slug || !title || !summary || !body) {
    return res.status(400).json({ message: 'slug, title, summary, and body are required' });
  }

  try {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO articles (id, slug, title, summary, body, category, main_image_url, gallery_urls, image_url, video_url, published_at)
       VALUES (:id, :slug, :title, :summary, :body, :category, :mainImageUrl, :galleryUrls, :imageUrl, :videoUrl, :publishedAt)`,
      {
        id,
        slug,
        title,
        summary,
        body,
        category,
        mainImageUrl: mainImageUrl || imageUrl || null,
        galleryUrls: galleryUrls ? JSON.stringify(galleryUrls) : null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date()
      }
    );

    const [rows] = await pool.query(
      `SELECT id, slug, title, summary, body, category, main_image_url AS mainImageUrl, gallery_urls AS galleryUrls, image_url AS imageUrl, video_url AS videoUrl, published_at AS publishedAt
       FROM articles WHERE id = :id LIMIT 1`,
      { id }
    );

    const row = rows[0];
    return res.status(201).json({ ...row, galleryUrls: row.galleryUrls ? JSON.parse(row.galleryUrls) : [] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Slug already exists' });
    }
    console.error('Error creating article', err);
    return res.status(500).json({ message: 'Failed to create article' });
  }
});

export default router;
