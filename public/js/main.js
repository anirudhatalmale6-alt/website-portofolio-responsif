/* Halaman beranda: hero, grid karya + filter, tentang, langganan, sosial & feed. */

let SITE = {};
let PROJECTS = [];
let activeFilter = 'Semua';

document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    const [siteRes, projRes] = await Promise.all([api('/api/site'), api('/api/projects')]);
    SITE = siteRes.site || {};
    PROJECTS = projRes.projects || [];
  } catch (err) {
    console.error('Gagal memuat data situs:', err);
  }

  renderChrome(SITE, 'karya');
  renderHero();
  renderFilters();
  renderWork();
  renderAbout();
  renderContact();
  renderFeed();
  bindSubscribe();
  observeReveals();
}

/* ------------------------------------------------------------------ hero */
function renderHero() {
  const name = SITE.name || 'Portofolio';
  const role = SITE.role || '';
  document.querySelector('[data-hero="title"]').innerHTML =
    `${esc(name)}<br><em>${esc(role)}</em>`;
  document.querySelector('[data-hero="lead"]').textContent = SITE.tagline || '';

  const words = [
    ...new Set([
      ...(SITE.services || []).map((s) => s.title),
      ...PROJECTS.map((p) => p.category).filter(Boolean),
      SITE.location,
    ].filter(Boolean)),
  ];
  const track = document.querySelector('[data-hero="marquee"]');
  const line = words.map((w) => `<span>${esc(w)}</span><span>✳</span>`).join('');
  track.innerHTML = line + line; // digandakan agar animasi geser terlihat mulus
}

/* ----------------------------------------------------------------- karya */
function categories() {
  return ['Semua', ...new Set(PROJECTS.map((p) => p.category).filter(Boolean))];
}

function renderFilters() {
  const box = document.getElementById('filters');
  box.innerHTML = categories()
    .map(
      (c) =>
        `<button type="button" data-cat="${esc(c)}" class="${c === activeFilter ? 'is-active' : ''}" aria-pressed="${c === activeFilter}">${esc(c)}</button>`
    )
    .join('');
  box.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      activeFilter = b.dataset.cat;
      renderFilters();
      renderWork();
    })
  );
}

function cardHtml(p, index) {
  // proyek unggulan pertama tampil lebar, sisanya setengah/sepertiga kolom
  const spanClass = index === 0 ? 'is-wide' : '';
  const num = String(index + 1).padStart(2, '0');
  const comments =
    p.comment_count > 0 ? `<em>${p.comment_count}</em> komentar` : 'Belum ada komentar';
  return `
    <a class="card reveal ${spanClass}" href="/karya/${encodeURIComponent(p.slug)}">
      <div class="card__media">
        ${p.category ? `<span class="card__badge">${esc(p.category)}</span>` : ''}
        <img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" width="1200" height="900">
      </div>
      <div class="card__body">
        <h3 class="card__title"><span>${esc(p.title)}</span><span>${num}</span></h3>
        <p class="card__summary">${esc(p.summary)}</p>
        <div class="card__meta"><span>${esc(p.year || '')}</span><span>${comments}</span></div>
      </div>
    </a>`;
}

function renderWork() {
  const grid = document.getElementById('work-grid');
  const list = PROJECTS.filter((p) => activeFilter === 'Semua' || p.category === activeFilter);

  if (!list.length) {
    grid.innerHTML = `<p class="empty">Belum ada karya pada kategori ini.</p>`;
    return;
  }
  grid.innerHTML = list.map(cardHtml).join('');
  observeReveals(grid);
}

/* --------------------------------------------------------------- tentang */
function renderAbout() {
  const box = document.querySelector('[data-about]');
  const paras = (SITE.about || []).map((t) => `<p>${esc(t)}</p>`).join('');
  const services = (SITE.services || [])
    .map(
      (s, i) => `<li>
        <i>${String(i + 1).padStart(2, '0')}</i>
        <div><b>${esc(s.title)}</b><span>${esc(s.desc)}</span></div>
      </li>`
    )
    .join('');
  box.innerHTML = `${paras}${services ? `<ul class="services">${services}</ul>` : ''}`;
}

/* ---------------------------------------------------------------- kontak */
function renderContact() {
  const mail = document.querySelector('[data-contact="email"]');
  if (SITE.email_public) {
    mail.href = `mailto:${SITE.email_public}`;
    mail.textContent = SITE.email_public;
  } else {
    mail.remove();
  }

  const ul = document.querySelector('[data-contact="socials"]');
  ul.innerHTML = (SITE.socials || [])
    .map(
      (s) =>
        `<li><a href="${esc(s.url)}" target="_blank" rel="noopener me">${icon(s.icon || 'link', 17)}${esc(s.label)}</a></li>`
    )
    .join('');
}

/* ------------------------------------------------------------------ feed */
function renderFeed() {
  const feed = SITE.feed || {};
  const card = document.querySelector('[data-feed]');
  if (!feed.enabled) return;

  card.hidden = false;
  card.querySelector('[data-feed="title"]').textContent = feed.title || 'Media sosial';
  const link = card.querySelector('[data-feed="link"]');
  link.href = feed.url || '#';

  const grid = card.querySelector('[data-feed="grid"]');

  // Jika Anda menempelkan kode embed resmi (Instagram/Behance/dll) di site.json,
  // kode itu yang dipakai. Kalau kosong, tampilkan pratinjau dari cover proyek.
  if (feed.embed_html) {
    grid.outerHTML = feed.embed_html;
  } else {
    const items = PROJECTS.slice(0, 6);
    grid.innerHTML = items
      .map(
        (p) =>
          `<a href="/karya/${encodeURIComponent(p.slug)}" aria-label="${esc(p.title)}"><img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy"></a>`
      )
      .join('');
  }
  card.querySelector('[data-feed="foot"]').textContent = feed.handle
    ? `${feed.handle} — pratinjau otomatis dari karya terbaru.`
    : '';
}

/* -------------------------------------------------------------- langganan */
function bindSubscribe() {
  const form = document.getElementById('subscribe-form');
  const msg = document.getElementById('subscribe-msg');
  const btn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg(msg);
    const email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
      showMsg(msg, 'Masukkan alamat e-mail yang valid.', 'err');
      return;
    }
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Mengirim…';
    try {
      const res = await api('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, website: form.website.value, source: 'beranda' }),
      });
      showMsg(msg, res.message, res.duplicate ? 'err' : 'ok');
      if (!res.duplicate) form.reset();
    } catch (err) {
      showMsg(msg, err.message || 'Gagal mengirim. Coba lagi.', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}
