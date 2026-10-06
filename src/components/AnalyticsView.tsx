import React, { useState } from 'react';
import { PieChart, PieSlice } from './PieChart';
import { Transaction, getCategoryById, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters';
import { PieChart as PieIcon, TrendingDown, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  selectedDate: string;
  dailyBudgetLimit: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  selectedDate,
  dailyBudgetLimit,
}) => {
  const [chartMode, setChartMode] = useState<'balance' | 'expense_category' | 'income_category'>('balance');

  // Filter transactions for this day
  const dayTransactions = transactions.filter((t) => t.date === selectedDate);
  const dayIncomes = dayTransactions.filter((t) => t.type === 'income');
  const dayExpenses = dayTransactions.filter((t) => t.type === 'expense');

  const totalDayIncome = dayIncomes.reduce((acc, t) => acc + t.amount, 0);
  const totalDayExpense = dayExpenses.reduce((acc, t) => acc + t.amount, 0);
  const netDayBalance = totalDayIncome - totalDayExpense;

  // Compute slices based on chartMode
  let slices: PieSlice[] = [];
  let centerTitle = '';
  let centerSubtitle = '';
  let centerColorClass = 'text-slate-900';

  if (chartMode === 'balance') {
    // Mode Sisa Saldo Harian:
    // If user has a daily budget target, show: Remaining Budget vs Spent
    // If not or if budget is 0, show Net Balance vs Spent
    const baseBudget = dailyBudgetLimit > 0 ? dailyBudgetLimit : Math.max(totalDayIncome, totalDayExpense);
    const remainingBudget = Math.max(0, baseBudget - totalDayExpense);
    const totalBasis = remainingBudget + totalDayExpense;

    if (totalBasis > 0) {
      slices = [
        {
          id: 'sisa_saldo',
          label: 'Sisa Saldo / Budget',
          value: remainingBudget,
          color: '#10b981', // emerald-500
          percentage: (remainingBudget / totalBasis) * 100,
        },
        {
          id: 'pengeluaran',
          label: 'Pengeluaran Terpakai',
          value: totalDayExpense,
          color: '#f43f5e', // rose-500
          percentage: (totalDayExpense / totalBasis) * 100,
        },
      ];
    }

    centerTitle = formatRupiah(remainingBudget);
    centerSubtitle = 'Sisa Saldo Harian';
    centerColorClass = remainingBudget <= 0 ? 'text-rose-600' : 'text-emerald-600';
  } else if (chartMode === 'expense_category') {
    // Group day expenses by category
    const catMap = new Map<string, number>();
    dayExpenses.forEach((t) => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });

    slices = Array.from(catMap.entries()).map(([catId, sumAmount]) => {
      const catInfo = getCategoryById(catId);
      const pct = totalDayExpense > 0 ? (sumAmount / totalDayExpense) * 100 : 0;
      return {
        id: catId,
        label: catInfo.name,
        value: sumAmount,
        color: catInfo.color,
        percentage: pct,
        categoryInfo: catInfo,
      };
    });

    centerTitle = formatRupiah(totalDayExpense);
    centerSubtitle = 'Total Pengeluaran';
    centerColorClass = 'text-rose-600';
  } else {
    // Group day income by category
    const catMap = new Map<string, number>();
    dayIncomes.forEach((t) => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });

    slices = Array.from(catMap.entries()).map(([catId, sumAmount]) => {
      const catInfo = getCategoryById(catId);
      const pct = totalDayIncome > 0 ? (sumAmount / totalDayIncome) * 100 : 0;
      return {
        id: catId,
        label: catInfo.name,
        value: sumAmount,
        color: catInfo.color,
        percentage: pct,
        categoryInfo: catInfo,
      };
    });

    centerTitle = formatRupiah(totalDayIncome);
    centerSubtitle = 'Total Pemasukan';
    centerColorClass = 'text-emerald-600';
  }

  // Find biggest expense category
  let biggestExpenseCategory = '-';
  let biggestExpenseAmount = 0;
  if (dayExpenses.length > 0) {
    const expenseMap = new Map<string, number>();
    dayExpenses.forEach((t) => {
      expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount);
    });
    for (const [cat, amt] of expenseMap.entries()) {
      if (amt > biggestExpenseAmount) {
        biggestExpenseAmount = amt;
        biggestExpenseCategory = getCategoryById(cat).name;
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Visual Chart Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Visualisasi Diagram Lingkaran
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Analisis posisi keuangan: {formatIndonesianDate(selectedDate)}
            </span>
          </div>
        </div>

        {/* Chart View Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl mb-5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setChartMode('balance')}
            className={`flex-1 py-2 px-2 rounded-xl transition-all text-center ${
              chartMode === 'balance'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sisa Saldo Harian
          </button>
          <button
            type="button"
            onClick={() => setChartMode('expense_category')}
            className={`flex-1 py-2 px-2 rounded-xl transition-all text-center ${
              chartMode === 'expense_category'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kategori Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setChartMode('income_category')}
            className={`flex-1 py-2 px-2 rounded-xl transition-all text-center ${
              chartMode === 'income_category'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sumber Pemasukan
          </button>
        </div>

        {/* The Pie/Donut Chart */}
        <div className="py-2">
          <PieChart
            slices={slices}
            centerTitle={centerTitle}
            centerSubtitle={centerSubtitle}
            centerColorClass={centerColorClass}
            size={230}
            strokeWidth={34}
            emptyMessage={
              chartMode === 'balance'
                ? 'Belum ada transaksi di tanggal ini untuk menghitung sisa saldo.'
                : chartMode === 'expense_category'
                ? 'Tidak ada pengeluaran yang tercatat pada hari ini.'
                : 'Tidak ada pemasukan yang tercatat pada hari ini.'
            }
          />
        </div>
      </div>

      {/* Daily Financial Insight Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1.5">
            <TrendingDown size={16} className="text-rose-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Pengeluaran Utama
            </span>
          </div>
          <span className="text-sm font-bold text-slate-900 block truncate">
            {biggestExpenseCategory}
          </span>
          <span className="text-xs text-slate-500 tabular-nums">
            {biggestExpenseAmount > 0 ? formatRupiah(biggestExpenseAmount) : 'Rp 0'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1.5">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Arus Kas Bersih
            </span>
          </div>
          <span
            className={`text-sm font-bold block truncate tabular-nums ${
              netDayBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatRupiah(netDayBalance)}
          </span>
          <span className="text-xs text-slate-500">
            {netDayBalance >= 0 ? 'Surplus harian' : 'Defisit harian'}
          </span>
        </div>
      </div>
    </div>
  );
};
