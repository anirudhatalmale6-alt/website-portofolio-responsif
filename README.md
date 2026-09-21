# Website Portofolio Responsif Interaktif

Website portofolio yang ringan dan cepat: halaman statis (HTML + CSS + JavaScript murni,
tanpa framework) dengan server kecil Node.js untuk komentar dan daftar langganan e-mail.

**Fitur**

- Halaman portofolio responsif (desktop, tablet, mobile) + mode gelap/terang
- Halaman detail untuk tiap karya, lengkap dengan galeri dan metadata
- Sistem komentar per proyek dengan moderasi (komentar tampil setelah disetujui)
- Formulir berlangganan e-mail + ekspor daftar ke CSV
- Tombol bagikan ke WhatsApp, X, Facebook, LinkedIn, dan salin tautan
- Blok media sosial / feed di halaman depan
- Panel admin sederhana di `/admin`
- Anti-spam: honeypot, pembatasan jumlah kiriman, dan validasi input

**Ukuran halaman depan:** 46,8 KB HTML + CSS + JS, menjadi **13,9 KB** setelah gzip
(gambar terpisah). Tanpa font eksternal, tanpa pelacak, tanpa permintaan ke domain lain.

---

## 1. Menjalankan di komputer sendiri

Syarat: Node.js versi 20 atau lebih baru.

```bash
npm install
cp .env.example .env      # lalu ubah ADMIN_USER dan ADMIN_PASS
npm start
```

Buka `http://localhost:4321` — panel admin ada di `http://localhost:4321/admin`.

Untuk mengembangkan (server restart otomatis saat file berubah):

```bash
npm run dev
```

## 2. Pengaturan (file `.env`)

| Variabel | Arti | Bawaan |
|---|---|---|
| `PORT` | Port server | `4321` |
| `HOST` | Alamat bind | `0.0.0.0` |
| `ADMIN_USER` | Username panel admin | `admin` |
| `ADMIN_PASS` | Password panel admin — **wajib diganti** | `ubahsaya` |
| `AUTO_APPROVE_COMMENTS` | `1` = komentar langsung tayang, `0` = dimoderasi | `0` |
| `DATA_DIR` | Lokasi file database SQLite | `./data` |

## 3. Struktur folder

```
content/
  site.json          ← identitas, teks tentang, fakta, layanan, WhatsApp,
                       media sosial, feed, SEO, warna aksen, rasio sampul
  projects.json      ← DAFTAR KARYA (yang paling sering Anda ubah)
public/
  index.html         ← beranda
  project.html       ← kerangka halaman detail karya
  404.html
  admin/index.html   ← panel admin
  css/style.css      ← seluruh gaya tampilan
  js/                ← common.js, main.js, project.js, admin.js
  img/projects/      ← gambar karya
src/
  db.js              ← akses database SQLite
  content.js         ← pembaca file content/*.json
tools/
  make-placeholders.js  ← pembuat gambar contoh
data/                ← database SQLite (dibuat otomatis, jangan dihapus)
server.js            ← server Express
```

## 4. Cara kerja singkat

- `content/projects.json` dibaca ulang **setiap kali ada permintaan** dan hanya di-parse
  kembali kalau tanggal ubah file berganti. Artinya: menambah karya cukup simpan file,
  tanpa restart server.
- Komentar dan e-mail langganan disimpan di SQLite (`data/portfolio.db`). Satu file,
  mudah dicadangkan — cukup salin foldernya.
- Semua teks yang dikirim pengunjung di-escape sebelum ditampilkan, jadi aman dari
  penyisipan skrip (XSS).

## 5. Menaruh di server (produksi)

1. Salin folder proyek ke server, jalankan `npm install --omit=dev`.
2. Buat file `.env` dengan `ADMIN_PASS` yang kuat.
3. Jalankan lewat pengelola proses, misalnya systemd atau pm2:
   ```bash
   pm2 start server.js --name portofolio
   pm2 save
   ```
4. Taruh Nginx di depannya untuk HTTPS:
   ```nginx
   server {
     server_name domainanda.com;
     location / {
       proxy_pass http://127.0.0.1:4321;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   ```
5. Pasang sertifikat SSL (`certbot --nginx`). Setelah HTTPS aktif, cookie login admin
   otomatis memakai flag `Secure`.

**Cadangan data:** salin folder `data/` secara berkala. Itu berisi seluruh komentar dan
daftar langganan.

## 6. Panduan pemakaian harian

Ada di file terpisah: **[PANDUAN.md](PANDUAN.md)** — cara menambah karya baru,
mengelola komentar, dan memeriksa daftar langganan.
