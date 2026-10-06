import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { formatShortDate, getShortDayName } from '../utils/formatters';
import { getTodayDateString } from '../types';

interface DateSelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  datesWithTransactions: Set<string>;
  viewMode: 'daily' | 'all' | 'monthly';
  onViewModeChange: (mode: 'daily' | 'all' | 'monthly') => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelectDate,
  datesWithTransactions,
  viewMode,
  onViewModeChange,
}) => {
  const todayStr = getTodayDateString();

  // Generate last 10 days for rapid scroller
  const dateList = React.useMemo(() => {
    const list: string[] = [];
    const base = new Date();
    // 3 days ahead, today, and 10 days behind
    for (let i = 2; i >= -7; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      list.push(`${y}-${m}-${day}`);
    }
    return list;
  }, []);

  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    onSelectDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    onSelectDate(`${newY}-${newM}-${newD}`);
  };

  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs mb-4">
      {/* Top Filter Tabs: Harian / Bulan Ini / Semua */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => onViewModeChange('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'daily'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Harian
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('monthly')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
        </div>

        {viewMode === 'daily' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => onSelectDate(todayStr)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                selectedDate === todayStr
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Day Carousel when in daily mode */}
      {viewMode === 'daily' && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {dateList.map((dStr) => {
            const isSelected = selectedDate === dStr;
            const isToday = dStr === todayStr;
            const hasActivity = datesWithTransactions.has(dStr);
            const [, , dayNum] = dStr.split('-');
            const dayName = getShortDayName(dStr);

            return (
              <button
                key={dStr}
                type="button"
                onClick={() => onSelectDate(dStr)}
                className={`flex flex-col items-center justify-center min-w-[50px] py-2 px-1 rounded-xl transition-all relative ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm scale-102 font-medium'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {isToday ? 'Hari Ini' : dayName}
                </span>
                <span className={`text-sm font-bold mt-0.5 tabular-nums ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {dayNum}
                </span>

                {/* Activity indicator dot */}
                {hasActivity && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-emerald-400' : 'bg-emerald-500'
                    }`}
                  />
                )}
                {!hasActivity && <span className="w-1.5 h-1.5 mt-1 opacity-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
