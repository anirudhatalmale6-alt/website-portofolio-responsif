/* Halaman detail karya: isi proyek, tombol bagikan, dan komentar. */

const SLUG = decodeURIComponent(location.pathname.replace(/^\/karya\//, '').replace(/\/$/, ''));
let SITE = {};
let PROJECT = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const siteRes = await api('/api/site');
    SITE = siteRes.site || {};
  } catch (_) {}
  renderChrome(SITE, 'karya');

  try {
    const res = await api(`/api/projects/${encodeURIComponent(SLUG)}`);
    PROJECT = res.project;
    renderProject(res);
  } catch (err) {
    document.getElementById('main').innerHTML = `
      <div class="wrap section" style="text-align:center">
        <h1 style="font-size:var(--step-3);margin-bottom:14px">Karya tidak ditemukan</h1>
        <p style="color:var(--muted)">Tautannya mungkin sudah berubah.</p>
        <p style="margin-top:22px"><a class="btn" href="/#karya">Kembali ke daftar karya</a></p>
      </div>`;
    return;
  }

  renderShare();
  bindCommentForm();
  await loadComments();
  observeReveals();
}

/* --------------------------------------------------------------- konten */
function renderProject({ project: p, prev, next }) {
  document.title = `${p.title} — ${SITE.name || 'Portofolio'}`;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', p.summary || '');

  document.querySelector('[data-p="category"]').textContent = [p.category, p.year].filter(Boolean).join(' · ');
  document.querySelector('[data-p="title"]').textContent = p.title;
  document.querySelector('[data-p="summary"]').textContent = p.summary || '';

  const cover = document.querySelector('[data-p="cover"]');
  if (p.cover) {
    cover.src = p.cover;
    cover.alt = p.title;
  } else {
    cover.closest('.cover').remove();
  }

  const meta = [
    ['Klien', p.client],
    ['Tahun', p.year],
    ['Peran', p.role],
    ['Kategori', p.category],
  ].filter(([, v]) => v);
  if (p.link) meta.push(['Tautan', `<a href="${esc(p.link)}" target="_blank" rel="noopener" style="color:var(--accent)">Buka situs ↗</a>`]);

  document.querySelector('[data-p="meta"]').innerHTML = meta
    .map(([k, v]) => `<li><div class="k">${esc(k)}</div><div class="v">${k === 'Tautan' ? v : esc(v)}</div></li>`)
    .join('');

  document.querySelector('[data-p="body"]').innerHTML = (p.body || []).map((t) => `<p>${esc(t)}</p>`).join('');

  document.querySelector('[data-p="tags"]').innerHTML = (p.tags || [])
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join('');

  document.querySelector('[data-p="gallery"]').innerHTML = (p.gallery || [])
    .map((src) => `<img class="reveal" src="${esc(src)}" alt="${esc(p.title)}" loading="lazy">`)
    .join('');

  const pager = document.querySelector('[data-pager]');
  pager.innerHTML = `
    ${
      prev
        ? `<a href="/karya/${encodeURIComponent(prev.slug)}"><small>← Sebelumnya</small><b>${esc(prev.title)}</b></a>`
        : '<span class="placeholder"></span>'
    }
    ${
      next
        ? `<a class="right" href="/karya/${encodeURIComponent(next.slug)}"><small>Berikutnya →</small><b>${esc(next.title)}</b></a>`
        : '<span class="placeholder"></span>'
    }`;
}

/* -------------------------------------------------------------- bagikan */
function renderShare() {
  const url = location.href;
  const text = `${PROJECT.title} — ${SITE.name || ''}`.trim();
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);

  const targets = [
    { label: 'WhatsApp', icon: 'whatsapp', href: `https://wa.me/?text=${t}%20${u}` },
    { label: 'X', icon: 'x', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { label: 'Facebook', icon: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: 'LinkedIn', icon: 'linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  ];

  const box = document.querySelector('[data-share]');
  box.insertAdjacentHTML(
    'beforeend',
    targets
      .map(
        (s) =>
          `<a href="${s.href}" target="_blank" rel="noopener" aria-label="Bagikan ke ${s.label}">${icon(s.icon, 15)}${s.label}</a>`
      )
      .join('') + `<button type="button" data-copy>${icon('link', 15)}Salin tautan</button>`
  );

  const copyBtn = box.querySelector('[data-copy]');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch (_) {
      const tmp = document.createElement('input');
      tmp.value = url;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      tmp.remove();
    }
    copyBtn.innerHTML = `${icon('check', 15)}Tersalin`;
    setTimeout(() => (copyBtn.innerHTML = `${icon('link', 15)}Salin tautan`), 2000);
  });

  // Tombol bagikan bawaan perangkat (mobile)
  if (navigator.share) {
    box.insertAdjacentHTML('beforeend', `<button type="button" data-native>${icon('arrow', 15)}Bagikan…</button>`);
    box.querySelector('[data-native]').addEventListener('click', () =>
      navigator.share({ title: PROJECT.title, text, url }).catch(() => {})
    );
  }
}

/* -------------------------------------------------------------- komentar */
async function loadComments() {
  const list = document.querySelector('[data-c="list"]');
  const count = document.querySelector('[data-c="count"]');
  try {
    const res = await api(`/api/comments/${encodeURIComponent(SLUG)}`);
    const items = res.comments || [];
    count.textContent = items.length ? `(${items.length})` : '';
    list.innerHTML = items.length
      ? items.map(commentHtml).join('')
      : `<li class="empty" style="padding:26px 0;text-align:left">Belum ada komentar. Jadilah yang pertama.</li>`;
  } catch (err) {
    list.innerHTML = `<li class="empty" style="text-align:left">Gagal memuat komentar.</li>`;
  }
}

function commentHtml(c) {
  const initial = (c.name || '?').trim().charAt(0).toUpperCase();
  return `
    <li class="comment">
      <div class="comment__head">
        <span class="comment__avatar" aria-hidden="true">${esc(initial)}</span>
        <div>
          <div class="comment__name">${esc(c.name)}</div>
          <div class="comment__time">${esc(formatDate(c.created_at))}</div>
        </div>
      </div>
      <p>${esc(c.body)}</p>
    </li>`;
}

function bindCommentForm() {
  const form = document.getElementById('comment-form');
  const msg = document.getElementById('comment-msg');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg(msg);

    const name = form.name.value.trim();
    const body = form.body.value.trim();
    if (name.length < 2) return showMsg(msg, 'Nama minimal 2 karakter.', 'err');
    if (body.length < 3) return showMsg(msg, 'Komentar terlalu pendek.', 'err');

    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Mengirim…';
    try {
      const res = await api(`/api/comments/${encodeURIComponent(SLUG)}`, {
        method: 'POST',
        body: JSON.stringify({ name, email: form.email.value.trim(), body, website: form.website.value }),
      });
      showMsg(msg, res.message, 'ok');
      form.reset();
      if (res.status === 'approved') loadComments();
    } catch (err) {
      showMsg(msg, err.message || 'Gagal mengirim komentar.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}
