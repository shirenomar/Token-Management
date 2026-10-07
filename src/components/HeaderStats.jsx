import React from 'react';
import { 
  Coins, 
  Calendar, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  ArrowUpRight,
  DollarSign,
  Zap,
  Info,
  Layers,
  PieChart
} from 'lucide-react';
import { formatTokenNumber, getStatusBadge } from '../utils/formatters';

export default function HeaderStats({
  theme,
  totals,
  annualPool,
  selectedMonth,
  useCases,
  usage,
  allocations
}) {
  const isDark = theme === 'dark';
  const monthStatus = getStatusBadge(totals.selectedMonthPercent);

  // Estimated Cost Calculation ($0.0025 per 1,000 tokens benchmark for Gemini 1.5 / Claude 3.5 mix)
  const COST_PER_1K_TOKENS = 0.0025;
  const estimatedMonthCost = (totals.selectedMonthConsumed / 1000) * COST_PER_1K_TOKENS;
  const estimatedAnnualCost = (annualPool / 1000) * COST_PER_1K_TOKENS;

  // Find top consuming AI Use Case
  let topConsumer = null;
  let topConsumerAmount = -1;

  useCases.forEach(uc => {
    const consumed = (usage[uc.id] && usage[uc.id][selectedMonth]) || 0;
    if (consumed > topConsumerAmount) {
      topConsumerAmount = consumed;
      topConsumer = uc;
    }
  });

  const activeCount = useCases.filter(u => !u.isFrozen).length;
  const frozenCount = useCases.filter(u => u.isFrozen).length;

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const bgTrack = isDark ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Annual Budget Pool */}
      <div className={`glass-panel p-5 rounded-2xl border transition-all relative overflow-hidden group ${
        isDark ? 'bg-slate-900/80 border-white/10 hover:border-indigo-500/40' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
            Annual Token Budget
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold tracking-tight ${textPrimary}`}>
              {formatTokenNumber(annualPool, true)}
            </span>
            <span className={`text-xs font-semibold ${textMuted}`}>/yr</span>
          </div>
          <span className="uui-badge uui-badge-indigo">
            <span className="uui-badge-dot"></span>
            ${(estimatedAnnualCost / 1000).toFixed(1)}k Est.
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className={`flex justify-between font-medium ${textMuted}`}>
            <span>Allocated: <strong className={textPrimary}>{formatTokenNumber(totals.totalAllocatedYearly, true)}</strong></span>
            <span>Unallocated: <strong className="text-emerald-600 dark:text-emerald-400">{formatTokenNumber(annualPool - totals.totalAllocatedYearly, true)}</strong></span>
          </div>
          <div className={`w-full ${bgTrack} rounded-full h-2 overflow-hidden`}>
            <div 
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totals.totalAllocatedYearly / annualPool) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. Selected Month Budget & Remainder */}
      <div className={`glass-panel p-5 rounded-2xl border transition-all relative overflow-hidden group ${
        isDark ? 'bg-slate-900/80 border-white/10 hover:border-purple-500/40' : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
            {selectedMonth} Budget & Remainder
          </span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex items-baseline justify-between mb-3">
          <span className={`text-2xl font-extrabold tracking-tight ${textPrimary}`}>
            {formatTokenNumber(totals.selectedMonthAllocated, true)}
          </span>
          <span className={`uui-badge ${
            totals.selectedMonthPercent > 90 ? 'uui-badge-error' : totals.selectedMonthPercent > 75 ? 'uui-badge-warning' : 'uui-badge-success'
          }`}>
            <span className="uui-badge-dot"></span>
            {totals.selectedMonthPercent}% Consumed
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className={`flex justify-between font-medium ${textMuted}`}>
            <span>Consumed: <strong className={textPrimary}>{formatTokenNumber(totals.selectedMonthConsumed, true)}</strong></span>
            <span>Remainder: <strong className="text-emerald-600 dark:text-emerald-400">{formatTokenNumber(totals.selectedMonthRemaining, true)}</strong></span>
          </div>
          <div className={`w-full ${bgTrack} rounded-full h-2 overflow-hidden`}>
            <div 
              className={`${monthStatus.progressClass} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${totals.selectedMonthPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. AI Workloads & Governance Status */}
      <div className={`glass-panel p-5 rounded-2xl border transition-all relative overflow-hidden group ${
        isDark ? 'bg-slate-900/80 border-white/10 hover:border-emerald-500/40' : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
            Workload Governance
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold tracking-tight ${textPrimary}`}>
              {activeCount} Active
            </span>
            {frozenCount > 0 && (
              <span className="text-xs font-semibold text-rose-500">({frozenCount} Frozen)</span>
            )}
          </div>
          <span className="uui-badge uui-badge-success">
            <span className="uui-badge-dot"></span>
            SLAs Healthy
          </span>
        </div>

        <div className={`text-xs ${textMuted} truncate flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5`}>
          <span>Top Consumer ({selectedMonth}):</span>
          <strong className="text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[110px]">
            {topConsumer ? topConsumer.name : 'N/A'}
          </strong>
        </div>
      </div>

      {/* 4. Estimated Financial Spend ($) */}
      <div className={`glass-panel p-5 rounded-2xl border transition-all relative overflow-hidden group ${
        isDark ? 'bg-slate-900/80 border-white/10 hover:border-blue-500/40' : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${textMuted}`}>
            {selectedMonth} Cost Est. ($)
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-extrabold tracking-tight ${textPrimary}`}>
              ${estimatedMonthCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="uui-badge uui-badge-indigo">
            <span className="uui-badge-dot"></span>
            FinOps Benchmark
          </span>
        </div>

        <div className={`flex items-center justify-between text-xs ${textMuted} pt-1 border-t border-slate-100 dark:border-white/5`}>
          <span>Token Rate:</span>
          <span className="text-slate-900 dark:text-white font-mono text-[11px]">
            ~$0.0025 / 1k Tokens
          </span>
        </div>
      </div>

    </div>
  );
}
