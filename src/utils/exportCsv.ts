import { Transaction, getCategoryById } from '../types';
import { formatRupiah } from './formatters';

function escapeCsvField(field: string | number): string {
  const str = String(field ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 BOM
 */
export function generateCsvString(transactions: Transaction[]): string {
  const headers = [
    'No',
    'ID Transaksi',
    'Tanggal',
    'Tipe',
    'Kategori',
    'Jumlah (IDR)',
    'Catatan',
  ];

  const sorted = [...transactions].sort((a, b) => {
    if (a.date === b.date) {
      return b.createdAt - a.createdAt;
    }
    return b.date.localeCompare(a.date);
  });

  const rows = sorted.map((tx, index) => {
    const categoryInfo = getCategoryById(tx.category);
    const typeLabel = tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
    return [
      index + 1,
      tx.id,
      tx.date,
      typeLabel,
      categoryInfo.name,
      tx.amount,
      tx.notes || '-',
    ].map(escapeCsvField).join(',');
  });

  // Calculate summary metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Append summary block
  const summaryRows = [
    '',
    ['', '', '', '', '--- RINGKASAN LAPORAN KEUANGAN ---', '', ''].map(escapeCsvField).join(','),
    ['', '', '', '', 'Total Pemasukan', totalIncome, `(${formatRupiah(totalIncome)})`].map(escapeCsvField).join(','),
    ['', '', '', '', 'Total Pengeluaran', totalExpense, `(${formatRupiah(totalExpense)})`].map(escapeCsvField).join(','),
    ['', '', '', '', 'Sisa Saldo Bersih', netBalance, `(${formatRupiah(netBalance)})`].map(escapeCsvField).join(','),
    ['', '', '', '', 'Tanggal Ekspor', new Date().toLocaleString('id-ID'), ''].map(escapeCsvField).join(','),
  ];

  const csvContent = [headers.join(','), ...rows, ...summaryRows].join('\r\n');
  return '\uFEFF' + csvContent; // Add BOM for Excel UTF-8 support
}

/**
 * Downloads transactions as CSV file
 */
export function downloadTransactionsCsv(
  transactions: Transaction[],
  customFilename?: string
): boolean {
  try {
    const csvData = generateCsvString(transactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', customFilename || `laporan_keuangan_dompetku_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to download CSV:', error);
    return false;
  }
}

/**
 * Copies CSV content to clipboard
 */
export async function copyCsvToClipboard(transactions: Transaction[]): Promise<boolean> {
  try {
    const csvData = generateCsvString(transactions);
    await navigator.clipboard.writeText(csvData);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
