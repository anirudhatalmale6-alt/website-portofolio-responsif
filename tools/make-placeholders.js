/**
 * Membuat gambar placeholder SVG untuk konten contoh.
 * Jalankan: node tools/make-placeholders.js
 * Hapus/timpa file di public/img/projects/ dengan foto karya asli Anda.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'public', 'img', 'projects');
fs.mkdirSync(OUT, { recursive: true });

const sets = [
  { name: 'asa', label: 'Kedai Kopi Asa', c1: '#3B2216', c2: '#C4763B', files: ['cover', '1', '2'] },
  { name: 'nusa', label: 'Nusa Travel App', c1: '#0E2A2B', c2: '#3FB6A8', files: ['cover', '1', '2'] },
  { name: 'sunyi', label: 'Ruang Sunyi', c1: '#1B1A24', c2: '#7C6BD1', files: ['cover', '1'] },
  { name: 'hijau', label: 'Toko Hijau', c1: '#14240F', c2: '#7FB544', files: ['cover', '1'] },
  { name: 'layar', label: 'Festival Layar', c1: '#2A1016', c2: '#E2555A', files: ['cover'] },
  { name: 'resep', label: 'Buku Resep Ibu', c1: '#2B2113', c2: '#D9A441', files: ['cover'] },
];

function shapes(seed, w, h) {
  // pola geometris sederhana, deterministik dari seed
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  let out = '';
  for (let i = 0; i < 7; i++) {
    const cx = rnd() * w, cy = rnd() * h, r = 40 + rnd() * (Math.min(w, h) / 2.2);
    const op = (0.05 + rnd() * 0.12).toFixed(3);
    out += rnd() > 0.5
      ? `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="#fff" opacity="${op}"/>`
      : `<rect x="${cx.toFixed(0)}" y="${cy.toFixed(0)}" width="${r.toFixed(0)}" height="${r.toFixed(0)}" fill="#fff" opacity="${op}" transform="rotate(${(rnd() * 60 - 30).toFixed(1)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`;
  }
  return out;
}

let n = 0;
for (const set of sets) {
  set.files.forEach((suffix, idx) => {
    const w = 1200, h = suffix === 'cover' ? 900 : 800;
    const seed = ++n * 7919;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${set.label}">
  <defs>
    <linearGradient id="g${n}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${set.c1}"/>
      <stop offset="1" stop-color="${set.c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g${n})"/>
  ${shapes(seed, w, h)}
  <text x="56" y="${h - 62}" font-family="Georgia, serif" font-size="46" fill="#ffffff" opacity="0.92">${set.label}</text>
  <text x="56" y="${h - 28}" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#ffffff" opacity="0.6" letter-spacing="2">GAMBAR CONTOH ${String(idx + 1).padStart(2, '0')}</text>
</svg>`;
    fs.writeFileSync(path.join(OUT, `${set.name}-${suffix}.svg`), svg);
  });
}

// avatar / foto profil placeholder
fs.writeFileSync(path.join(OUT, '..', 'portrait.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 720" width="600" height="720">
  <defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A2A31"/><stop offset="1" stop-color="#55555F"/></linearGradient></defs>
  <rect width="600" height="720" fill="url(#p)"/>
  <circle cx="300" cy="280" r="110" fill="#fff" opacity="0.18"/>
  <path d="M110 720c0-105 85-190 190-190s190 85 190 190z" fill="#fff" opacity="0.18"/>
  <text x="300" y="690" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="18" fill="#fff" opacity="0.55" letter-spacing="2">FOTO PROFIL</text>
</svg>`);

console.log(`Selesai. ${n + 1} file placeholder dibuat di public/img/`);
