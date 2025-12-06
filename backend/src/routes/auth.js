import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) return res.status(400).json({ message: 'identifier and password are required' });

  try {
    const [rows] = await pool.query(
      `SELECT id, email, password_hash AS passwordHash, role FROM admin_users WHERE email = :email LIMIT 1`,
      { email: identifier }
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.ADMIN_JWT_SECRET || 'change-me',
      { expiresIn: '7d' }
    );
    return res.json({ token, email: user.email, role: user.role });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

export default router;
