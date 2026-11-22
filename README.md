# FinFlow — Manajemen Keuangan Pribadi

Aplikasi web (PWA) untuk mencatat dan memantau keuangan pribadi. Seluruh data disimpan di **Google Sheets milik pengguna sendiri** — tidak ada server atau database tambahan. Login memakai akun Google, dan aplikasi hanya mengakses file yang dibuatnya sendiri.

## Fitur

- **Login Google** (Google Identity Services) tanpa backend.
- **Database otomatis di Google Sheets** — spreadsheet `FinFlow Database` dibuat saat login pertama, lengkap dengan tab, header, dan data awal.
- **Dashboard** — saldo total (bisa disembunyikan), carousel kartu/dompet, tujuan tabungan, Quick Send, dan transaksi terbaru.
- **Transaksi** — tambah, ubah, hapus; filter Semua / Pemasukan / Pengeluaran; navigasi per bulan; ringkasan pemasukan vs pengeluaran.
- **Dompet (Cards)** — kelola banyak dompet/rekening dengan saldo awal.
- **Kategori** — kategori pemasukan & pengeluaran dengan ikon dan warna, bisa dikelola sendiri.
- **Tujuan Tabungan (Goals)** — buat target (dana darurat, dana pensiun, beli HP, dll.), setor/tarik, dan pantau progres.
- **Quick Send (Kontak)** — simpan rekening bank, virtual account, atau e-wallet orang yang sering ditransfer, lalu catat transaksinya dengan satu ketukan.
- **Offline-first** — data di-cache di perangkat, perubahan masuk antrean dan otomatis disinkronkan ke Google Sheets saat online.
- **PWA** — bisa di-install, berjalan offline, dan punya shortcut *Tambah Transaksi*.
- **Responsif** — bottom navigation di mobile, sidebar di desktop.

## Teknologi

| Kebutuhan | Teknologi |
| --- | --- |
| Framework | Vue 3 (`<script setup>`) |
| Routing | Vue Router 5 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 3 + PostCSS |
| PWA | `vite-plugin-pwa` (Workbox) + `@vite-pwa/assets-generator` |
| Font | Space Grotesk, Plus Jakarta Sans (`@fontsource-variable`) |
| Ikon | Material Symbols Outlined |
| Auth & data | Google Identity Services, Google Sheets API v4, Google Drive API v3 |

## Prasyarat

- Node.js **20.19+** atau **22.12+** (syarat Vite 8)
- npm
- Akun Google dan proyek di [Google Cloud Console](https://console.cloud.google.com/)

## Konfigurasi Google Cloud

1. Buat proyek baru di Google Cloud Console.
2. Aktifkan API berikut di **APIs & Services → Library**:
   - **Google Sheets API**
   - **Google Drive API**
3. Atur **OAuth consent screen**. Selama status *Testing*, tambahkan email Anda ke daftar **Test users**.
4. Buat kredensial di **Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (development)
     - URL produksi Anda, mis. `https://finflow.example.com`
5. Salin **Client ID** yang dihasilkan.

> Scope yang diminta: `openid`, `userinfo.email`, `userinfo.profile`, dan `drive.file`. Scope `drive.file` hanya mengizinkan akses ke file yang dibuat oleh aplikasi ini, bukan seluruh Drive pengguna.

## Instalasi

```bash
# 1. Install dependensi
npm install

# 2. Buat file environment
echo "VITE_GOOGLE_CLIENT_ID=ISI_CLIENT_ID_ANDA.apps.googleusercontent.com" > .env.local

# 3. Jalankan development server
npm run dev
```

Buka `http://localhost:5173`, lalu login dengan akun Google.

## Environment Variable

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `VITE_GOOGLE_CLIENT_ID` | Ya | OAuth Client ID (tipe Web application) dari Google Cloud |

Jangan commit `.env.local` ke repository.

## Script

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build production ke folder `dist/` |
| `npm run preview` | Menjalankan hasil build secara lokal |

> Service worker PWA nonaktif saat `npm run dev`. Untuk mengujinya, gunakan `npm run build && npm run preview`, atau ubah `devOptions.enabled` menjadi `true` di `vite.config.js`.

## Struktur Proyek

```
.
├── index.html
├── vite.config.js            # Vite + konfigurasi PWA/Workbox
├── tailwind.config.js        # Design token (warna, font, spacing)
├── public/                   # Favicon, ikon PWA, logo, gambar
└── src/
    ├── main.js               # Entry point + registrasi service worker
    ├── App.vue
    ├── router/               # Rute + guard autentikasi
    ├── views/                # Halaman: Dashboard, Transactions, Wallets,
    │                         #          Categories, Goals, Profile, Onboarding
    ├── components/
    │   ├── auth/             # Tombol login & hero onboarding
    │   ├── dashboard/        # Kartu saldo, carousel, Quick Send, kontak
    │   ├── transactions/     # Form, daftar, ringkasan, chart mini
    │   ├── wallets/          # Form dompet
    │   ├── categories/       # Form kategori
    │   ├── goals/            # Kartu, form, detail, dan setoran tujuan
    │   ├── layout/           # AppShell, sidebar, bottom nav, FAB
    │   └── ui/               # Komponen dasar (modal, ikon, avatar, nominal)
    ├── composables/          # State & logika bersama
    │   ├── useGoogleAuth.js      # Login, token, sesi
    │   ├── useGoogleSheets.js    # Setup & operasi baca/tulis spreadsheet
    │   ├── useTransactions.js    # Data utama, antrean sinkronisasi, kalkulasi
    │   ├── useOnlineStatus.js
    │   ├── useBalanceVisibility.js
    │   ├── useTransactionModal.js
    │   └── useGoalUi.js
    ├── services/
    │   ├── googleAuth.js     # Wrapper Google Identity Services
    │   ├── sheetsApi.js      # Klien REST Sheets & Drive
    │   └── localCache.js     # Cache localStorage per pengguna
    └── utils/                # Konstanta, skema sheet, format tanggal/mata uang
```

## Skema Google Sheets

Spreadsheet **FinFlow Database** dibuat otomatis dengan tab berikut (baris 1 = header):

| Tab | Kolom |
| --- | --- |
| `Transactions` | `id`, `date`, `type`, `amount`, `category_id`, `wallet_id`, `note`, `created_at` |
| `Categories` | `id`, `name`, `type`, `icon`, `color` |
| `Wallets` | `id`, `name`, `type`, `initial_balance`, `currency`, `color` |
| `Contacts` | `id`, `name`, `accounts`, `note`, `created_at` |
| `Goals` | `id`, `name`, `target_amount`, `deadline`, `icon`, `color`, `created_at` |
| `GoalEntries` | `id`, `goal_id`, `type`, `amount`, `date`, `note`, `created_at` |

Data awal: 9 kategori default (Makanan & Minuman, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Gaji, Pemasukan Lain, Lainnya) dan 1 dompet **Tunai** (IDR).

Anda bebas membuka spreadsheet ini langsung di Google Sheets, tetapi **jangan mengubah urutan atau nama kolom header** karena aplikasi membacanya berdasarkan skema di `src/utils/sheetSchema.js`.

## Cara Kerja

**Autentikasi.** Token akses diminta lewat popup Google Identity Services dan disimpan di `sessionStorage` (hanya selama tab terbuka). Profil pengguna disimpan di `localStorage` agar aplikasi tetap bisa dibuka offline. Bila token habis (±1 jam), token diminta ulang secara diam-diam; jika gagal, tombol **Hubungkan ulang** muncul.

**Penemuan database.** Setelah login, aplikasi mencari spreadsheet dengan urutan: ID tersimpan di perangkat → pencarian nama `FinFlow Database` di Drive → membuat spreadsheet baru. Dengan begitu, login di perangkat baru tetap memakai database yang sama.

**Sinkronisasi offline.** Setiap perubahan (tambah/ubah/hapus) langsung tampil di UI dan dimasukkan ke antrean. Antrean dikirim ke Google Sheets saat koneksi tersedia, dengan percobaan ulang untuk operasi yang gagal. Status sinkron terakhir dan jumlah perubahan yang menunggu bisa dilihat di halaman **Profile**.

**Keamanan data di perangkat.** Saat logout, cache data keuangan di perangkat dihapus. Jika masih ada perubahan yang belum tersinkron, aplikasi meminta konfirmasi terlebih dahulu.

**Caching PWA.** App shell di-*precache* agar bisa dibuka offline, sedangkan seluruh host Google (Sheets, Drive, OAuth) memakai strategi `NetworkOnly` sehingga data keuangan dan autentikasi tidak pernah dilayani dari cache.

## Deployment

```bash
npm run build
```

Folder `dist/` berisi situs statis yang bisa di-deploy ke hosting statis mana pun (Netlify, Vercel, Cloudflare Pages, Firebase Hosting, Nginx, dll.). Hal yang perlu diperhatikan:

- Gunakan **HTTPS** (wajib untuk service worker dan instalasi PWA).
- Aktifkan **SPA fallback** — semua rute diarahkan ke `index.html`.
- Tambahkan domain produksi ke **Authorized JavaScript origins** di Google Cloud.
- Set `VITE_GOOGLE_CLIENT_ID` pada environment build di platform hosting Anda.
- Untuk dipakai publik, ajukan verifikasi OAuth consent screen ke Google; selama status *Testing*, hanya Test users yang bisa login.

## Pemecahan Masalah

| Gejala | Penyebab & solusi |
| --- | --- |
| `VITE_GOOGLE_CLIENT_ID belum diisi` | Buat `.env.local`, isi Client ID, lalu restart `npm run dev`. |
| Popup login tidak muncul | Browser memblokir popup. Izinkan popup untuk situs ini. |
| `SCOPE_NOT_GRANTED` | Saat consent, semua izin (termasuk Google Drive) harus dicentang. Login ulang. |
| `Error 400: origin_mismatch` | Origin belum terdaftar. Tambahkan URL ke *Authorized JavaScript origins*. |
| `Access blocked` / app belum diverifikasi | Tambahkan akun Anda ke *Test users* di OAuth consent screen. |
| Error 403 saat membuat/mencari spreadsheet | Pastikan **Google Sheets API** dan **Google Drive API** sudah aktif di proyek yang sama dengan Client ID. |
| Data tidak berubah setelah update kode | Service worker lama masih aktif. Hard refresh atau *Unregister* service worker di DevTools → Application. |

## Lisensi

Belum ditentukan. Tambahkan berkas `LICENSE` sesuai kebutuhan proyek Anda.