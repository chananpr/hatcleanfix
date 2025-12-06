import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, val] = arg.split('=');
    if (!key.startsWith('--')) return;
    args[key.replace(/^--/, '')] = val;
  });
  return args;
}

async function main() {
  const { email, password, role = 'admin' } = parseArgs();
  if (!email || !password) {
    console.error('Usage: npm run create-admin -- --email=someone@example.com --password=Secret123 [--role=admin]');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  try {
    await pool.query(
      `INSERT INTO admin_users (id, email, password_hash, role) VALUES (:id, :email, :passwordHash, :role)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
      { id, email, passwordHash, role }
    );
    console.log(`✅ Admin user saved for ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin', err);
    process.exit(1);
  }
}

main();
