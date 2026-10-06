/**
 * Format number into Indonesian Rupiah currency string
 * e.g., 50000 -> "Rp 50.000"
 */
export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Compact Rupiah format for small badges / charts
 * e.g., 1500000 -> "Rp 1,5 Jt", 45000 -> "Rp 45 Rb"
 */
export function formatRupiahCompact(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  let result = '';

  if (abs >= 1_000_000_000) {
    result = `Rp ${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  } else if (abs >= 1_000_000) {
    result = `Rp ${(abs / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  } else if (abs >= 1_000) {
    result = `Rp ${(abs / 1_000).toFixed(0)} Rb`;
  } else {
    result = `Rp ${abs}`;
  }

  return isNegative ? `-${result}` : result;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Format YYYY-MM-DD into Indonesian date string
 * e.g., "2026-10-06" -> "Selasa, 6 Oktober 2026"
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  const dayName = DAY_NAMES_ID[dateObj.getDay()];
  const monthName = MONTH_NAMES_ID[month - 1];

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Short date format e.g., "6 Okt"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [, month, day] = dateStr.split('-').map(Number);
  const shortMonth = MONTH_NAMES_ID[month - 1]?.slice(0, 3) || '';
  return `${day} ${shortMonth}`;
}

/**
 * Day name abbreviation e.g., "Sen", "Sel"
 */
export function getShortDayName(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const full = DAY_NAMES_ID[dateObj.getDay()];
  return full.slice(0, 3);
}
