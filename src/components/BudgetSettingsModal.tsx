import React, { useState } from 'react';
import { X, Check, Target, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSaveBudget: (budget: number) => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSaveBudget,
}) => {
  const [budgetStr, setBudgetStr] = useState<string>(String(currentBudget || 150000));

  if (!isOpen) return null;

  const numVal = parseFloat(budgetStr) || 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudget(Math.max(0, numVal));
    onClose();
  };

  const presetValues = [50000, 100000, 150000, 250000, 500000];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 flex flex-col animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Target size={18} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Target Anggaran Harian</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Batas Maksimal Pengeluaran / Hari
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                Rp
              </span>
              <input
                type="number"
                min="0"
                step="5000"
                value={budgetStr}
                onChange={(e) => setBudgetStr(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 transition-all tabular-nums"
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-500 mt-1 pl-1 font-medium">
              Target: <span className="text-slate-800 font-semibold">{formatRupiah(numVal)}</span> per hari
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Pilihan Cepat
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presetValues.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBudgetStr(String(val))}
                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                    numVal === val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {formatRupiah(val)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
          >
            <Check size={16} />
            <span>Terapkan Target</span>
          </button>
        </form>
      </div>
    </div>
  );
};
