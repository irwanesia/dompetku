import React, { useState } from 'react';
import { formatRupiah } from '../utils/formatters';
import { CategoryInfo, getCategoryById } from '../types';

export interface PieSlice {
  id: string;
  label: string;
  value: number;
  color: string;
  percentage: number;
  icon?: string;
  categoryInfo?: CategoryInfo;
}

interface PieChartProps {
  slices: PieSlice[];
  centerTitle: string;
  centerSubtitle: string;
  centerColorClass?: string;
  size?: number;
  strokeWidth?: number;
  onSliceClick?: (slice: PieSlice) => void;
  emptyMessage?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  slices,
  centerTitle,
  centerSubtitle,
  centerColorClass = 'text-slate-900',
  size = 240,
  strokeWidth = 34,
  emptyMessage = 'Belum ada data untuk hari ini',
}) => {
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const totalValue = slices.reduce((acc, s) => acc + Math.max(0, s.value), 0);

  if (totalValue <= 0 || slices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          {/* Subtle empty ring */}
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              strokeDasharray="4 6"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            <span className="text-xs text-slate-400 font-medium">Data Kosong</span>
            <span className="text-sm font-semibold text-slate-600 mt-0.5">Rp 0</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 max-w-[200px]">{emptyMessage}</p>
      </div>
    );
  }

  // Calculate SVG strokeDashoffset and strokeDasharray for each slice
  let accumulatedAngle = 0;
  const renderedSlices = slices.map((slice) => {
    const fraction = totalValue > 0 ? slice.value / totalValue : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;

    return {
      ...slice,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = hoveredSliceId
    ? slices.find((s) => s.id === hoveredSliceId)
    : null;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-xs"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {renderedSlices.map((slice) => {
            const isHovered = hoveredSliceId === slice.id;
            return (
              <circle
                key={slice.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer origin-center"
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredSliceId(slice.id)}
                onMouseLeave={() => setHoveredSliceId(null)}
                onClick={() => setHoveredSliceId(hoveredSliceId === slice.id ? null : slice.id)}
              />
            );
          })}
        </svg>

        {/* Center Readout with dynamic interactive hover detail */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-6">
          {activeSlice ? (
            <div className="animate-in fade-in duration-200">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                {activeSlice.label}
              </span>
              <span className="text-lg font-bold text-slate-900 tracking-tight block tabular-nums">
                {formatRupiah(activeSlice.value)}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                {activeSlice.percentage.toFixed(1)}%
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                {centerSubtitle}
              </span>
              <span className={`text-xl font-bold tracking-tight block tabular-nums ${centerColorClass}`}>
                {centerTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Slices Legend */}
      <div className="w-full mt-4 grid grid-cols-2 gap-2 text-xs">
        {slices.map((slice) => {
          const isSelected = hoveredSliceId === slice.id;
          return (
            <button
              key={slice.id}
              type="button"
              onClick={() => setHoveredSliceId(hoveredSliceId === slice.id ? null : slice.id)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all text-left ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="font-medium truncate">{slice.label}</span>
              </div>
              <div className="text-right shrink-0">
                <span className={`font-semibold tabular-nums block ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {slice.percentage.toFixed(0)}%
                </span>
                <span className={`text-[10px] tabular-nums block ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {formatRupiah(slice.value)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
