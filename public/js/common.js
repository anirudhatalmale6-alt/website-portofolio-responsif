/* Fungsi bersama: tema, ikon, ambil data, render header & footer. */

/* ------------------------------------------------------------------ ikon */
const ICONS = {
  instagram:
    '<path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.05 1.8.25 2.2.42.6.22 1 .48 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.2 1.8-.4 2.2a3.8 3.8 0 0 1-.9 1.4c-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.2-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c0-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.8.07-1.1.05-1.7.24-2.1.4-.5.2-.9.44-1.2.77-.3.3-.6.7-.8 1.2-.2.4-.3 1-.4 2.1C2.6 9.5 2.6 9.9 2.6 13s0 3.5.1 4.8c.05 1.1.24 1.7.4 2.1.2.5.44.9.77 1.2.3.3.7.6 1.2.8.4.2 1 .3 2.1.4 1.3.06 1.7.07 4.8.07s3.5 0 4.8-.07c1.1-.05 1.7-.24 2.1-.4.5-.2.9-.44 1.2-.77.3-.3.6-.7.8-1.2.2-.4.3-1 .4-2.1.06-1.3.07-1.7.07-4.8s0-3.5-.07-4.8c-.05-1.1-.24-1.7-.4-2.1a3 3 0 0 0-.77-1.2 3 3 0 0 0-1.2-.8c-.4-.2-1-.3-2.1-.4C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-.9a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Z"/>',
  linkedin:
    '<path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.3c0-1.27-.02-2.9-1.9-2.9-1.9 0-2.2 1.38-2.2 2.8V21h-4V9.5Z"/>',
  github:
    '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.85-2.35 4.7-4.58 4.94.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
  dribbble:
    '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.6 4.6a8.2 8.2 0 0 1 1.85 5.1c-.27-.06-3-.61-5.74-.27-.06-.14-.12-.29-.18-.44-.17-.4-.36-.8-.55-1.19 3.03-1.24 4.4-3.02 4.62-3.2ZM12 3.56c2.07 0 3.96.78 5.39 2.05-.19.26-1.43 1.92-4.35 3.02a42.8 42.8 0 0 0-3.07-4.79c.65-.16 1.33-.28 2.03-.28ZM8.24 4.43a50 50 0 0 1 3.04 4.73c-3.83 1.02-7.21 1-7.58 1a8.5 8.5 0 0 1 4.54-5.73ZM3.5 12.01v-.26c.35.01 4.32.06 8.41-1.17.24.46.46.93.66 1.4l-.32.1c-4.23 1.36-6.47 5.09-6.66 5.4A8.4 8.4 0 0 1 3.5 12ZM12 20.46a8.4 8.4 0 0 1-5.2-1.79c.15-.3 1.8-3.47 6.43-5.08l.05-.02c1.16 3 1.63 5.51 1.75 6.23-.94.4-1.97.66-3.03.66Zm4.55-1.48c-.08-.49-.52-2.9-1.6-5.85 2.58-.41 4.84.26 5.12.35a8.47 8.47 0 0 1-3.52 5.5Z"/>',
  x: '<path d="M18.24 2.25h3.31l-7.23 8.26L22.5 21.75h-6.6l-5.17-6.76-5.92 6.76H1.5l7.73-8.84L1.83 2.25h6.77l4.67 6.18 5.42-6.18Zm-1.16 17.52h1.83L7.03 4.13H5.06l12.02 15.64Z"/>',
  twitter: '<path d="M18.24 2.25h3.31l-7.23 8.26L22.5 21.75h-6.6l-5.17-6.76-5.92 6.76H1.5l7.73-8.84L1.83 2.25h6.77l4.67 6.18 5.42-6.18Zm-1.16 17.52h1.83L7.03 4.13H5.06l12.02 15.64Z"/>',
  facebook:
    '<path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.02H7.9v-2.92h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.92h-2.33V22C18.34 21.24 22 17.08 22 12.06Z"/>',
  whatsapp:
    '<path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35ZM12.05 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.76 9.76 0 0 1-1.5-5.23c0-5.4 4.4-9.79 9.82-9.79a9.74 9.74 0 0 1 6.93 2.88 9.68 9.68 0 0 1 2.87 6.92c0 5.4-4.41 9.82-9.81 9.82ZM20.4 3.6A11.66 11.66 0 0 0 12.05 0C5.56 0 .28 5.28.28 11.77c0 2.07.54 4.1 1.57 5.88L.18 24l6.5-1.7a11.7 11.7 0 0 0 5.37 1.32h.01c6.49 0 11.77-5.28 11.77-11.77 0-3.15-1.22-6.1-3.44-8.32Z"/>',
  link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.41l2.83-2.83a3 3 0 1 1 4.24 4.24l-1.41 1.42a1 1 0 0 1-1.42-1.42l1.42-1.41a1 1 0 0 0-1.42-1.42l-2.82 2.83a1 1 0 0 1-1.42 0Zm2.8-2.8a1 1 0 0 1 0 1.4l-2.83 2.83a1 1 0 0 0 1.42 1.42l1.41-1.42a1 1 0 1 1 1.42 1.42l-1.42 1.41a3 3 0 0 1-4.24-4.24l2.83-2.83a1 1 0 0 1 1.41 0Z"/><path d="M8.17 18.66a3 3 0 0 1-4.24-4.24l2.83-2.83a1 1 0 0 1 1.41 1.41l-2.82 2.83a1 1 0 0 0 1.41 1.41l1.42-1.41A1 1 0 0 1 9.6 17.24l-1.42 1.42Z"/>',
  sun: '<path d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-1-13h2v3h-2V2Zm0 17h2v3h-2v-3ZM2 11h3v2H2v-2Zm17 0h3v2h-3v-2ZM4.22 5.64l1.42-1.42 2.12 2.12-1.41 1.42-2.13-2.12Zm11.02 11.02 1.41-1.41 2.12 2.12-1.41 1.41-2.12-2.12Zm2.12-12.44 1.41 1.42-2.12 2.12-1.41-1.42 2.12-2.12ZM5.64 19.78l-1.42-1.41 2.13-2.12 1.41 1.41-2.12 2.12Z"/>',
  moon: '<path d="M12.1 22a10 10 0 0 1-1.02-19.95c.83-.08 1.3.94.71 1.53a6.5 6.5 0 0 0 8.63 9.7c.72-.42 1.55.28 1.25 1.06A10 10 0 0 1 12.1 22Z"/>',
  arrow: '<path d="M13.17 5.17 11.76 6.6l4.4 4.4H3v2h13.17l-4.41 4.4 1.41 1.42L20 12l-6.83-6.83Z"/>',
  arrowLeft: '<path d="M10.83 5.17 12.24 6.6l-4.4 4.4H21v2H7.83l4.41 4.4-1.41 1.42L4 12l6.83-6.83Z"/>',
  menu: '<path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z"/>',
  close: '<path d="m12 10.59 5.3-5.3 1.41 1.42-5.3 5.3 5.3 5.29-1.41 1.41-5.3-5.29-5.29 5.29-1.41-1.41 5.29-5.3-5.29-5.29L6.71 5.3 12 10.59Z"/>',
  check: '<path d="M9.55 17.2 4.4 12.05l1.42-1.42 3.73 3.73 8.63-8.63 1.42 1.42L9.55 17.2Z"/>',
};

const icon = (name, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

/* ------------------------------------------------------------------ tema */
const Theme = {
  key: 'portfolio-theme',
  get() {
    return localStorage.getItem(this.key) || document.documentElement.dataset.theme || 'dark';
  },
  set(mode) {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem(this.key, mode);
    const btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.innerHTML = icon(mode === 'dark' ? 'sun' : 'moon');
      btn.setAttribute('aria-label', mode === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
    }
  },
  toggle() {
    this.set(this.get() === 'dark' ? 'light' : 'dark');
  },
};

/* ------------------------------------------------------------- pengambilan */
async function api(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  let data = {};
  try {
    data = await res.json();
  } catch (_) {
    /* respons bukan JSON */
  }
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status, data });
  return data;
}

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (_) {
    return iso;
  }
}

/* Menerapkan warna aksen & rasio sampul dari content/site.json.
   Dipakai halaman biasa lewat renderChrome(), dan oleh panel admin langsung. */
function applyBrand(site) {
  const accent = site?.theme?.accent;
  if (accent) document.documentElement.style.setProperty('--accent', accent);
  const ratio = site?.theme?.cover_ratio;
  if (ratio) document.documentElement.style.setProperty('--cover-ratio', ratio);
}

/* --------------------------------------------------------- header & footer */
function renderChrome(site, active) {
  applyBrand(site);

  const name = site?.name || 'Portofolio';
  document.title = site?.seo?.title || `${name} — Portofolio`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && site?.seo?.description) metaDesc.setAttribute('content', site.seo.description);

  const links = [
    { href: '/#karya', label: 'Karya', id: 'karya' },
    { href: '/#tentang', label: 'Tentang', id: 'tentang' },
    { href: '/#langganan', label: 'Langganan', id: 'langganan' },
    { href: '/#kontak', label: 'Kontak', id: 'kontak' },
  ];

  const header = document.querySelector('[data-chrome="header"]');
  if (header) {
    header.innerHTML = `
      <div class="wrap site-header__inner">
        <a class="brand" href="/"><span class="brand__dot"></span>${esc(name)}</a>
        <div style="display:flex;align-items:center;gap:10px">
          <nav class="nav" id="nav" aria-label="Navigasi utama">
            ${links
              .map((l) => `<a href="${l.href}" class="${active === l.id ? 'is-active' : ''}">${l.label}</a>`)
              .join('')}
          </nav>
          <button class="icon-btn" data-theme-toggle type="button" aria-label="Ganti tema"></button>
          <button class="icon-btn nav-toggle" type="button" aria-label="Buka menu" aria-expanded="false" aria-controls="nav">${icon('menu')}</button>
        </div>
      </div>`;

    header.querySelector('[data-theme-toggle]').addEventListener('click', () => Theme.toggle());

    const toggle = header.querySelector('.nav-toggle');
    const nav = header.querySelector('#nav');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = icon(open ? 'close' : 'menu');
    });
    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = icon('menu');
      }
    });
  }

  const footer = document.querySelector('[data-chrome="footer"]');
  if (footer) {
    const socials = (site?.socials || [])
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener me">${esc(s.label)}</a>`)
      .join(' · ');
    footer.innerHTML = `
      <div class="wrap site-footer__inner">
        <span>© ${new Date().getFullYear()} ${esc(name)}. Dibuat dengan HTML, CSS, dan JavaScript.</span>
        <span>${socials}</span>
      </div>`;
  }

  Theme.set(localStorage.getItem(Theme.key) || site?.theme?.default_mode || 'dark');
}

/* ------------------------------------------------- animasi muncul (reveal) */
function observeReveals(root = document) {
  const items = root.querySelectorAll('.reveal:not(.is-in)');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  );
  items.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------- pesan pada form */
function showMsg(el, text, kind) {
  if (!el) return;
  el.textContent = text;
  el.className = `msg msg--${kind === 'err' ? 'err' : 'ok'}`;
  el.hidden = false;
}
function hideMsg(el) {
  if (el) el.hidden = true;
}
