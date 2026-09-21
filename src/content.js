'use strict';

/**
 * Membaca konten dari folder content/.
 * File dibaca ulang otomatis saat berubah, jadi menambah proyek tidak perlu restart server.
 */
const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const cache = new Map(); // file -> { mtimeMs, data }

function read(file, fallback) {
  const full = path.join(CONTENT_DIR, file);
  try {
    const stat = fs.statSync(full);
    const hit = cache.get(file);
    if (hit && hit.mtimeMs === stat.mtimeMs) return hit.data;
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    cache.set(file, { mtimeMs: stat.mtimeMs, data });
    return data;
  } catch (err) {
    console.error(`[content] gagal membaca ${file}: ${err.message}`);
    return fallback;
  }
}

function site() {
  return read('site.json', {});
}

function projects() {
  const list = read('projects.json', []);
  return Array.isArray(list) ? list.filter((p) => p && p.slug && p.draft !== true) : [];
}

function project(slug) {
  return projects().find((p) => p.slug === slug) || null;
}

module.exports = { site, projects, project, CONTENT_DIR };
