# DompetKu — Budget Tracker Harian

Aplikasi pelacak anggaran dan keuangan harian, dibuat dengan React + Vite + Tailwind CSS,
dan sudah mendukung instalasi sebagai PWA (Progressive Web App) di Android.

## Fitur

- Catat pemasukan & pengeluaran harian dengan kategori
- Ringkasan saldo harian dan anggaran harian
- Diagram analisis pengeluaran per kategori
- Ekspor laporan ke CSV
- Bisa diinstal di HP Android (berjalan fullscreen tanpa browser)

## Menjalankan Secara Lokal

**Prasyarat:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Opsional) set `GEMINI_API_KEY` di `.env.local` bila butuh fitur AI Gemini.
3. Jalankan dev server:
   ```bash
   npm run dev
   ```
4. Buka http://localhost:3000

## Build & Deploy

```bash
npm run build      # hasil di folder dist/
npm run preview    # preview hasil build
```

Deploy otomatis via Netlify: setiap `git push` ke GitHub, Netlify menjalankan
`npm run build` dan mempublish folder `dist`.

## Penyimpanan Data (Saat Ini)

Data masih disimpan di **localStorage** browser (lihat `src/App.tsx`):

```typescript
// Membaca data tersimpan saat inisialisasi
const saved = localStorage.getItem(STORAGE_KEY);      // transaksi
const savedBudget = localStorage.getItem(BUDGET_KEY); // anggaran harian

// Menyimpan setiap ada perubahan
localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
localStorage.setItem(BUDGET_KEY, String(dailyBudgetLimit));
```

> Catatan: data hanya tersimpan di browser/perangkat tersebut, tidak sinkron
> antar perangkat, dan bisa hilang jika data situs dibersihkan.

## Rencana Migrasi ke Google Sheets

Versi mendatang akan memindahkan penyimpanan ke Google Sheets via Google Apps Script
(Web App sebagai endpoint API), dengan `localStorage` tetap sebagai cache offline.

Kode localStorage saat ini **akan dipertahankan** di branch utama, sedangkan migrasi
dikerjakan di branch terpisah (`feature/google-sheets`).

Lihat dokumen lengkap rencana migrasi: **[MIGRASI_GOOGLE_SHEETS.md](./MIGRASI_GOOGLE_SHEETS.md)**
