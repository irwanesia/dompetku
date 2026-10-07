import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ArrowDownLeft, ArrowUpRight, Calendar, FileText } from 'lucide-react';
import {
  TransactionType,
  CategoryInfo,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  getTodayDateString,
} from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatRupiah } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  defaultDate?: string;
  onSave: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    notes: string;
    date: string;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
  defaultDate,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate || getTodayDateString());
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setDate(defaultDate || getTodayDateString());
      setAmountStr('');
      setNotes('');
      setError('');
      // Set first category by default
      const categories = defaultType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      setCategory(categories[0]?.id || '');
    }
  }, [isOpen, defaultType, defaultDate]);

  useEffect(() => {
    // When type changes, switch default category to that type
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setCategory(categories[0]?.id || '');
  }, [type]);

  if (!isOpen) return null;

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const numAmount = parseFloat(amountStr) || 0;

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + addValue));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) {
      setError('Masukkan jumlah nominal yang valid (lebih besar dari 0).');
      return;
    }
    if (!category) {
      setError('Pilih salah satu kategori transaksi.');
      return;
    }

    onSave({
      type,
      amount: numAmount,
      category,
      notes: notes.trim(),
      date,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
          {/* Segmented Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={16} />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft size={16} />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Nominal Transaksi (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                placeholder="0"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-13 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-900 tabular-nums focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-300"
                autoFocus
              />
            </div>
            {numAmount > 0 && (
              <p className="text-xs font-medium text-emerald-600 mt-1.5 pl-1">
                Terbaca: <span className="font-semibold">{formatRupiah(numAmount)}</span>
              </p>
            )}

            {/* Quick Add Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[10000, 20000, 50000, 100000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  +{val >= 1000 ? `${val / 1000}rb` : val}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2 py-1 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Kategori
            </label>
            <div className="grid grid-cols-3 gap-2">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      if (error) setError('');
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-colors ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                      style={{ color: isSelected ? '#ffffff' : cat.color }}
                    >
                      <CategoryIcon iconName={cat.iconName} size={18} />
                    </div>
                    <span className="text-[11px] font-medium leading-tight truncate max-w-full px-1">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tanggal
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Makan siang, bayar wifi..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={80}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
              }`}
            >
              <Plus size={20} />
              <span>Simpan {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
