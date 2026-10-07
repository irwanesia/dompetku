# Rencana Migrasi Penyimpanan ke Google Sheets

Dokumen ini berisi rencana step-by-step migrasi penyimpanan data DompetKu
dari `localStorage` (browser) ke Google Sheets, tanpa mengganggu versi
yang sekarang masih menggunakan `localStorage`.

> Status saat ini: penyimpanan masih menggunakan `localStorage`
> (lihat `src/App.tsx`, kunci `STORAGE_KEY` dan `BUDGET_KEY`).

---

## 1. Buat Google Spreadsheet

1. Buka [sheets.new](https://sheets.new) di Google Sheets.
2. Beri nama, misalnya `DompetKu DB`.
3. Buat 2 sheet:

**Sheet `Transactions`** (baris pertama = header):

| id | type | amount | category | notes | date |
|----|------|--------|----------|-------|------|

**Sheet `Settings`**:

| key | value |
|-----|-------|
| dailyBudgetLimit | 0 |

---

## 2. Buat Google Apps Script

1. Di spreadsheet: **Extensions → Apps Script**.
2. Hapus isi `Code.gs`, tempel kode berikut:

```javascript
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function doGet(e) {
  try {
    const txSheet = getSheet('Transactions');
    const txValues = txSheet.getDataRange().getValues();
    const headers = txValues.shift();
    const transactions = txValues.map(row => ({
      id: String(row[0]),
      type: row[1],
      amount: Number(row[2]),
      category: row[3],
      notes: row[4],
      date: row[5] instanceof Date
        ? Utilities.formatDate(row[5], Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : String(row[5]),
    }));

    const setSheet = getSheet('Settings');
    const setValues = setSheet.getDataRange().getValues();
    setValues.shift();
    const settings = {};
    setValues.forEach(r => settings[r[0]] = r[1]);

    return json({ ok: true, transactions, settings });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'addTransaction') {
      const t = body.transaction;
      getSheet('Transactions').appendRow([t.id, t.type, t.amount, t.category, t.notes, t.date]);
    } else if (action === 'deleteTransaction') {
      const sheet = getSheet('Transactions');
      const values = sheet.getDataRange().getValues();
      for (let i = values.length - 1; i >= 1; i--) {
        if (String(values[i][0]) === String(body.id)) sheet.deleteRow(i + 1);
      }
    } else if (action === 'setBudget') {
      const sheet = getSheet('Settings');
      const values = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] === 'dailyBudgetLimit') { sheet.getRange(i + 1, 2).setValue(body.value); found = true; }
      }
      if (!found) sheet.appendRow(['dailyBudgetLimit', body.value]);
    } else {
      return json({ ok: false, error: 'Unknown action' });
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Klik **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Authorize, lalu copy **Web app URL** (berakhiran `/exec`).

> Opsional keamanan: tambahkan pengecekan `body.token === 'KODE_RAHASIA'`
> di `doPost`/`doGet` dan kirim token yang sama dari aplikasi.

---

## 3. Konfigurasi di Project

1. Buat file `.env.local` di root project:

```
VITE_SHEETS_API_URL="https://script.google.com/macros/s/XXXX/exec"
```

2. Pastikan `.env.local` ada di `.gitignore`.

---

## 4. Perubahan Kode React (versi baru, terpisah dari versi localStorage)

Di `src/App.tsx`:

- Saat inisialisasi: `fetch(VITE_SHEETS_API_URL)` untuk memuat transaksi & budget;
  simpan hasilnya ke state **dan** tetap cache ke `localStorage` sebagai fallback offline.
- Saat tambah transaksi: panggil `fetch(url, { method: 'POST', body: JSON.stringify({ action: 'addTransaction', transaction }) })`,
  lalu update state lokal.
- Saat hapus transaksi: `action: 'deleteTransaction'`.
- Saat ubah budget: `action: 'setBudget'`.
- Jika fetch gagal (offline/error), fallback ke data `localStorage`.

Karena ini perubahan versi, disarankan dibuat di branch terpisah:

```bash
git checkout -b feature/google-sheets
```

---

## 5. Catatan

- Apps Script gratis punya kuota harian (±20.000 eksekusi/hari) — cukup untuk pemakaian pribadi.
- Sheets Apps Script "Anyone" bisa diakses siapa pun yang punya URL — gunakan token rahasia bila data sensitif.
- `localStorage` tetap dipakai sebagai cache offline; Sheets menjadi sumber data utama (sync antar perangkat).
- Setelah migrasi stabil, versi lama yang murni localStorage tetap tersedia di branch utama.
