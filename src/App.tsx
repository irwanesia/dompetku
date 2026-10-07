import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  PieChart as PieIcon,
  ListOrdered,
  FileSpreadsheet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Smartphone,
  Monitor,
  CheckCircle2,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  getInitialTransactions,
  getTodayDateString,
} from './types';
import { DailyBalanceCard } from './components/DailyBalanceCard';
import { DateSelector } from './components/DateSelector';
import { AnalyticsView } from './components/AnalyticsView';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { ExportModal } from './components/ExportModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { formatRupiah } from './utils/formatters';

const STORAGE_KEY = 'dompetku_transactions_v1';
const BUDGET_KEY = 'dompetku_daily_budget_v1';

export default function App() {
  // Persistence state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved transactions:', e);
    }
    return getInitialTransactions();
  });

  const [dailyBudgetLimit, setDailyBudgetLimit] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(BUDGET_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return 150000; // Rp 150.000 default daily budget limit
  });

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<'home' | 'analytics' | 'history' | 'export'>('home');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [viewMode, setViewMode] = useState<'daily' | 'all' | 'monthly'>('daily');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to save transactions:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_KEY, String(dailyBudgetLimit));
    } catch (e) {
      console.warn('Failed to save daily budget:', e);
    }
  }, [dailyBudgetLimit]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Dates with transactions for calendar indicator
  const datesWithTransactions = useMemo(() => {
    return new Set(transactions.map((t) => t.date));
  }, [transactions]);

  // Current filtered transactions based on viewMode & selectedDate
  const currentViewTransactions = useMemo(() => {
    if (viewMode === 'all') {
      return transactions;
    }
    if (viewMode === 'monthly') {
      const yearMonth = selectedDate.slice(0, 7);
      return transactions.filter((t) => t.date.startsWith(yearMonth));
    }
    // Daily mode
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, viewMode, selectedDate]);

  // Daily totals for the selected date
  const dayTotals = useMemo(() => {
    const dayTxs = transactions.filter((t) => t.date === selectedDate);
    const income = dayTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense };
  }, [transactions, selectedDate]);

  // Handler: Add new transaction
  const handleAddTransaction = (data: {
    type: TransactionType;
    amount: number;
    category: string;
    notes: string;
    date: string;
  }) => {
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      ...data,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    setSelectedDate(data.date);
    showToast(
      data.type === 'income'
        ? `Pemasukan ${formatRupiah(data.amount)} berhasil dicatat!`
        : `Pengeluaran ${formatRupiah(data.amount)} berhasil dicatat!`
    );
  };

  // Handler: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi telah dihapus.');
  };

  // Reset to initial demo data
  const handleResetDemoData = () => {
    if (window.confirm('Muat ulang data contoh transaksi? Data saat ini akan diganti dengan data demo.')) {
      setTransactions(getInitialTransactions());
      setSelectedDate(getTodayDateString());
      showToast('Data demo berhasil dimuat ulang.');
    }
  };

  const openAddModal = (type: TransactionType) => {
    setTransactionModalType(type);
    setIsTransactionModalOpen(true);
  };

  // Content for the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            {/* Top Balance Hero Card */}
            <DailyBalanceCard
              selectedDate={selectedDate}
              totalIncomeToday={dayTotals.income}
              totalExpenseToday={dayTotals.expense}
              dailyBudgetLimit={dailyBudgetLimit}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              onQuickAddIncome={() => openAddModal('income')}
              onQuickAddExpense={() => openAddModal('expense')}
            />

            {/* Date Scroller */}
            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithTransactions={datesWithTransactions}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Quick Pie Summary preview on Home */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PieIcon size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Sisa Saldo & Pengeluaran Harian
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Detail Diagram →
                </button>
              </div>

              <AnalyticsView
                transactions={transactions}
                selectedDate={selectedDate}
                dailyBudgetLimit={dailyBudgetLimit}
              />
            </div>

            {/* Transactions of Selected Day / Filter */}
            <TransactionList
              transactions={currentViewTransactions}
              onDeleteTransaction={handleDeleteTransaction}
              title={
                viewMode === 'daily'
                  ? 'Transaksi Tanggal Ini'
                  : viewMode === 'monthly'
                  ? 'Transaksi Bulan Ini'
                  : 'Semua Riwayat Transaksi'
              }
            />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-4">
            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithTransactions={datesWithTransactions}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <AnalyticsView
              transactions={transactions}
              selectedDate={selectedDate}
              dailyBudgetLimit={dailyBudgetLimit}
            />
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <DateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              datesWithTransactions={datesWithTransactions}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <TransactionList
              transactions={currentViewTransactions}
              onDeleteTransaction={handleDeleteTransaction}
              title="Semua Catatan Keuangan"
            />
          </div>
        );

      case 'export':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <FileSpreadsheet size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Ekspor Laporan Keuangan
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Ekspor semua catatan transaksi ke format CSV untuk dianalisis lebih lanjut di Microsoft Excel, Google Sheets, atau aplikasi pembukuan.
              </p>

              <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <FileSpreadsheet size={18} />
                  <span>Buka Konfigurasi Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Quick stats on export page */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Ikhtisar Database Keuangan
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Total Data Transaksi</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {transactions.length} baris
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-500 block">Target Harian Aktif</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">
                    {formatRupiah(dailyBudgetLimit)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">Reset ke data contoh:</span>
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Muat Ulang Demo</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 py-0 sm:py-6 flex flex-col items-center justify-start sm:justify-center">
      {/* Top Desktop Controls Bar (only visible on sm+ screens) */}
      <header className="hidden sm:flex items-center justify-between w-full max-w-4xl px-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Wallet size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              DompetKu
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">
              React Native Style · Budget Tracker & CSV
            </span>
          </div>
        </div>

        {/* Desktop View Switcher & Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            title="Ubah mode tampilan HP atau Layar Penuh"
          >
            {isPhoneFrame ? (
              <>
                <Monitor size={14} className="text-slate-500" />
                <span>Mode Dashboard Lebar</span>
              </>
            ) : (
              <>
                <Smartphone size={14} className="text-slate-500" />
                <span>Mode Mobile Phone Frame</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
          >
            <FileSpreadsheet size={14} />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </header>

      {/* Main Container: Mobile Frame or Fluid Responsive Dashboard */}
      <div
        className={`w-full transition-all duration-300 relative ${
          isPhoneFrame
            ? 'max-w-[440px] sm:rounded-[44px] sm:border-[10px] sm:border-slate-850 sm:shadow-2xl bg-white h-[100dvh] sm:h-[820px] sm:max-h-[890px] flex flex-col overflow-hidden ring-1 sm:ring-slate-700/20'
            : 'max-w-4xl bg-white sm:rounded-3xl border sm:border-slate-200/80 shadow-md h-[100dvh] sm:h-auto sm:min-h-screen flex flex-col overflow-hidden'
        }`}
      >
        {/* Mobile Device Status Bar (React Native feel) */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 border-b border-slate-100/80 flex items-center justify-between">
          {/* React Native Dynamic Island / Speaker Pill on mobile frame */}
          {isPhoneFrame && (
            <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-2.5 w-24 h-4 bg-slate-900 rounded-full" />
          )}

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              DK
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900">
              DompetKu
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => openAddModal('income')}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Tambah Pemasukan"
            >
              <ArrowDownLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => openAddModal('expense')}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
              title="Tambah Pengeluaran"
            >
              <ArrowUpRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title="Ekspor CSV"
            >
              <FileSpreadsheet size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Viewport */}
        <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 pb-24">
          {renderTabContent()}
        </main>

        {/* React Native Style Sticky Bottom Navigation Bar */}
        <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-md shrink-0">
          {/* Tab 1: Beranda */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              activeTab === 'home'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Wallet size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] mt-1 tracking-tight">Beranda</span>
          </button>

          {/* Tab 2: Diagram */}
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              activeTab === 'analytics'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <PieIcon size={20} className={activeTab === 'analytics' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] mt-1 tracking-tight">Diagram</span>
          </button>

          {/* Center Primary Action Button (FAB - Thumb Zone) */}
          <div className="relative -top-3">
            <button
              type="button"
              onClick={() => openAddModal('expense')}
              className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/25 hover:bg-slate-800 active:scale-95 transition-all"
              title="Tambah Transaksi Cepat"
            >
              <Plus size={24} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 3: Riwayat */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              activeTab === 'history'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <ListOrdered size={20} className={activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] mt-1 tracking-tight">Riwayat</span>
          </button>

          {/* Tab 4: Ekspor */}
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
              activeTab === 'export'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <FileSpreadsheet size={20} className={activeTab === 'export' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] mt-1 tracking-tight">Ekspor CSV</span>
          </button>
        </nav>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        defaultType={transactionModalType}
        defaultDate={selectedDate}
        onSave={handleAddTransaction}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        currentSelectedDate={selectedDate}
      />

      <BudgetSettingsModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={dailyBudgetLimit}
        onSaveBudget={(val) => {
          setDailyBudgetLimit(val);
          showToast(`Target anggaran harian diperbarui ke ${formatRupiah(val)}`);
        }}
      />
    </div>
  );
}
