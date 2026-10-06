import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Target, SlidersHorizontal, Info } from 'lucide-react';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters';

interface DailyBalanceCardProps {
  selectedDate: string;
  totalIncomeToday: number;
  totalExpenseToday: number;
  dailyBudgetLimit: number;
  onOpenBudgetModal: () => void;
  onQuickAddIncome: () => void;
  onQuickAddExpense: () => void;
}

export const DailyBalanceCard: React.FC<DailyBalanceCardProps> = ({
  selectedDate,
  totalIncomeToday,
  totalExpenseToday,
  dailyBudgetLimit,
  onOpenBudgetModal,
  onQuickAddIncome,
  onQuickAddExpense,
}) => {
  // Sisa Saldo Harian:
  // 1. Net cashflow = Income today - Expense today
  const netDailyCashflow = totalIncomeToday - totalExpenseToday;
  
  // 2. Budget limit remaining = Budget Limit - Expense today
  const remainingBudget = dailyBudgetLimit - totalExpenseToday;
  const budgetUsagePercent = dailyBudgetLimit > 0
    ? Math.min(100, Math.round((totalExpenseToday / dailyBudgetLimit) * 100))
    : 0;

  // Status computation
  let statusText = 'Terkendali';
  let statusBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (dailyBudgetLimit > 0 && remainingBudget < 0) {
    statusText = 'Melebihi Target';
    statusBadgeClass = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (dailyBudgetLimit > 0 && budgetUsagePercent >= 80) {
    statusText = 'Waspada 80%+';
    statusBadgeClass = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (netDailyCashflow > 0) {
    statusText = 'Surplus';
    statusBadgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 shadow-lg shadow-slate-900/10 mb-5 relative overflow-hidden">
      {/* Subtle decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar of the card */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">
            {formatIndonesianDate(selectedDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadgeClass}`}>
            {statusText}
          </span>
          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Atur Target Anggaran Harian"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Main Sisa Saldo Display */}
      <div className="relative z-10 mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
            Sisa Saldo Kas Harian
          </span>
          {dailyBudgetLimit > 0 && (
            <span className="text-[11px] text-slate-400">
              Target: <span className="text-white font-medium">{formatRupiah(dailyBudgetLimit)}</span>
            </span>
          )}
        </div>
        <div className="text-3xl font-extrabold tracking-tight mt-1 text-white tabular-nums flex items-baseline gap-2">
          <span>{formatRupiah(netDailyCashflow)}</span>
          {netDailyCashflow > 0 && (
            <span className="text-xs font-medium text-emerald-400">▲ Bersih</span>
          )}
        </div>

        {/* Progress bar for daily budget if set */}
        {dailyBudgetLimit > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
              <span>Sisa kuota belanja harian:</span>
              <span className={`font-semibold tabular-nums ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatRupiah(remainingBudget)} ({100 - budgetUsagePercent}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-700/80 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  remainingBudget < 0
                    ? 'bg-rose-500'
                    : budgetUsagePercent > 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid of Income & Expense */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 relative z-10">
        <button
          type="button"
          onClick={onQuickAddIncome}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownLeft size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Pemasukan</span>
            <span className="text-sm font-bold text-emerald-400 tabular-nums block truncate">
              +{formatRupiah(totalIncomeToday)}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onQuickAddExpense}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <ArrowUpRight size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 block font-medium">Pengeluaran</span>
            <span className="text-sm font-bold text-rose-400 tabular-nums block truncate">
              -{formatRupiah(totalExpenseToday)}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
