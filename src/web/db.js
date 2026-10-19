import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbUrl = process.env.TURSO_DATABASE_URL;
let dbAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl) {
  if (process.env.VERCEL) {
    dbUrl = 'file:/tmp/database.sqlite';
  } else {
    const localDbPath = path.resolve(__dirname, '../../database.sqlite');
    dbUrl = `file:${localDbPath.replace(/\\/g, '/')}`;
  }
}

export const db = createClient({
  url: dbUrl,
  authToken: dbAuthToken
});

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT DEFAULT 'Welcome to my profile',
      avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=avatar',
      is_activated INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      type TEXT DEFAULT 'link',
      clicks INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS redeem_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      is_used INTEGER DEFAULT 0,
      used_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ]);

  try {
    await db.execute("ALTER TABLE links ADD COLUMN subtitle TEXT DEFAULT ''");
  } catch (e) {}
  try {
    await db.execute("ALTER TABLE links ADD COLUMN icon TEXT DEFAULT ''");
  } catch (e) {}
  try {
    await db.execute("ALTER TABLE links ADD COLUMN type TEXT DEFAULT 'link'");
  } catch (e) {}

  isInitialized = true;
}

export async function getUserByUsername(username) {
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE username = ?',
    args: [username.toLowerCase().trim()]
  });
  return result.rows[0] || null;
}

export async function getUserById(id) {
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id]
  });
  return result.rows[0] || null;
}

export async function createUser(username, passwordHash) {
  await initDb();
  const result = await db.execute({
    sql: 'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    args: [username.toLowerCase().trim(), passwordHash]
  });
  return result.lastInsertRowid;
}

export async function updateUserProfile(id, { bio, avatar_url }) {
  await initDb();
  await db.execute({
    sql: 'UPDATE users SET bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
    args: [bio !== undefined ? bio : null, avatar_url !== undefined ? avatar_url : null, id]
  });
}

export async function activateUserWithKey(key, userId) {
  await initDb();
  const keyRecord = await db.execute({
    sql: 'SELECT * FROM redeem_keys WHERE code = ? AND is_used = 0',
    args: [key.trim()]
  });
  const row = keyRecord.rows[0];
  if (!row) {
    throw new Error('Key không hợp lệ hoặc đã qua sử dụng.');
  }

  await db.batch([
    {
      sql: 'UPDATE redeem_keys SET is_used = 1, used_by = ? WHERE id = ?',
      args: [userId, row.id]
    },
    {
      sql: 'UPDATE users SET is_activated = 1 WHERE id = ?',
      args: [userId]
    }
  ]);
  return true;
}

export async function createRedeemKey(code) {
  await initDb();
  await db.execute({
    sql: 'INSERT INTO redeem_keys (code) VALUES (?)',
    args: [code]
  });
}

export async function getLinksByUserId(userId) {
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM links WHERE user_id = ? ORDER BY sort_order ASC, id ASC',
    args: [userId]
  });
  return result.rows;
}

export async function addLink(userId, title, url, subtitle = '', icon = '', type = 'link') {
  await initDb();
  await db.execute({
    sql: 'INSERT INTO links (user_id, title, url, subtitle, icon, type) VALUES (?, ?, ?, ?, ?, ?)',
    args: [userId, title.trim(), url.trim(), (subtitle || '').trim(), (icon || '').trim(), type || 'link']
  });
}

export async function deleteLink(linkId, userId) {
  await initDb();
  await db.execute({
    sql: 'DELETE FROM links WHERE id = ? AND user_id = ?',
    args: [linkId, userId]
  });
}

export async function getLinkById(linkId) {
  await initDb();
  const result = await db.execute({
    sql: 'SELECT * FROM links WHERE id = ?',
    args: [linkId]
  });
  return result.rows[0] || null;
}

export async function incrementLinkClicks(linkId) {
  await initDb();
  await db.execute({
    sql: 'UPDATE links SET clicks = clicks + 1 WHERE id = ?',
    args: [linkId]
  });
}
