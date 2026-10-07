import React, { useState } from 'react';
import { MONTHS, getMonthsRange } from '../data/initialData';
import { formatTokenNumber } from '../utils/formatters';
import { 
  Grid, 
  Wand2, 
  Sliders, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  X,
  Lock,
  Activity,
  Edit2,
  Download,
  Search,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';

export default function AllocationMatrix({
  theme,
  useCases,
  allocations,
  setAllocations,
  usage = {},
  setUsage,
  annualPool,
  role,
  selectedMonth,
  selectedYear,
  startMonth,
  endMonth,
  onAddTransaction
}) {
  const isDark = theme === 'dark';
  
  // Matrix Search & Filtering
  const [matrixSearch, setMatrixSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'FROZEN'

  // Matrix Cell Edit State: null | { ucId, month, field: 'alloc' | 'rem' }
  const [editingCell, setEditingCell] = useState(null);
  const [tempAllocValue, setTempAllocValue] = useState('');
  const [tempRemValue, setTempRemValue] = useState('');

  // Display View Mode: 'BOTH' | 'ALLOCATED' | 'REMAINDER'
  const [displayMode, setDisplayMode] = useState('BOTH');
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);

  // Active months based on fiscal date range
  const activeMonths = getMonthsRange(startMonth, endMonth);
  const currentMonthIdx = MONTHS.indexOf(selectedMonth);

  // Filter ACTIVE (unfrozen) use cases only
  const activeUseCases = useCases.filter(uc => !uc.isFrozen);

  // Filtered Use Cases for matrix rendering
  const filteredUseCases = useCases.filter(uc => {
    const matchesSearch = uc.name.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                          uc.code.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                          uc.category.toLowerCase().includes(matrixSearch.toLowerCase()) ||
                          uc.model.toLowerCase().includes(matrixSearch.toLowerCase());
    
    if (statusFilter === 'ACTIVE') return matchesSearch && !uc.isFrozen;
    if (statusFilter === 'FROZEN') return matchesSearch && uc.isFrozen;
    return matchesSearch;
  });

  // Year-scoped allocations & usage
  const currentYearAlloc = allocations[selectedYear] || {};
  const currentYearUsage = usage[selectedYear] || {};

  // Compute row totals and month totals for active year
  const rowAllocTotals = {};
  const rowRemTotals = {};
  const monthAllocTotals = {};
  const monthRemTotals = {};
  let globalAllocatedTotal = 0;
  let globalRemainderTotal = 0;

  MONTHS.forEach(m => { 
    monthAllocTotals[m] = 0;
    monthRemTotals[m] = 0; 
  });

  useCases.forEach(uc => {
    let ucAlloc = 0;
    let ucRem = 0;
    MONTHS.forEach(m => {
      const aVal = (currentYearAlloc[uc.id] && currentYearAlloc[uc.id][m]) || 0;
      const uVal = (currentYearUsage[uc.id] && currentYearUsage[uc.id][m]) || 0;
      const rVal = Math.max(0, aVal - uVal);
      ucAlloc += aVal;
      ucRem += rVal;
      monthAllocTotals[m] += aVal;
      monthRemTotals[m] += rVal;
    });
    rowAllocTotals[uc.id] = ucAlloc;
    rowRemTotals[uc.id] = ucRem;
    globalAllocatedTotal += ucAlloc;
    globalRemainderTotal += ucRem;
  });

  const remainingUnallocated = annualPool - globalAllocatedTotal;
  const isOverAllocated = globalAllocatedTotal > annualPool;

  // Save Allocated Cell Edit
  const handleSaveAllocCell = (ucId, month) => {
    const parsed = parseInt(tempAllocValue.replace(/,/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setAllocations(prev => ({
        ...prev,
        [selectedYear]: {
          ...(prev[selectedYear] || {}),
          [ucId]: {
            ...((prev[selectedYear] && prev[selectedYear][ucId]) || {}),
            [month]: parsed
          }
        }
      }));

      const targetUc = useCases.find(u => u.id === ucId);
      if (onAddTransaction) {
        onAddTransaction({
          id: `tx-${Date.now()}`,
          year: selectedYear,
          month: month,
          useCaseId: ucId,
          useCaseName: targetUc ? targetUc.name : 'AI Use Case',
          type: 'MONTHLY_ALLOCATION',
          amount: parsed,
          performedBy: 'System Admin',
          description: `Updated ${month} ${selectedYear} allocation to ${formatTokenNumber(parsed)} tokens.`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
      }
    }
    setEditingCell(null);
  };

  // Save Remainder Tokens Cell Edit (ALLOWED STRICTLY FOR CURRENT MONTH ONLY)
  const handleSaveRemCell = (ucId, month) => {
    const parsedRem = parseInt(tempRemValue.replace(/,/g, ''), 10);
    if (!isNaN(parsedRem) && parsedRem >= 0) {
      const currentAlloc = (currentYearAlloc[ucId] && currentYearAlloc[ucId][month]) || 0;
      const currentUsed = (currentYearUsage[ucId] && currentYearUsage[ucId][month]) || 0;
      
      const newAllocVal = currentUsed + parsedRem;
      const diffAlloc = newAllocVal - currentAlloc;

      if (diffAlloc > 0 && diffAlloc > remainingUnallocated) {
        alert(`Cannot set remainder to ${formatTokenNumber(parsedRem)} because allocating an extra ${formatTokenNumber(diffAlloc)} tokens exceeds the available Unallocated Pool (${formatTokenNumber(remainingUnallocated)}).`);
        setEditingCell(null);
        return;
      }

      setAllocations(prev => ({
        ...prev,
        [selectedYear]: {
          ...(prev[selectedYear] || {}),
          [ucId]: {
            ...((prev[selectedYear] && prev[selectedYear][ucId]) || {}),
            [month]: newAllocVal
          }
        }
      }));

      const targetUc = useCases.find(u => u.id === ucId);
      if (onAddTransaction) {
        onAddTransaction({
          id: `tx-${Date.now()}`,
          year: selectedYear,
          month: month,
          useCaseId: ucId,
          useCaseName: targetUc ? targetUc.name : 'AI Use Case',
          type: 'REMAINDER_ADJUSTMENT',
          amount: parsedRem,
          performedBy: 'System Admin',
          description: diffAlloc <= 0 
            ? `Updated ${month} ${selectedYear} remainder tokens for "${targetUc?.name}" to ${formatTokenNumber(parsedRem)}. Returned ${formatTokenNumber(Math.abs(diffAlloc))} unused tokens to Unallocated Pool.`
            : `Updated ${month} ${selectedYear} remainder tokens for "${targetUc?.name}" to ${formatTokenNumber(parsedRem)}. Allocated ${formatTokenNumber(diffAlloc)} additional tokens from Unallocated Pool.`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
      }
    }
    setEditingCell(null);
  };

  // Export Matrix to CSV
  const handleExportCSV = () => {
    const headers = ['Code', 'Use Case Name', 'Category', 'Model', 'Status', ...MONTHS.map(m => `${m} Allocated`), ...MONTHS.map(m => `${m} Remainder`), 'Total Allocated', 'Total Remainder'];
    const rows = useCases.map(uc => {
      const ucAlloc = MONTHS.map(m => (currentYearAlloc[uc.id] && currentYearAlloc[uc.id][m]) || 0);
      const ucRem = MONTHS.map(m => {
        const aVal = (currentYearAlloc[uc.id] && currentYearAlloc[uc.id][m]) || 0;
        const uVal = (currentYearUsage[uc.id] && currentYearUsage[uc.id][m]) || 0;
        return Math.max(0, aVal - uVal);
      });
      return [
        `"${uc.code}"`,
        `"${uc.name}"`,
        `"${uc.category}"`,
        `"${uc.model}"`,
        uc.isFrozen ? 'FROZEN' : 'ACTIVE',
        ...ucAlloc,
        ...ucRem,
        rowAllocTotals[uc.id] || 0,
        rowRemTotals[uc.id] || 0
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `STC_Allocation_Matrix_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Action: Distribute Equal Split
  const handleAutoEqualSplit = () => {
    const eligibleMonths = activeMonths.filter(m => MONTHS.indexOf(m) >= currentMonthIdx);
    if (eligibleMonths.length === 0) {
      alert("No available months in the contract cycle for distribution.");
      return;
    }

    if (activeUseCases.length === 0) {
      alert("No active (unfrozen) use cases available for token distribution.");
      return;
    }

    const newAllocYear = JSON.parse(JSON.stringify(currentYearAlloc));
    
    useCases.forEach(uc => {
      if (!newAllocYear[uc.id]) newAllocYear[uc.id] = {};
      if (uc.isFrozen) {
        eligibleMonths.forEach(m => {
          newAllocYear[uc.id][m] = 0;
        });
      } else {
        const targetYearly = (annualPool * (uc.sharePercentage / 100));
        const monthlyShare = Math.round(targetYearly / 12 / 1000) * 1000;
        eligibleMonths.forEach(m => {
          newAllocYear[uc.id][m] = monthlyShare;
        });
      }
    });

    setAllocations(prev => ({
      ...prev,
      [selectedYear]: newAllocYear
    }));
  };

  // Advanced Distribution Strategies
  const handleExecuteStrategy = (strategyType) => {
    if (remainingUnallocated <= 0) return;

    const eligibleMonths = activeMonths.filter(m => MONTHS.indexOf(m) >= currentMonthIdx);
    if (eligibleMonths.length === 0) {
      alert("No available months for token distribution.");
      return;
    }

    if (activeUseCases.length === 0) {
      alert("No active (unfrozen) use cases available for token distribution.");
      return;
    }

    setAllocations(prev => {
      const updatedYear = JSON.parse(JSON.stringify(prev[selectedYear] || {}));
      
      if (strategyType === 'EQUAL') {
        const totalSlots = activeUseCases.length * eligibleMonths.length;
        const addPerSlot = Math.floor(remainingUnallocated / totalSlots / 1000) * 1000;

        activeUseCases.forEach(uc => {
          if (!updatedYear[uc.id]) updatedYear[uc.id] = {};
          eligibleMonths.forEach(m => {
            updatedYear[uc.id][m] = (updatedYear[uc.id][m] || 0) + addPerSlot;
          });
        });
      } 
      else if (strategyType === 'PRIORITY') {
        const weights = {
          "Tier 1 - Critical": 0.45,
          "Tier 2 - High": 0.35,
          "Tier 3 - Medium": 0.20
        };

        activeUseCases.forEach(uc => {
          if (!updatedYear[uc.id]) updatedYear[uc.id] = {};
          const weight = weights[uc.priority] || 0.20;
          const ucAdditionTotal = remainingUnallocated * weight;
          const monthlyAddition = Math.floor(ucAdditionTotal / eligibleMonths.length / 1000) * 1000;

          eligibleMonths.forEach(m => {
            updatedYear[uc.id][m] = (updatedYear[uc.id][m] || 0) + monthlyAddition;
          });
        });
      }
      else if (strategyType === 'END_OF_YEAR') {
        const lastThreeMonths = eligibleMonths.slice(-3);
        if (lastThreeMonths.length > 0) {
          const totalSlots = activeUseCases.length * lastThreeMonths.length;
          const addPerSlot = Math.floor(remainingUnallocated / totalSlots / 1000) * 1000;

          activeUseCases.forEach(uc => {
            if (!updatedYear[uc.id]) updatedYear[uc.id] = {};
            lastThreeMonths.forEach(m => {
              updatedYear[uc.id][m] = (updatedYear[uc.id][m] || 0) + addPerSlot;
            });
          });
        }
      }

      return {
        ...prev,
        [selectedYear]: updatedYear
      };
    });

    setIsDistributeModalOpen(false);
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`glass-panel p-6 rounded-2xl mb-8 border shadow-xl ${
      isDark ? 'border-white/10' : 'border-slate-200 bg-white'
    }`}>
      
      {/* Matrix Header & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>
                {selectedYear} Allocation & Remainder Token Matrix
              </h2>
              <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fiscal Cycle: {startMonth} {selectedYear} to {endMonth} {selectedYear}</span>
              </div>
            </div>
          </div>
          <p className={`text-xs mt-1 ${textMuted}`}>
            Past months (<span className="font-semibold text-amber-600">Jan – {MONTHS[Math.max(0, currentMonthIdx - 1)]}</span>) locked. Current month (<strong className="text-purple-600">{selectedMonth}</strong>) remainder tokens editable; updates return unused quota to Unallocated Pool.
          </p>
        </div>

        {/* View Controls & Admin Tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Matrix Cell Display Mode Switcher */}
          <div className={`flex items-center border rounded-xl p-0.5 text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setDisplayMode('BOTH')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                displayMode === 'BOTH' ? 'bg-indigo-600 text-white shadow-xs' : textMuted
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setDisplayMode('ALLOCATED')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                displayMode === 'ALLOCATED' ? 'bg-indigo-600 text-white shadow-xs' : textMuted
              }`}
            >
              Allocated Only
            </button>
            <button
              onClick={() => setDisplayMode('REMAINDER')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer text-xs ${
                displayMode === 'REMAINDER' ? 'bg-indigo-600 text-white shadow-xs' : textMuted
              }`}
            >
              Remainder Only
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
            }`}
            title="Export Matrix to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          {/* Admin Auto Split */}
          {role === 'admin' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAutoEqualSplit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-600 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                title="Distribute evenly into current & future months for active use cases only"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Auto Split
              </button>

              <button
                onClick={() => setIsDistributeModalOpen(true)}
                disabled={remainingUnallocated <= 0}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  remainingUnallocated > 0
                    ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-600 border-purple-500/30 cursor-pointer shadow-xs'
                    : isDark 
                      ? 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Distribute Unallocated ({formatTokenNumber(Math.max(0, remainingUnallocated), true)})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Toolbar inside Matrix */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Filter matrix rows by name, code, or model..."
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg glass-input"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className={textMuted}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input py-1 px-2.5 text-xs rounded-lg font-medium"
          >
            <option value="ALL">All Use Cases ({useCases.length})</option>
            <option value="ACTIVE">Active Workloads ({activeUseCases.length})</option>
            <option value="FROZEN">Frozen Workloads ({useCases.length - activeUseCases.length})</option>
          </select>
        </div>
      </div>

      {/* Summary Bar */}
      <div className={`p-3 rounded-xl mb-4 border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isOverAllocated
          ? 'bg-red-500/10 border-red-500/30 text-red-600'
          : remainingUnallocated === 0
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600'
      }`}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {isOverAllocated ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>
              {selectedYear} Pool: <strong>{formatTokenNumber(annualPool)}</strong> | Allocated: <strong>{formatTokenNumber(globalAllocatedTotal)}</strong> ({((globalAllocatedTotal / annualPool) * 100).toFixed(1)}%)
            </span>
          </div>

          <span className="text-slate-400">|</span>

          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold">
            <Activity className="w-4 h-4 shrink-0" />
            <span>Total Remainder Tokens: <strong>{formatTokenNumber(globalRemainderTotal)}</strong></span>
          </div>
        </div>

        <div className="font-bold text-emerald-600 dark:text-emerald-400">
          Unallocated Pool: <strong>{formatTokenNumber(remainingUnallocated)}</strong>
        </div>
      </div>

      {/* Matrix Table */}
      <div className={`overflow-x-auto rounded-xl border ${
        isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-white'
      }`}>
        <table className="matrix-table text-xs">
          <thead>
            <tr>
              <th className={`sticky left-0 z-10 min-w-[210px] ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>Use Case</th>
              <th className="text-center min-w-[70px]">Share %</th>
              {MONTHS.map(m => {
                const isActiveMonth = activeMonths.includes(m);
                const isSelectedMonth = m === selectedMonth;
                const mIdx = MONTHS.indexOf(m);
                const isPastMonth = mIdx < currentMonthIdx;

                return (
                  <th 
                    key={m} 
                    className={`text-center min-w-[95px] ${
                      !isActiveMonth ? 'opacity-40 italic' : ''
                    } ${
                      isSelectedMonth 
                        ? isDark 
                          ? 'bg-indigo-950/90 text-indigo-300 font-bold border-x border-indigo-500/50' 
                          : 'bg-indigo-50 text-indigo-900 font-bold border-x border-indigo-300'
                        : isPastMonth ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {isPastMonth && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                      {isSelectedMonth && <Sparkles className="w-3 h-3 text-indigo-500 shrink-0 animate-pulse" />}
                      <span>{m}</span>
                    </div>
                  </th>
                );
              })}
              <th className={`text-right min-w-[130px] font-bold ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                Yearly Total (Alloc / Rem)
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUseCases.map(uc => {
              const ucAllocated = rowAllocTotals[uc.id] || 0;
              const ucRemainder = rowRemTotals[uc.id] || 0;

              return (
                <tr 
                  key={uc.id} 
                  className={`transition-colors ${
                    uc.isFrozen 
                      ? isDark ? 'bg-slate-900/40 opacity-60' : 'bg-slate-50 opacity-60'
                      : isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Sticky Use Case Label */}
                  <td className={`sticky left-0 z-10 font-medium ${
                    isDark ? 'bg-slate-950 border-r border-slate-800' : 'bg-white border-r border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: uc.color || '#6366F1' }}
                      />
                      <div>
                        <div className={`font-bold ${textPrimary} flex items-center gap-1.5`}>
                          <span>{uc.code}</span>
                          {uc.isFrozen && (
                            <span className="uui-badge uui-badge-error text-[9px] py-0 px-1">
                              FROZEN
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] truncate max-w-[170px] ${textMuted}`}>
                          {uc.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Target Share % */}
                  <td className="text-center font-mono text-slate-500">
                    {uc.isFrozen ? '0%' : `${uc.sharePercentage}%`}
                  </td>

                  {/* Monthly Cells */}
                  {MONTHS.map(m => {
                    const mIdx = MONTHS.indexOf(m);
                    const isPastMonth = mIdx < currentMonthIdx;
                    const isCurrentMonth = m === selectedMonth;
                    const isFutureMonth = mIdx > currentMonthIdx;

                    const allocVal = (currentYearAlloc[uc.id] && currentYearAlloc[uc.id][m]) || 0;
                    const usedVal = (currentYearUsage[uc.id] && currentYearUsage[uc.id][m]) || 0;
                    const remVal = Math.max(0, allocVal - usedVal);

                    const isEditingThisAlloc = editingCell?.ucId === uc.id && editingCell?.month === m && editingCell?.field === 'alloc';
                    const isEditingThisRem = editingCell?.ucId === uc.id && editingCell?.month === m && editingCell?.field === 'rem';

                    const canEditAlloc = role === 'admin' && isFutureMonth && !uc.isFrozen;
                    const canEditRem = role === 'admin' && isCurrentMonth && !uc.isFrozen;

                    return (
                      <td 
                        key={m}
                        className={`text-center transition-all ${
                          isCurrentMonth 
                            ? isDark 
                              ? 'bg-indigo-950/30 border-x border-indigo-500/30' 
                              : 'bg-indigo-50/50 border-x border-indigo-200'
                            : ''
                        }`}
                      >
                        <div className="space-y-1">
                          
                          {/* 1. Allocated Cell Value */}
                          {displayMode !== 'REMAINDER' && (
                            <div>
                              {isEditingThisAlloc ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="text"
                                    value={tempAllocValue}
                                    onChange={(e) => setTempAllocValue(e.target.value)}
                                    className="w-16 px-1 py-0.5 text-center text-xs font-mono font-bold rounded glass-input border-indigo-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveAllocCell(uc.id, m)}
                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingCell(null)}
                                    className="p-1 bg-slate-600 text-white rounded hover:bg-slate-700 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => {
                                    if (canEditAlloc) {
                                      setEditingCell({ ucId: uc.id, month: m, field: 'alloc' });
                                      setTempAllocValue(allocVal.toString());
                                    }
                                  }}
                                  className={`font-mono text-xs ${
                                    canEditAlloc 
                                      ? 'cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded font-bold transition-all'
                                      : 'p-1'
                                  } ${isPastMonth ? 'text-slate-400' : textPrimary}`}
                                  title={canEditAlloc ? "Click to edit allocation" : isPastMonth ? "Past month allocation locked" : ""}
                                >
                                  {formatTokenNumber(allocVal)}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. Remainder Tokens Cell Value */}
                          {displayMode !== 'ALLOCATED' && (
                            <div>
                              {isEditingThisRem ? (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="text"
                                      value={tempRemValue}
                                      onChange={(e) => setTempRemValue(e.target.value)}
                                      className="w-16 px-1 py-0.5 text-center text-xs font-mono font-bold rounded glass-input border-purple-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveRemCell(uc.id, m)}
                                      className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setEditingCell(null)}
                                      className="p-1 bg-slate-600 text-white rounded hover:bg-slate-700 cursor-pointer"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-semibold">
                                    Returns freed token to pool
                                  </span>
                                </div>
                              ) : (
                                <div 
                                  onClick={() => {
                                    if (canEditRem) {
                                      setEditingCell({ ucId: uc.id, month: m, field: 'rem' });
                                      setTempRemValue(remVal.toString());
                                    }
                                  }}
                                  className={`font-mono text-[11px] flex items-center justify-center gap-1 ${
                                    canEditRem 
                                      ? 'cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold p-1 rounded border border-purple-500/30 transition-all'
                                      : 'p-1 text-emerald-600 dark:text-emerald-400'
                                  }`}
                                  title={canEditRem ? "Click to adjust Remainder Tokens for Current Month (Reclaims unused tokens to Unallocated Pool)" : ""}
                                >
                                  <span>Rem: {formatTokenNumber(remVal)}</span>
                                  {canEditRem && <Edit2 className="w-2.5 h-2.5 opacity-70" />}
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </td>
                    );
                  })}

                  {/* Yearly Total */}
                  <td className={`text-right font-mono font-bold ${
                    isDark ? 'bg-slate-950 border-l border-slate-800 text-indigo-300' : 'bg-slate-50 border-l border-slate-200 text-indigo-700'
                  }`}>
                    <div>Alloc: {formatTokenNumber(ucAllocated)}</div>
                    <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                      Rem: {formatTokenNumber(ucRemainder)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          
          {/* Totals Row */}
          <tfoot>
            <tr className={`font-bold border-t ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
            }`}>
              <td className={`sticky left-0 z-10 ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                Matrix Totals
              </td>
              <td className="text-center font-mono">100%</td>
              {MONTHS.map(m => (
                <td key={m} className="text-center font-mono text-[11px]">
                  <div>Alloc: {formatTokenNumber(monthAllocTotals[m], true)}</div>
                  <div className="text-emerald-600 dark:text-emerald-400">Rem: {formatTokenNumber(monthRemTotals[m], true)}</div>
                </td>
              ))}
              <td className="text-right font-mono">
                <div>Alloc: {formatTokenNumber(globalAllocatedTotal, true)}</div>
                <div className="text-emerald-600 dark:text-emerald-400">Rem: {formatTokenNumber(globalRemainderTotal, true)}</div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Distribution Modal */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-2xl border p-6 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" /> Distribute Unallocated Tokens
              </h3>
              <button 
                onClick={() => setIsDistributeModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Available Unallocated Pool: <strong className="text-emerald-500 font-mono">{formatTokenNumber(remainingUnallocated)} tokens</strong>.
              Select an automated strategy to distribute these tokens among active (unfrozen) use cases in current & future months:
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleExecuteStrategy('EQUAL')}
                className="w-full text-left p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-indigo-600 dark:text-indigo-400 mb-1">
                  1. Equal Distribution Strategy
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Splits remaining pool evenly across all active use cases and remaining months.
                </div>
              </button>

              <button
                onClick={() => handleExecuteStrategy('PRIORITY')}
                className="w-full text-left p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-purple-600 dark:text-purple-400 mb-1">
                  2. Priority-Weighted Strategy
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Allocates 45% to Tier 1 Critical, 35% to Tier 2 High, and 20% to Tier 3 Medium workloads.
                </div>
              </button>

              <button
                onClick={() => handleExecuteStrategy('END_OF_YEAR')}
                className="w-full text-left p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <div className="font-bold text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                  3. Q4 Sprint Acceleration Strategy
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Concentrates the unallocated pool into the final 3 months of the contract year.
                </div>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsDistributeModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
