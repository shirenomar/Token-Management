import React, { useState } from 'react';
import { X, Sliders, Calendar, Check, AlertCircle, Sparkles, Percent, Hash, Lock } from 'lucide-react';
import { MONTHS, getMonthsRange } from '../data/initialData';
import { formatTokenNumber } from '../utils/formatters';

export default function DistributeSidePanel({
  theme,
  isOpen,
  onClose,
  useCases,
  allocations,
  setAllocations,
  selectedYear,
  selectedMonth,
  startMonth,
  endMonth,
  remainingUnallocated,
  onAddTransaction
}) {
  const isDark = theme === 'dark';
  const activeMonths = getMonthsRange(startMonth, endMonth);
  const currentMonthIdx = MONTHS.indexOf(selectedMonth);

  // Available distribution months (current month + future months)
  const availableMonths = activeMonths.filter(m => MONTHS.indexOf(m) >= currentMonthIdx);

  // Timing mode: 'CURRENT_MONTH' | 'REMAINDER_MONTHS' | 'CUSTOM_FUTURE'
  const [timingMode, setTimingMode] = useState('CURRENT_MONTH');
  const [selectedCustomMonths, setSelectedCustomMonths] = useState([selectedMonth]);

  // Distribution Mode: 'PERCENT' | 'TOKEN_COUNT'
  const [distMode, setDistMode] = useState('PERCENT');

  const activeUseCases = useCases.filter(uc => !uc.isFrozen);
  const frozenUseCases = useCases.filter(uc => uc.isFrozen);

  const [ucInputs, setUcInputs] = useState(() => {
    const initial = {};
    activeUseCases.forEach(uc => {
      initial[uc.id] = distMode === 'PERCENT' ? uc.sharePercentage : 0;
    });
    return initial;
  });

  if (!isOpen) return null;

  // Target months for distribution (CURRENT & FUTURE MONTHS)
  let targetMonths = [];
  if (timingMode === 'CURRENT_MONTH') {
    targetMonths = [selectedMonth];
  } else if (timingMode === 'REMAINDER_MONTHS') {
    targetMonths = availableMonths;
  } else {
    targetMonths = selectedCustomMonths.filter(m => MONTHS.indexOf(m) >= currentMonthIdx);
  }

  const handleInputChange = (ucId, val) => {
    const num = Number(val);
    setUcInputs(prev => ({
      ...prev,
      [ucId]: num
    }));
  };

  let totalDistributed = 0;
  if (distMode === 'PERCENT') {
    let totalPct = 0;
    activeUseCases.forEach(uc => {
      totalPct += Number(ucInputs[uc.id] || 0);
    });
    totalDistributed = Math.round((remainingUnallocated * totalPct) / 100);
  } else {
    let totalPerMonth = 0;
    activeUseCases.forEach(uc => {
      totalPerMonth += Number(ucInputs[uc.id] || 0);
    });
    totalDistributed = totalPerMonth * targetMonths.length;
  }

  const isOverAllocated = totalDistributed > remainingUnallocated;

  const handleExecuteDistribution = (e) => {
    e.preventDefault();
    if (activeUseCases.length === 0) {
      alert("No active (unfrozen) use cases available for token distribution.");
      return;
    }
    if (isOverAllocated) {
      alert(`Cannot distribute ${formatTokenNumber(totalDistributed)} tokens because it exceeds the unallocated pool of ${formatTokenNumber(remainingUnallocated)}.`);
      return;
    }
    if (targetMonths.length === 0) {
      alert("Please select at least one month for distribution.");
      return;
    }

    setAllocations(prev => {
      const yearAlloc = JSON.parse(JSON.stringify(prev[selectedYear] || {}));

      // Distribute ONLY to active (unfrozen) use cases
      activeUseCases.forEach(uc => {
        if (!yearAlloc[uc.id]) yearAlloc[uc.id] = {};
        
        let additionPerMonth = 0;
        if (distMode === 'PERCENT') {
          const pct = Number(ucInputs[uc.id] || 0);
          const ucTotalGrant = Math.round((remainingUnallocated * pct) / 100);
          additionPerMonth = Math.floor(ucTotalGrant / targetMonths.length / 1000) * 1000;
        } else {
          additionPerMonth = Number(ucInputs[uc.id] || 0);
        }

        targetMonths.forEach(m => {
          yearAlloc[uc.id][m] = (yearAlloc[uc.id][m] || 0) + additionPerMonth;
        });
      });

      // Explicitly lock future/current months for frozen use cases to 0
      frozenUseCases.forEach(uc => {
        if (!yearAlloc[uc.id]) yearAlloc[uc.id] = {};
        targetMonths.forEach(m => {
          yearAlloc[uc.id][m] = 0;
        });
      });

      return {
        ...prev,
        [selectedYear]: yearAlloc
      };
    });

    if (onAddTransaction) {
      onAddTransaction({
        id: `tx-${Date.now()}`,
        year: selectedYear,
        month: targetMonths.join(','),
        useCaseId: 'ALL_ACTIVE',
        useCaseName: 'Active Use Cases',
        type: 'UNALLOCATED_DISTRIBUTION',
        amount: totalDistributed,
        performedBy: 'System Admin',
        description: `Distributed ${formatTokenNumber(totalDistributed)} unallocated tokens into target months (${targetMonths.join(', ')}) for active use cases.`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
      });
    }

    onClose();
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const panelBg = isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      
      {/* Side Panel Drawer */}
      <div className={`w-full max-w-lg h-full border-l flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200 ${panelBg}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
          <div>
            <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <Sliders className="w-5 h-5 text-indigo-500" />
              Distribute Unallocated Tokens ({selectedMonth} & Future)
            </h3>
            <p className={`text-xs ${textMuted}`}>
              Past months (<span className="font-semibold text-amber-600">Jan – {MONTHS[Math.max(0, currentMonthIdx - 1)] || 'Jan'}</span>) & Frozen use cases are locked. Current month (<span className="font-semibold text-indigo-600">{selectedMonth}</span>) is OPEN for distribution.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unallocated Pool Counter */}
        <div className={`p-3.5 rounded-xl border mb-5 flex items-center justify-between text-xs ${
          isDark ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
        }`}>
          <div>
            <div className={`text-[10px] uppercase font-bold tracking-wider ${textMuted}`}>Available Unallocated Pool</div>
            <div className="text-lg font-black text-indigo-600 font-mono">
              {formatTokenNumber(remainingUnallocated)} Tokens
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>

        {activeUseCases.length === 0 ? (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>All use cases are currently frozen. Unfreeze at least one use case to distribute unallocated tokens.</span>
          </div>
        ) : (
          <form onSubmit={handleExecuteDistribution} className="space-y-5 flex-1 flex flex-col justify-between text-xs">
            <div className="space-y-5">
              
              {/* 1. Timing Period Selector */}
              <div>
                <label className={`block font-bold mb-2 ${textPrimary}`}>
                  1. Select Target Distribution Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTimingMode('CURRENT_MONTH')}
                    className={`py-2 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      timingMode === 'CURRENT_MONTH'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Current Month ({selectedMonth})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimingMode('REMAINDER_MONTHS')}
                    className={`py-2 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      timingMode === 'REMAINDER_MONTHS'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Current & Future ({availableMonths.length} Mo)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimingMode('CUSTOM_FUTURE')}
                    className={`py-2 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      timingMode === 'CUSTOM_FUTURE'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Custom Months
                  </button>
                </div>

                {/* Custom Months Checkboxes */}
                {timingMode === 'CUSTOM_FUTURE' && (
                  <div className="mt-3 p-3 rounded-xl border grid grid-cols-4 gap-2 border-slate-200 dark:border-white/10">
                    {MONTHS.map((m, idx) => {
                      const isPastMonth = idx < currentMonthIdx;
                      const isChecked = selectedCustomMonths.includes(m);

                      return (
                        <label key={m} className={`flex items-center gap-1.5 text-[11px] ${
                          isPastMonth ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}>
                          <input
                            type="checkbox"
                            disabled={isPastMonth}
                            checked={!isPastMonth && isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedCustomMonths(prev => prev.filter(item => item !== m));
                              } else {
                                setSelectedCustomMonths(prev => [...prev, m]);
                              }
                            }}
                            className="accent-indigo-600"
                          />
                          <span className={isChecked && !isPastMonth ? 'font-bold text-indigo-600' : textMuted}>
                            {m} {isPastMonth && '🔒'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Allocation Method Selector */}
              <div>
                <label className={`block font-bold mb-2 ${textPrimary}`}>
                  2. Select Allocation Input Method
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDistMode('PERCENT');
                      const initial = {};
                      activeUseCases.forEach(uc => initial[uc.id] = uc.sharePercentage);
                      setUcInputs(initial);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      distMode === 'PERCENT'
                        ? 'bg-purple-600 text-white border-purple-600 shadow'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" /> Percentage (%)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDistMode('TOKEN_COUNT');
                      const initial = {};
                      activeUseCases.forEach(uc => initial[uc.id] = 50000);
                      setUcInputs(initial);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      distMode === 'TOKEN_COUNT'
                        ? 'bg-purple-600 text-white border-purple-600 shadow'
                        : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" /> Token Amount per UC
                  </button>
                </div>
              </div>

              {/* 3. Inputs per Active Use Case */}
              <div>
                <label className={`block font-bold mb-2 ${textPrimary}`}>
                  3. Define Distribution values for Active Use Cases
                </label>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {activeUseCases.map(uc => {
                    return (
                      <div key={uc.id} className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: uc.color }}></span>
                          <span className={`font-semibold text-xs ${textPrimary}`}>{uc.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            step={distMode === 'PERCENT' ? '1' : '10000'}
                            min="0"
                            value={ucInputs[uc.id] || 0}
                            onChange={(e) => handleInputChange(uc.id, e.target.value)}
                            className="w-24 text-right glass-input text-xs rounded-lg py-1 px-2 font-mono font-bold"
                          />
                          <span className={`font-mono font-bold text-xs ${textMuted}`}>
                            {distMode === 'PERCENT' ? '%' : 'tokens'}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Frozen Use Cases (Excluded Banner) */}
                  {frozenUseCases.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-3">
                      <div className="text-[11px] font-bold text-red-500 flex items-center gap-1 mb-2">
                        <Lock className="w-3.5 h-3.5" /> Frozen Use Cases (Excluded from Distribution)
                      </div>
                      <div className="space-y-2 opacity-60">
                        {frozenUseCases.map(uc => (
                          <div key={uc.id} className="p-2.5 rounded-xl border flex items-center justify-between gap-3 bg-red-500/5 border-red-500/20">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: uc.color }}></span>
                              <span className={`font-semibold text-xs ${textPrimary}`}>{uc.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 text-red-500 font-bold text-xs">
                              <span>🔒 Frozen (0 tokens)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Calculation Bar */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                isOverAllocated
                  ? 'bg-red-500/10 border-red-500/30 text-red-600'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
              }`}>
                <span>Total to Distribute: <strong>{formatTokenNumber(totalDistributed)}</strong></span>
                <span>
                  {isOverAllocated ? 'EXCEEDS UNALLOCATED POOL!' : `Remaining: ${formatTokenNumber(remainingUnallocated - totalDistributed)}`}
                </span>
              </div>

            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl border font-bold ${textMuted}`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isOverAllocated || totalDistributed === 0}
                className={`px-5 py-2 rounded-xl font-bold text-white flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                  isOverAllocated || totalDistributed === 0
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                <Check className="w-4 h-4" /> Confirm & Distribute Tokens
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
