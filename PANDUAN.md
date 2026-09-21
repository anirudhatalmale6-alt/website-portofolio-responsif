# Panduan Singkat Pemakaian

Tiga hal yang akan Anda lakukan sehari-hari: menambah karya, mengelola komentar,
dan memeriksa daftar langganan.

---

## A. Menambah karya baru

Semua karya ada di satu file: **`content/projects.json`**.

### Langkah

1. **Siapkan gambar.** Taruh di `public/img/projects/`.
   Saran ukuran: lebar 1200–1600 px, format `.jpg` atau `.webp`, di bawah 300 KB per gambar.
   Contoh nama file: `warung-kopi-cover.jpg`, `warung-kopi-1.jpg`.

2. **Buka `content/projects.json`** dan tambahkan satu blok baru di dalam tanda kurung siku.
   Karya paling atas tampil paling dulu di halaman depan.

```json
{
  "slug": "warung-kopi",
  "title": "Warung Kopi",
  "category": "Identitas Merek",
  "year": "2026",
  "client": "Warung Kopi Sejahtera",
  "role": "Identitas visual, kemasan",
  "cover": "/img/projects/warung-kopi-cover.jpg",
  "summary": "Satu kalimat ringkas tentang proyek ini.",
  "featured": true,
  "body": [
    "Paragraf pertama cerita proyek.",
    "Paragraf kedua. Tambahkan sebanyak yang Anda mau."
  ],
  "gallery": [
    "/img/projects/warung-kopi-1.jpg",
    "/img/projects/warung-kopi-2.jpg"
  ],
  "tags": ["branding", "kemasan"],
  "link": "https://situsklien.com"
}
```

3. **Simpan file.** Selesai — halaman langsung ikut berubah, tidak perlu restart server.
   Cukup muat ulang browser.

### Arti tiap kolom

| Kolom | Wajib | Keterangan |
|---|---|---|
| `slug` | ya | Alamat halaman: `/karya/warung-kopi`. Huruf kecil, pakai tanda hubung, **jangan diubah** setelah dibagikan |
| `title` | ya | Judul karya |
| `category` | tidak | Dipakai untuk tombol filter di halaman depan. Kategori baru otomatis muncul |
| `year`, `client`, `role` | tidak | Tampil di kolom metadata halaman detail |
| `cover` | ya | Gambar utama |
| `summary` | tidak | Satu kalimat di bawah judul |
| `body` | tidak | Daftar paragraf cerita proyek |
| `gallery` | tidak | Daftar gambar tambahan |
| `tags` | tidak | Label kecil di bawah cerita |
| `link` | tidak | Kalau diisi, muncul tombol "Buka situs" |
| `featured` | tidak | Penanda saja untuk kebutuhan Anda |
| `draft` | tidak | Isi `true` untuk menyembunyikan karya tanpa menghapusnya |

### Kalau situs error setelah diedit

Hampir selalu penyebabnya tanda koma. Aturannya: antar blok karya dipisah koma,
tapi blok **terakhir tidak diberi koma**. Untuk memeriksa:

```bash
node -e "JSON.parse(require('fs').readFileSync('content/projects.json','utf8')); console.log('JSON valid')"
```

### Mengubah teks selain karya

Nama, tagline, teks "Tentang", daftar layanan, tautan media sosial, dan warna aksen
ada di **`content/site.json`**. Struktur file sudah diberi contoh isinya.

Isi `site.json` saat ini:

| Kunci | Isinya |
|---|---|
| `name`, `role`, `tagline` | Teks besar di bagian paling atas halaman |
| `availability` | Tulisan kecil bertitik hijau di atas nama |
| `about` | Daftar paragraf di bagian Tentang |
| `facts` | Kotak Nama / Status / Bidang. Tambah atau kurangi bebas |
| `services` | Daftar layanan bernomor |
| `whatsapp` | Nomor WhatsApp: `url` dan `label` yang tampil |
| `socials` | Tombol media sosial. Tautan yang sama dengan WhatsApp di atas tidak diulang |
| `feed` | Blok cuplikan di bagian Kontak (lihat di bawah) |
| `seo` | Judul dan deskripsi untuk Google |
| `theme` | Warna aksen, mode bawaan, rasio gambar sampul |

Untuk mengganti warna aksen situs, ubah satu baris ini saja:

```json
"theme": { "accent": "#22A68A", "default_mode": "dark", "cover_ratio": "5 / 3" }
```

`cover_ratio` adalah perbandingan lebar : tinggi kotak gambar di halaman depan.
Sekarang `5 / 3` karena gambar Anda berukuran 1200×720. Kalau nanti gambar
karyanya berbentuk lain, ubah angka ini supaya gambar tidak terpotong —
misalnya `4 / 3` untuk foto kamera biasa, atau `16 / 9` untuk tangkapan layar lebar.

### Menyalakan feed Instagram

Bagian `feed` di `site.json` sekarang menampilkan cuplikan karya Anda sendiri.
Begitu Anda punya akun Instagram, isi `handle` dan `url`. Kalau ingin feed asli
(bukan cuplikan), tempelkan kode embed resmi dari Instagram ke `embed_html` —
kode itu yang akan dipakai menggantikan cuplikan.

---

## B. Mengelola komentar

Buka **`/admin`** (misalnya `https://domainanda.com/admin`), masuk dengan username dan
password dari file `.env`.

### Alur komentar

```
Pengunjung kirim  →  status MENUNGGU  →  Anda setujui  →  tampil di halaman karya
                                      →  Anda tandai spam / hapus  →  tidak pernah tampil
```

Komentar **tidak pernah langsung tampil** sebelum Anda setujui. Jadi situs aman dari
komentar spam meskipun Anda sedang tidak memantau.

### Di panel admin

- Tab **Menunggu** — komentar baru. Tombol: `Setujui`, `Tandai spam`, `Hapus`.
- Tab **Disetujui** — yang sedang tampil. Tombol `Sembunyikan` mengembalikannya ke status menunggu.
- Tab **Spam** — arsip. Bisa dihapus permanen kapan saja.
- Angka di kotak atas menunjukkan jumlah tiap status.
- Nama proyek pada tiap komentar bisa diklik untuk langsung melihat halamannya.

### Kalau ingin komentar langsung tampil tanpa persetujuan

Ubah `.env` menjadi `AUTO_APPROVE_COMMENTS=1` lalu restart server.
Tidak disarankan kecuali situs dipantau setiap hari.

### Catatan

- E-mail pengunjung **tidak pernah ditampilkan** di situs; hanya terlihat oleh Anda di panel admin.
- Satu alamat IP dibatasi 3 komentar per menit.
- Ada kolom jebakan tersembunyi (honeypot): robot spam yang mengisinya langsung diabaikan
  tanpa masuk database.

---

## C. Memeriksa daftar langganan e-mail

Di panel admin, buka tab **Langganan**.

- Tabel berisi: alamat e-mail, nama (kalau diisi), sumber pendaftaran, dan tanggal.
- Tombol **Unduh CSV** menyimpan seluruh daftar sebagai file `.csv`
  (sudah ber-BOM UTF-8, jadi Excel membacanya dengan benar).
- Tombol **Hapus** di tiap baris untuk mencabut alamat — gunakan kalau ada yang minta
  berhenti berlangganan.

### Mengirim buletin

Daftar ini sengaja dibuat netral. Unggah file CSV-nya ke layanan kirim e-mail mana pun
(Mailchimp, Brevo, MailerLite, Substack) saat Anda siap mengirim. Dengan begitu Anda
tidak terikat pada satu layanan dan pengiriman massal tidak dianggap spam.

Kalau nanti Anda ingin pendaftaran langsung masuk ke Mailchimp/Brevo secara otomatis,
sambungannya bisa ditambahkan — beri tahu saya layanan mana yang dipakai.

---

## D. Hal-hal kecil yang berguna

**Mengganti foto profil** — timpa file `public/img/portrait.svg`, atau taruh foto baru
lalu ubah alamatnya di `public/index.html` pada bagian `about__portrait`.

**Mengganti favicon** — timpa `public/img/favicon.svg`.

**Mencadangkan semua data** — salin folder `data/`. Itu berisi seluruh komentar dan
daftar langganan.

```bash
cp -r data/ cadangan-$(date +%F)/
```

**Menghapus data contoh** — isi `content/projects.json` dan gambar di
`public/img/projects/` adalah contoh; ganti dengan karya Anda sendiri. Untuk
mengosongkan komentar dan langganan contoh, hentikan server lalu hapus folder `data/`
(akan dibuat ulang kosong saat server dijalankan lagi).

**Lupa password admin** — ubah `ADMIN_PASS` di `.env`, lalu restart server.
