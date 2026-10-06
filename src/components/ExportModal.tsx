import React, { useState } from 'react';
import { X, Download, Copy, Check, FileSpreadsheet, Calendar, Filter } from 'lucide-react';
import { Transaction } from '../types';
import { downloadTransactionsCsv, copyCsvToClipboard } from '../utils/exportCsv';
import { formatRupiah } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currentSelectedDate: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  currentSelectedDate,
}) => {
  const [rangeFilter, setRangeFilter] = useState<'today' | '7days' | 'month' | 'all'>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isCopied, setIsCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter transactions based on selected range & type
  const filteredTransactions = transactions.filter((tx) => {
    // Type filter
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

    // Range filter
    const now = new Date();
    const todayStr = currentSelectedDate;

    if (rangeFilter === 'today') {
      return tx.date === todayStr;
    }

    if (rangeFilter === '7days') {
      const txTime = new Date(tx.date).getTime();
      const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return txTime >= cutoff;
    }

    if (rangeFilter === 'month') {
      const currentYearMonth = todayStr.slice(0, 7);
      return tx.date.startsWith(currentYearMonth);
    }

    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleDownload = () => {
    const success = downloadTransactionsCsv(
      filteredTransactions,
      `laporan_keuangan_dompetku_${rangeFilter}_${new Date().toISOString().split('T')[0]}.csv`
    );
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const handleCopy = async () => {
    const success = await copyCsvToClipboard(filteredTransactions);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Ekspor Laporan CSV
              </h2>
              <span className="text-xs text-slate-500">
                Format standar untuk Excel, Sheets, & Akuntansi
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Rentang Waktu Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Rentang Waktu Laporan
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setRangeFilter('today')}
                className={`py-2 rounded-xl transition-all ${
                  rangeFilter === 'today'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setRangeFilter('7days')}
                className={`py-2 rounded-xl transition-all ${
                  rangeFilter === '7days'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => setRangeFilter('month')}
                className={`py-2 rounded-xl transition-all ${
                  rangeFilter === 'month'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
              <button
                type="button"
                onClick={() => setRangeFilter('all')}
                className={`py-2 rounded-xl transition-all ${
                  rangeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
            </div>
          </div>

          {/* Tipe Transaksi Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Filter Tipe
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  typeFilter === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Semua Transaksi
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  typeFilter === 'income'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pemasukan Saja
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  typeFilter === 'expense'
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Pengeluaran Saja
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Data yang akan diekspor:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {filteredTransactions.length} Baris Transaksi
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total Pemasukan:</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                +{formatRupiah(totalIncome)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Total Pengeluaran:</span>
              <span className="font-semibold text-rose-600 tabular-nums">
                -{formatRupiah(totalExpense)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Saldo Kas Bersih:</span>
              <span className="font-bold text-slate-900 tabular-nums text-sm">
                {formatRupiah(netBalance)}
              </span>
            </div>
          </div>

          {/* Preview of CSV Columns */}
          <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">Kolom Data CSV Termasuk:</p>
            <p className="text-slate-500 font-mono text-[10px]">
              No, ID Transaksi, Tanggal, Tipe, Kategori, Jumlah (IDR), Catatan
            </p>
          </div>

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check size={16} />
              <span>File CSV berhasil diunduh ke perangkat Anda!</span>
            </div>
          )}

          {/* Buttons: Unduh CSV & Salin Clipboard */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleDownload}
              disabled={filteredTransactions.length === 0}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Download size={18} />
              <span>Unduh File CSV (.csv)</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={filteredTransactions.length === 0}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              <span>{isCopied ? 'Tersalin ke Clipboard!' : 'Salin Teks CSV ke Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
