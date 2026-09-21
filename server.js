'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const compression = require('compression');

const db = require('./src/db');
const content = require('./src/content');

const app = express();
const PORT = Number(process.env.PORT || 4321);
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'ubahsaya';
const AUTO_APPROVE = process.env.AUTO_APPROVE_COMMENTS === '1';

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(compression()); // gzip: HTML+CSS+JS beranda turun dari ~44 KB menjadi ~13 KB
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

/* ------------------------------------------------------------------ utils */

const clientIp = (req) => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

// sesi admin sederhana, disimpan di memori (hilang saat server restart)
const sessions = new Map(); // token -> expiry (ms)
const SESSION_TTL = 1000 * 60 * 60 * 8;

function newSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL);
  return token;
}

function requireAdmin(req, res, next) {
  const token = parseCookies(req).admin_session;
  const exp = token && sessions.get(token);
  if (!exp || exp < Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ ok: false, error: 'Belum login.' });
  }
  next();
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/* ------------------------------------------------------- API: konten situs */

app.get('/api/site', (req, res) => {
  res.json({ ok: true, site: content.site() });
});

app.get('/api/projects', (req, res) => {
  const counts = db.approvedCountByProject();
  const list = content.projects().map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category || '',
    year: p.year || '',
    cover: p.cover || '',
    summary: p.summary || '',
    tags: p.tags || [],
    featured: !!p.featured,
    comment_count: counts[p.slug] || 0,
  }));
  res.json({ ok: true, projects: list });
});

app.get('/api/projects/:slug', (req, res) => {
  const p = content.project(req.params.slug);
  if (!p) return res.status(404).json({ ok: false, error: 'Proyek tidak ditemukan.' });
  const all = content.projects();
  const i = all.findIndex((x) => x.slug === p.slug);
  const pick = (x) => (x ? { slug: x.slug, title: x.title, cover: x.cover || '' } : null);
  res.json({
    ok: true,
    project: p,
    prev: pick(all[i - 1]),
    next: pick(all[i + 1]),
  });
});

/* ----------------------------------------------------------- API: komentar */

app.get('/api/comments/:slug', (req, res) => {
  if (!content.project(req.params.slug)) {
    return res.status(404).json({ ok: false, error: 'Proyek tidak ditemukan.' });
  }
  res.json({ ok: true, comments: db.approvedComments(req.params.slug) });
});

app.post('/api/comments/:slug', (req, res) => {
  const slug = req.params.slug;
  if (!content.project(slug)) {
    return res.status(404).json({ ok: false, error: 'Proyek tidak ditemukan.' });
  }

  const { name = '', email = '', body = '', website = '' } = req.body || {};

  // honeypot: kolom tersembunyi yang hanya diisi bot
  if (String(website).trim() !== '') {
    return res.json({ ok: true, status: 'pending', message: 'Komentar diterima.' });
  }

  const cleanName = String(name).trim().slice(0, 60);
  const cleanBody = String(body).trim().slice(0, 2000);
  const cleanEmail = String(email).trim().slice(0, 160);

  if (cleanName.length < 2) return res.status(400).json({ ok: false, error: 'Nama minimal 2 karakter.' });
  if (cleanBody.length < 3) return res.status(400).json({ ok: false, error: 'Komentar terlalu pendek.' });
  if (cleanEmail && !EMAIL_RE.test(cleanEmail)) {
    return res.status(400).json({ ok: false, error: 'Format e-mail tidak valid.' });
  }

  const ip = clientIp(req);
  if (ip && db.recentCommentsFromIp(ip, 60) >= 3) {
    return res.status(429).json({ ok: false, error: 'Terlalu banyak komentar. Coba lagi sebentar lagi.' });
  }

  const status = AUTO_APPROVE ? 'approved' : 'pending';
  db.addComment({ project: slug, name: cleanName, email: cleanEmail, body: cleanBody, ip, status });

  res.json({
    ok: true,
    status,
    message: status === 'approved' ? 'Komentar tayang.' : 'Terima kasih! Komentar menunggu persetujuan pemilik situs.',
  });
});

/* --------------------------------------------------------- API: langganan */

const subHits = new Map(); // ip -> [timestamps]

app.post('/api/subscribe', (req, res) => {
  const { email = '', name = '', website = '' } = req.body || {};
  if (String(website).trim() !== '') return res.json({ ok: true, message: 'Terima kasih!' });

  const cleanEmail = String(email).trim().slice(0, 160);
  if (!EMAIL_RE.test(cleanEmail)) {
    return res.status(400).json({ ok: false, error: 'Masukkan alamat e-mail yang valid.' });
  }

  const ip = clientIp(req);
  const now = Date.now();
  const hits = (subHits.get(ip) || []).filter((t) => now - t < 60000);
  if (hits.length >= 5) {
    return res.status(429).json({ ok: false, error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
  }
  hits.push(now);
  subHits.set(ip, hits);

  const result = db.addSubscriber({
    email: cleanEmail,
    name: String(name).trim().slice(0, 60),
    source: String(req.body.source || 'website').slice(0, 40),
  });

  res.json({
    ok: true,
    duplicate: !!result.duplicate,
    message: result.duplicate ? 'E-mail ini sudah terdaftar.' : 'Terima kasih! E-mail Anda sudah terdaftar.',
  });
});

/* -------------------------------------------------------------- API: admin */

const loginHits = new Map();

app.post('/api/admin/login', (req, res) => {
  const ip = clientIp(req);
  const now = Date.now();
  const hits = (loginHits.get(ip) || []).filter((t) => now - t < 300000);
  if (hits.length >= 8) {
    return res.status(429).json({ ok: false, error: 'Terlalu banyak percobaan login. Tunggu 5 menit.' });
  }
  hits.push(now);
  loginHits.set(ip, hits);

  const { username = '', password = '' } = req.body || {};
  if (!safeEqual(username, ADMIN_USER) || !safeEqual(password, ADMIN_PASS)) {
    return res.status(401).json({ ok: false, error: 'Username atau password salah.' });
  }
  loginHits.delete(ip);

  const token = newSession();
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: SESSION_TTL,
  });
  res.json({ ok: true });
});

app.post('/api/admin/logout', (req, res) => {
  const token = parseCookies(req).admin_session;
  if (token) sessions.delete(token);
  res.clearCookie('admin_session');
  res.json({ ok: true });
});

app.get('/api/admin/me', requireAdmin, (req, res) => res.json({ ok: true, user: ADMIN_USER }));

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  res.json({
    ok: true,
    comments: db.commentCounts(),
    subscribers: db.subscriberCount(),
    projects: content.projects().length,
    auto_approve: AUTO_APPROVE,
  });
});

app.get('/api/admin/comments', requireAdmin, (req, res) => {
  res.json({ ok: true, comments: db.allComments(req.query.status || 'pending') });
});

app.post('/api/admin/comments/:id/:action', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const map = { approve: 'approved', reject: 'spam', unapprove: 'pending' };
  const action = req.params.action;

  if (action === 'delete') {
    return res.json({ ok: true, changed: db.deleteComment(id) });
  }
  if (!map[action]) return res.status(400).json({ ok: false, error: 'Aksi tidak dikenal.' });
  res.json({ ok: true, changed: db.setCommentStatus(id, map[action]) });
});

app.get('/api/admin/subscribers', requireAdmin, (req, res) => {
  res.json({ ok: true, subscribers: db.allSubscribers() });
});

app.delete('/api/admin/subscribers/:id', requireAdmin, (req, res) => {
  res.json({ ok: true, changed: db.deleteSubscriber(Number(req.params.id)) });
});

app.get('/api/admin/subscribers.csv', requireAdmin, (req, res) => {
  const rows = db.allSubscribers();
  const esc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const csv = [
    'email,nama,sumber,tanggal',
    ...rows.map((r) => [r.email, r.name, r.source, r.created_at].map(esc).join(',')),
  ].join('\r\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="langganan-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('﻿' + csv); // BOM agar Excel membaca UTF-8 dengan benar
});

/* ------------------------------------------------------------ file statis */

app.use(
  express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
    setHeaders(res, filePath) {
      if (/\.(svg|png|jpg|jpeg|webp|woff2)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=604800');
      }
    },
  })
);

// halaman detail proyek: /karya/<slug>
app.get('/karya/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'project.html'));
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ ok: false, error: 'Endpoint tidak ditemukan.' });
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Portofolio berjalan di http://localhost:${PORT}`);
  console.log(`Panel admin: http://localhost:${PORT}/admin  (user: ${ADMIN_USER})`);
  if (ADMIN_PASS === 'ubahsaya') console.warn('PERINGATAN: password admin masih bawaan. Set ADMIN_PASS di file .env sebelum online.');
});
