'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'portfolio.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project     TEXT NOT NULL,
  name        TEXT NOT NULL,
  email       TEXT,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | spam
  ip          TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project, status);

CREATE TABLE IF NOT EXISTS subscribers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  source      TEXT,
  confirmed   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL
);
`);

const now = () => new Date().toISOString();

module.exports = {
  db,

  /* ---------- komentar ---------- */
  addComment({ project, name, email, body, ip, status }) {
    const info = db
      .prepare(
        `INSERT INTO comments (project, name, email, body, status, ip, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(project, name, email || null, body, status || 'pending', ip || null, now());
    return info.lastInsertRowid;
  },

  approvedComments(project) {
    return db
      .prepare(
        `SELECT id, name, body, created_at FROM comments
         WHERE project = ? AND status = 'approved'
         ORDER BY datetime(created_at) ASC`
      )
      .all(project);
  },

  approvedCountByProject() {
    const rows = db
      .prepare(`SELECT project, COUNT(*) AS n FROM comments WHERE status = 'approved' GROUP BY project`)
      .all();
    return Object.fromEntries(rows.map((r) => [r.project, r.n]));
  },

  allComments(status) {
    if (status && status !== 'all') {
      return db
        .prepare(`SELECT * FROM comments WHERE status = ? ORDER BY datetime(created_at) DESC`)
        .all(status);
    }
    return db.prepare(`SELECT * FROM comments ORDER BY datetime(created_at) DESC`).all();
  },

  commentCounts() {
    const rows = db.prepare(`SELECT status, COUNT(*) AS n FROM comments GROUP BY status`).all();
    const out = { pending: 0, approved: 0, spam: 0 };
    rows.forEach((r) => (out[r.status] = r.n));
    return out;
  },

  setCommentStatus(id, status) {
    return db.prepare(`UPDATE comments SET status = ? WHERE id = ?`).run(status, id).changes;
  },

  deleteComment(id) {
    return db.prepare(`DELETE FROM comments WHERE id = ?`).run(id).changes;
  },

  recentCommentsFromIp(ip, seconds) {
    const row = db
      .prepare(
        `SELECT COUNT(*) AS n FROM comments
         WHERE ip = ? AND datetime(created_at) > datetime('now', ?)`
      )
      .get(ip, `-${seconds} seconds`);
    return row.n;
  },

  /* ---------- langganan ---------- */
  addSubscriber({ email, name, source }) {
    try {
      db.prepare(
        `INSERT INTO subscribers (email, name, source, created_at) VALUES (?, ?, ?, ?)`
      ).run(email.toLowerCase(), name || null, source || 'website', now());
      return { created: true };
    } catch (err) {
      if (String(err.message).includes('UNIQUE')) return { created: false, duplicate: true };
      throw err;
    }
  },

  allSubscribers() {
    return db.prepare(`SELECT * FROM subscribers ORDER BY datetime(created_at) DESC`).all();
  },

  subscriberCount() {
    return db.prepare(`SELECT COUNT(*) AS n FROM subscribers`).get().n;
  },

  deleteSubscriber(id) {
    return db.prepare(`DELETE FROM subscribers WHERE id = ?`).run(id).changes;
  },
};
