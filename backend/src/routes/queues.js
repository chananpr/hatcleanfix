import { Router } from 'express';
import { randomUUID } from 'crypto';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, customer, quantity, deadline, status, notes, created_at AS createdAt
       FROM queues
       ORDER BY created_at DESC`
    );
    return res.json(rows);
  } catch (err) {
    console.error('Error fetching queues', err);
    return res.status(500).json({ message: 'Failed to load queues' });
  }
});

router.post('/', async (req, res) => {
  const { customer, quantity, deadline, status, notes } = req.body || {};

  if (!customer || !quantity) {
    return res.status(400).json({ message: 'customer and quantity are required' });
  }

  try {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO queues (id, customer, quantity, deadline, status, notes)
       VALUES (:id, :customer, :quantity, :deadline, :status, :notes)`,
      {
        id,
        customer,
        quantity: Number(quantity),
        deadline: deadline || null,
        status: status || 'pending',
        notes: notes || null
      }
    );

    const [rows] = await pool.query(
      `SELECT id, customer, quantity, deadline, status, notes, created_at AS createdAt
       FROM queues WHERE id = :id LIMIT 1`,
      { id }
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating queue', err);
    return res.status(500).json({ message: 'Failed to create queue' });
  }
});

export default router;
