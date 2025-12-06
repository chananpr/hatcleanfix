import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? process.env.DB_PASS ?? '';
const DB_NAME = process.env.DB_NAME || 'hatfixclean';
const DB_SSL = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const DB_SSL_REJECT = String(process.env.DB_SSL_REJECT_UNAUTHORIZED || '').toLowerCase() === 'true';
const DB_SSL_CA = process.env.DB_SSL_CA;

const ssl =
  DB_SSL && DB_SSL_CA
    ? { ca: DB_SSL_CA, rejectUnauthorized: DB_SSL_REJECT }
    : DB_SSL
      ? { rejectUnauthorized: DB_SSL_REJECT }
      : undefined;

export const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  ssl
});

export async function healthCheck() {
  const [rows] = await pool.query('SELECT 1 as ok');
  return rows[0]?.ok === 1;
}
