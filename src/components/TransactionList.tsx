import React, { useState } from 'react';
import { Trash2, Search, Filter, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction, getCategoryById } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatRupiah, formatShortDate } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  title?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  title = 'Riwayat Transaksi',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = transactions.filter((tx) => {
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const cat = getCategoryById(tx.category).name.toLowerCase();
      const notes = (tx.notes || '').toLowerCase();
      return cat.includes(q) || notes.includes(q);
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs mb-6">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <span className="text-xs text-slate-500 font-medium">
            {filtered.length} transaksi ditemukan
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('income')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              typeFilter === 'income'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('expense')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              typeFilter === 'expense'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari transaksi berdasarkan catatan atau kategori..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* Transactions Feed */}
      {filtered.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <AlertCircle size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-500">Tidak ada transaksi yang cocok</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Coba ubah tanggal atau kata kunci pencarian
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const catInfo = getCategoryById(tx.category);
            const isIncome = tx.type === 'income';
            const isConfirmingDelete = deleteConfirmId === tx.id;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
              >
                {/* Left: Icon & Category info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: `${catInfo.color}15`, color: catInfo.color }}
                  >
                    <CategoryIcon iconName={catInfo.iconName} size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-800 truncate block">
                        {catInfo.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                      <span>{formatShortDate(tx.date)}</span>
                      {tx.notes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{tx.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold tabular-nums block ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? `+${formatRupiah(tx.amount)}` : `-${formatRupiah(tx.amount)}`}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize block">
                      {isIncome ? 'Masuk' : 'Keluar'}
                    </span>
                  </div>

                  {/* Delete button with safety toggle */}
                  {isConfirmingDelete ? (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteTransaction(tx.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 rounded-lg"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(tx.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100"
                      title="Hapus transaksi"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
