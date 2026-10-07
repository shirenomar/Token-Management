import React, { useState } from 'react';
import AllocationMatrix from './AllocationMatrix';
import DistributeSidePanel from './DistributeSidePanel';
import { formatTokenNumber } from '../utils/formatters';
import { 
  Layers, 
  PlusCircle, 
  RotateCcw, 
  Calendar, 
  Sliders, 
  ArrowLeft,
  Eye,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronRight
} from 'lucide-react';

export default function YearPoolGovernance({
  theme,
  yearlyPools,
  setYearlyPools,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  role,
  useCases,
  allocations,
  setAllocations,
  usage,
  setUsage,
  onOpenCreateYearPool,
  onAddTransaction
}) {
  const isDark = theme === 'dark';
  
  // View mode: 'LIST' (Master table of all Year Pools) | 'DETAILS' (Allocation matrix for selected Year Pool)
  const [viewMode, setViewMode] = useState('DETAILS');
  const [isDistributePanelOpen, setIsDistributePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reversal Modal state
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false);
  const [reversalUcId, setReversalUcId] = useState(useCases[0]?.id || 'uc-1');
  const [reversalMonth, setReversalMonth] = useState(selectedMonth);
  const [reversalAmount, setReversalAmount] = useState(50000);

  const currentPool = yearlyPools[selectedYear] || { total: 20000000, startMonth: "Jan", endMonth: "Dec" };
  const annualPool = currentPool.total;

  const yearAllocations = allocations[selectedYear] || {};
  const yearUsage = usage[selectedYear] || {};

  // Calculate unallocated tokens
  let totalAllocatedYearly = 0;
  useCases.forEach(uc => {
    Object.keys(yearAllocations[uc.id] || {}).forEach(m => {
      totalAllocatedYearly += yearAllocations[uc.id][m] || 0;
    });
  });
  const remainingUnallocated = annualPool - totalAllocatedYearly;

  const filteredYears = Object.keys(yearlyPools).filter(yr => 
    yr.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Execute Token Reversal
  const handleExecuteReversal = (e) => {
    e.preventDefault();
    const targetUc = useCases.find(u => u.id === reversalUcId);
    const currentVal = (yearAllocations[reversalUcId] && yearAllocations[reversalUcId][reversalMonth]) || 0;
    
    if (currentVal < reversalAmount) {
      alert(`Cannot reverse ${formatTokenNumber(reversalAmount)} tokens because "${targetUc?.name}" only has ${formatTokenNumber(currentVal)} allocated in ${reversalMonth}.`);
      return;
    }

    const newVal = currentVal - Number(reversalAmount);

    setAllocations(prev => ({
      ...prev,
      [selectedYear]: {
        ...(prev[selectedYear] || {}),
        [reversalUcId]: {
          ...((prev[selectedYear] && prev[selectedYear][reversalUcId]) || {}),
          [reversalMonth]: newVal
        }
      }
    }));

    if (onAddTransaction) {
      onAddTransaction({
        id: `tx-${Date.now()}`,
        year: selectedYear,
        month: reversalMonth,
        useCaseId: reversalUcId,
        useCaseName: targetUc ? targetUc.name : 'AI Use Case',
        type: 'REVERSAL_TO_UNALLOCATED',
        amount: -Number(reversalAmount),
        performedBy: 'System Admin',
        description: `Reversed ${formatTokenNumber(reversalAmount)} unused tokens from ${reversalMonth} back to ${selectedYear} Unallocated Pool.`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
      });
    }

    setIsReversalModalOpen(false);
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Mode Selector & Creator Trigger */}
      <div className={`glass-panel p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                Year Token Pools Governance
              </h2>
              <span className="uui-badge uui-badge-indigo">
                <span className="uui-badge-dot"></span>
                {Object.keys(yearlyPools).length} Defined Years
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${textMuted}`}>
              Authorize annual token pools, manage monthly allocation matrices & side-panel unallocated distribution
            </p>
          </div>
        </div>

        {/* View Controls & Action Triggers */}
        <div className="flex items-center gap-3">
          
          {/* View Toggle (Untitled UI Segmented Control) */}
          <div className={`flex items-center border rounded-xl p-1 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : textMuted
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('DETAILS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'DETAILS'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : textMuted
              }`}
            >
              Details View ({selectedYear})
            </button>
          </div>

          {/* Define New Year Pool */}
          {role === 'admin' && (
            <button
              onClick={onOpenCreateYearPool}
              className="uui-btn-primary flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Define New Year Pool
            </button>
          )}

        </div>
      </div>

      {/* VIEW 1: MASTER UNTITLED UI TABLE COMPOUND OF ALL YEAR POOLS */}
      {viewMode === 'LIST' ? (
        <div className={`glass-panel rounded-2xl border shadow-xs overflow-hidden ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
        }`}>
          
          {/* Table Compound Header Bar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${textPrimary}`}>Defined Year Token Pools</h3>
                <span className="uui-badge uui-badge-indigo">
                  <span className="uui-badge-dot"></span>
                  {Object.keys(yearlyPools).length} Pools
                </span>
              </div>
              <p className={`text-xs mt-1 ${textMuted}`}>
                Click on any year pool row to open its full allocation matrix & governance controls.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search year pool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input text-xs rounded-xl py-2 pl-9 pr-3 w-48 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="matrix-table text-xs">
              <thead>
                <tr>
                  <th className="min-w-[180px]">Year Pool</th>
                  <th className="min-w-[150px]">Fiscal Cycle</th>
                  <th className="min-w-[160px] text-right">Annual Token Pool</th>
                  <th className="min-w-[180px]">Allocation Progress</th>
                  <th className="min-w-[160px] text-right">Unallocated Balance</th>
                  <th className="min-w-[120px] text-center">Status</th>
                  <th className="min-w-[120px] text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredYears.map(yr => {
                  const pool = yearlyPools[yr];
                  const yrAlloc = allocations[yr] || {};
                  let allocatedSum = 0;
                  useCases.forEach(uc => {
                    Object.keys(yrAlloc[uc.id] || {}).forEach(m => allocatedSum += yrAlloc[uc.id][m] || 0);
                  });
                  const unallocatedSum = pool.total - allocatedSum;
                  const isSelected = yr === selectedYear;
                  const allocPct = Math.min(100, Math.round((allocatedSum / pool.total) * 100));

                  return (
                    <tr 
                      key={yr}
                      onClick={() => {
                        setSelectedYear(yr);
                        setViewMode('DETAILS');
                      }}
                      className={`transition-colors cursor-pointer group ${
                        isSelected 
                          ? isDark ? 'bg-indigo-950/40' : 'bg-indigo-50/60' 
                          : ''
                      }`}
                    >
                      {/* Year Name */}
                      <td className="py-4 font-bold text-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected 
                              ? 'bg-indigo-600 text-white shadow-xs' 
                              : isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {yr.slice(2)}
                          </div>
                          <div>
                            <div className={`font-bold ${textPrimary} text-sm group-hover:text-indigo-600 transition-colors`}>
                              Year {yr} Pool
                            </div>
                            <div className={`text-[11px] ${textMuted}`}>Fiscal Year {yr}</div>
                          </div>
                        </div>
                      </td>

                      {/* Fiscal Cycle */}
                      <td>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{pool.startMonth} – {pool.endMonth} Cycle</span>
                        </div>
                      </td>

                      {/* Annual Token Pool */}
                      <td className="text-right font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {formatTokenNumber(pool.total, true)}
                      </td>

                      {/* Allocation Progress Bar */}
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={textMuted}>Allocated:</span>
                            <strong className="font-mono text-indigo-600 dark:text-indigo-400">{formatTokenNumber(allocatedSum, true)} ({allocPct}%)</strong>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-1.5 rounded-full transition-all"
                              style={{ width: `${allocPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Unallocated Balance */}
                      <td className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatTokenNumber(unallocatedSum, true)}
                      </td>

                      {/* Status Pill Badge */}
                      <td className="text-center">
                        <span className={`uui-badge ${
                          isSelected ? 'uui-badge-indigo' : 'uui-badge-gray'
                        }`}>
                          <span className="uui-badge-dot"></span>
                          {isSelected ? 'Active Pool' : 'Standard Pool'}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="text-right pr-6">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-all">
                          Open Matrix <ChevronRight className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing {filteredYears.length} of {Object.keys(yearlyPools).length} year pools</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Click any row to inspect matrix details</span>
          </div>

        </div>
      ) : (
        /* VIEW 2: DETAILS VIEW (ALLOCATION MATRIX FOR SELECTED YEAR) */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${textMuted} hover:text-indigo-600`}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Year Pools Master List
            </button>

            {role === 'admin' && (
              <div className="flex items-center gap-2">
                {/* Trigger Distribute Side Panel */}
                <button
                  onClick={() => setIsDistributePanelOpen(true)}
                  disabled={remainingUnallocated <= 0}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    remainingUnallocated > 0
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md cursor-pointer'
                      : 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Sliders className="w-4 h-4" /> Open Unallocated Distribution Side Panel
                </button>

                {/* Trigger Reversal Modal */}
                <button
                  onClick={() => setIsReversalModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-600 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Reverse Unused Tokens
                </button>
              </div>
            )}
          </div>

          <AllocationMatrix
            theme={theme}
            useCases={useCases}
            allocations={allocations}
            setAllocations={setAllocations}
            usage={usage}
            setUsage={setUsage}
            annualPool={annualPool}
            role={role}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            startMonth={currentPool.startMonth}
            endMonth={currentPool.endMonth}
            onAddTransaction={onAddTransaction}
          />
        </div>
      )}

      {/* Unallocated Token Side Panel */}
      <DistributeSidePanel
        theme={theme}
        isOpen={isDistributePanelOpen}
        onClose={() => setIsDistributePanelOpen(false)}
        useCases={useCases}
        allocations={allocations}
        setAllocations={setAllocations}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        startMonth={currentPool.startMonth}
        endMonth={currentPool.endMonth}
        remainingUnallocated={remainingUnallocated}
        onAddTransaction={onAddTransaction}
      />

      {/* Reversal of Unused Tokens Modal */}
      {isReversalModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
          isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
        }`}>
          <div className={`glass-panel w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
            isDark ? 'border-white/10' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-white/10">
              <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                <RotateCcw className="w-5 h-5 text-amber-500" />
                Reverse Unused Tokens to Unallocated Pool
              </h3>
            </div>

            <form onSubmit={handleExecuteReversal} className="space-y-4 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${textPrimary}`}>Target Use Case</label>
                <select
                  value={reversalUcId}
                  onChange={(e) => setReversalUcId(e.target.value)}
                  className="w-full glass-input text-xs rounded-lg py-2 px-3"
                >
                  {useCases.map(uc => (
                    <option key={uc.id} value={uc.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {uc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${textPrimary}`}>Month</label>
                  <select
                    value={reversalMonth}
                    onChange={(e) => setReversalMonth(e.target.value)}
                    className="w-full glass-input text-xs rounded-lg py-2 px-3 font-semibold"
                  >
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                      <option key={m} value={m} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 ${textPrimary}`}>Reversal Amount</label>
                  <input
                    type="number"
                    step="25000"
                    min="10000"
                    value={reversalAmount}
                    onChange={(e) => setReversalAmount(e.target.value)}
                    className="w-full glass-input text-xs rounded-lg py-2 px-3 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsReversalModalOpen(false)}
                  className={`px-3 py-1.5 rounded-lg border font-semibold ${textMuted}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Execute Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
