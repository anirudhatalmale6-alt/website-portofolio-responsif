/* Panel admin: moderasi komentar + daftar langganan. */

let TAB = 'pending';

document.addEventListener('DOMContentLoaded', async () => {
  Theme.set(localStorage.getItem(Theme.key) || 'dark');
  bindLogin();

  try {
    await api('/api/admin/me');
    openDash();
  } catch (_) {
    document.getElementById('login').hidden = false;
  }
});

function bindLogin() {
  const form = document.getElementById('login-form');
  const msg = document.getElementById('login-msg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg(msg);
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username: form.username.value, password: form.password.value }),
      });
      document.getElementById('login').hidden = true;
      openDash();
    } catch (err) {
      showMsg(msg, err.message || 'Gagal masuk.', 'err');
    }
  });
}

async function openDash() {
  document.getElementById('dash').hidden = false;

  document.getElementById('logout').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' });
    location.reload();
  });

  document.querySelectorAll('#tabs button').forEach((b) =>
    b.addEventListener('click', () => {
      TAB = b.dataset.tab;
      document.querySelectorAll('#tabs button').forEach((x) => x.classList.toggle('is-active', x === b));
      document.querySelectorAll('#tabs button').forEach((x) => {
        x.style.background = x === b ? 'var(--accent)' : 'transparent';
        x.style.color = x === b ? 'var(--accent-ink)' : 'var(--text)';
        x.style.borderColor = x === b ? 'var(--accent)' : 'var(--line)';
      });
      render();
    })
  );
  document.querySelector('#tabs button').click();

  await refreshStats();
}

async function refreshStats() {
  try {
    const s = await api('/api/admin/stats');
    document.getElementById('stats').innerHTML = `
      <div class="stat"><b>${s.comments.pending}</b><span>Menunggu</span></div>
      <div class="stat"><b>${s.comments.approved}</b><span>Disetujui</span></div>
      <div class="stat"><b>${s.comments.spam}</b><span>Spam</span></div>
      <div class="stat"><b>${s.subscribers}</b><span>Langganan</span></div>
      <div class="stat"><b>${s.projects}</b><span>Proyek</span></div>`;
  } catch (_) {}
}

async function render() {
  const panel = document.getElementById('panel');
  panel.innerHTML = '<p style="color:var(--muted)">Memuat…</p>';

  if (TAB === 'subs') return renderSubscribers(panel);
  return renderComments(panel);
}

/* -------------------------------------------------------------- komentar */
async function renderComments(panel) {
  let items = [];
  try {
    const res = await api(`/api/admin/comments?status=${encodeURIComponent(TAB)}`);
    items = res.comments || [];
  } catch (err) {
    panel.innerHTML = `<p class="msg msg--err">${esc(err.message)}</p>`;
    return;
  }

  if (!items.length) {
    panel.innerHTML = `<p style="color:var(--muted)">Tidak ada komentar di kategori ini.</p>`;
    return;
  }

  panel.innerHTML = items
    .map(
      (c) => `
      <div class="row-item" data-id="${c.id}">
        <div class="row-head">
          <b>${esc(c.name)}</b>
          <span class="pill pill--${esc(c.status)}">${esc(c.status)}</span>
          <span>${esc(formatDate(c.created_at))}</span>
          <span>· proyek: <a href="/karya/${encodeURIComponent(c.project)}" target="_blank" style="color:var(--accent)">${esc(c.project)}</a></span>
          ${c.email ? `<span>· ${esc(c.email)}</span>` : ''}
        </div>
        <p style="margin:0;white-space:pre-wrap">${esc(c.body)}</p>
        <div class="row-actions">
          ${c.status !== 'approved' ? '<button data-act="approve">Setujui</button>' : '<button data-act="unapprove">Sembunyikan</button>'}
          ${c.status !== 'spam' ? '<button data-act="reject">Tandai spam</button>' : ''}
          <button class="danger" data-act="delete">Hapus</button>
        </div>
      </div>`
    )
    .join('');

  panel.querySelectorAll('[data-act]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const wrap = btn.closest('.row-item');
      const id = wrap.dataset.id;
      const act = btn.dataset.act;
      if (act === 'delete' && !confirm('Hapus komentar ini secara permanen?')) return;
      btn.disabled = true;
      try {
        await api(`/api/admin/comments/${id}/${act}`, { method: 'POST' });
        wrap.remove();
        refreshStats();
        if (!panel.querySelector('.row-item')) panel.innerHTML = `<p style="color:var(--muted)">Tidak ada komentar di kategori ini.</p>`;
      } catch (err) {
        alert(err.message);
        btn.disabled = false;
      }
    })
  );
}

/* ------------------------------------------------------------- langganan */
async function renderSubscribers(panel) {
  let items = [];
  try {
    const res = await api('/api/admin/subscribers');
    items = res.subscribers || [];
  } catch (err) {
    panel.innerHTML = `<p class="msg msg--err">${esc(err.message)}</p>`;
    return;
  }

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px">
      <p style="margin:0;color:var(--muted)">${items.length} alamat terdaftar.</p>
      <a class="btn btn--ghost" href="/api/admin/subscribers.csv">Unduh CSV</a>
    </div>
    ${
      items.length
        ? `<table>
            <thead><tr><th>E-mail</th><th>Nama</th><th>Sumber</th><th>Tanggal</th><th></th></tr></thead>
            <tbody>
              ${items
                .map(
                  (s) => `<tr data-id="${s.id}">
                    <td>${esc(s.email)}</td>
                    <td>${esc(s.name || '—')}</td>
                    <td>${esc(s.source || '—')}</td>
                    <td>${esc(formatDate(s.created_at))}</td>
                    <td style="text-align:right"><button class="danger" data-del style="padding:5px 12px;border:1px solid var(--line);border-radius:999px;background:transparent;color:var(--muted);cursor:pointer;font:inherit;font-size:var(--step--1)">Hapus</button></td>
                  </tr>`
                )
                .join('')}
            </tbody>
          </table>`
        : `<p style="color:var(--muted)">Belum ada yang berlangganan.</p>`
    }`;

  panel.querySelectorAll('[data-del]').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const tr = btn.closest('tr');
      if (!confirm('Hapus alamat ini dari daftar?')) return;
      try {
        await api(`/api/admin/subscribers/${tr.dataset.id}`, { method: 'DELETE' });
        tr.remove();
        refreshStats();
      } catch (err) {
        alert(err.message);
      }
    })
  );
}
