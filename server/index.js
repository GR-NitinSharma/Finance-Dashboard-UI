const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Database Setup ────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'app.db'));
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    UNIQUE NOT NULL,
    full_name   TEXT    NOT NULL,
    profession  TEXT    NOT NULL,
    password        TEXT    NOT NULL,
    plain_password  TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    username    TEXT    NOT NULL,
    full_name   TEXT    NOT NULL,
    action      TEXT    NOT NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    timestamp   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    date        TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    category    TEXT    NOT NULL,
    type        TEXT    NOT NULL,
    description TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

console.log('✅ SQLite database ready');

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── API Routes ────────────────────────────────────────────────────────────────

function logActivity(userId, username, fullName, action, req) {
  const numericId = parseInt(userId, 10);
  if (!numericId) return; // guard against invalid userId
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ua = req.headers['user-agent'] || 'unknown';
  const stmt = db.prepare(`
    INSERT INTO activity_log (user_id, username, full_name, action, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(numericId, username, fullName, action, ip, ua);
}

app.post('/api/signup', async (req, res) => {
  const { username, fullName, profession, password } = req.body;
  if (!username || !fullName || !profession || !password) return res.status(400).json({ success: false });

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ success: false, message: 'Exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = db.prepare(`
    INSERT INTO users (username, full_name, profession, password, plain_password)
    VALUES (?, ?, ?, ?, ?)
  `).run(username, fullName, profession, hashedPassword, password);

  logActivity(result.lastInsertRowid, username, fullName, 'SIGNUP', req);
  res.json({ success: true, user: { id: result.lastInsertRowid.toString(), username, fullName, profession } });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false });

  logActivity(user.id, user.username, user.full_name, 'LOGIN', req);
  res.json({ success: true, user: { id: user.id.toString(), username: user.username, fullName: user.full_name, profession: user.profession } });
});

app.post('/api/logout', (req, res) => {
  const { userId, username, fullName } = req.body;
  if (userId && username) {
    logActivity(userId, username, fullName || '', 'LOGOUT', req);
  }
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, username, full_name, profession, plain_password, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ success: true, users });
});

app.get('/api/activity', (req, res) => {
  const logs = db.prepare('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 200').all();
  res.json({ success: true, logs });
});

// ── Transaction API ──────────────────────────────────────────────────────────

app.get('/api/transactions/:userId', (req, res) => {
  const { userId } = req.params;
  const txs = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC').all(userId);
  // Normalize: map DB rows to match the Transaction interface (id as string, correct field names)
  const normalized = txs.map(t => ({
    id: t.id.toString(),
    date: t.date,
    amount: t.amount,
    category: t.category,
    type: t.type,
    description: t.description,
  }));
  res.json({ success: true, transactions: normalized });
});

app.post('/api/transactions', (req, res) => {
  const { userId, date, amount, category, type, description } = req.body;
  const result = db.prepare(`
    INSERT INTO transactions (user_id, date, amount, category, type, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, date, amount, category, type, description);
  res.json({ success: true, transaction: { id: result.lastInsertRowid.toString(), date, amount, category, type, description } });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  res.json({ success: true });
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { date, amount, category, type, description } = req.body;
  if (!date || amount === undefined || !category || !type || !description) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }
  db.prepare(`
    UPDATE transactions 
    SET date = ?, amount = ?, category = ?, type = ?, description = ?
    WHERE id = ?
  `).run(date, Number(amount), category, type, description, id);
  res.json({ success: true });
});

// ── Production Setup (Serving Frontend) ───────────────────────────────────────

// 1. Serve Admin Panel at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 2. Serve static files from the React dist folder
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// 3. Handle React routing (serve index.html for all other non-API routes)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 App deployed locally at http://localhost:${PORT}`);
  console.log(`📊 Admin Panel available at http://localhost:${PORT}/admin\n`);
});
