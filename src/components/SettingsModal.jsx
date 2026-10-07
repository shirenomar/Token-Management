import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Save, ToggleLeft, ToggleRight, Sliders, Calendar, Plus, Layers } from 'lucide-react';
import { MONTHS, DEFAULT_YEARLY_POOLS } from '../data/initialData';
import { formatTokenNumber } from '../utils/formatters';

export default function SettingsModal({
  theme,
  isOpen,
  onClose,
  yearlyPools,
  setYearlyPools,
  selectedYear,
  setSelectedYear,
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  rolloverEnabled,
  setRolloverEnabled,
  warningThreshold,
  setWarningThreshold,
  criticalThreshold,
  setCriticalThreshold
}) {
  const isDark = theme === 'dark';
  const [newYearInput, setNewYearInput] = useState('');
  const [newBudgetInput, setNewBudgetInput] = useState(20000000);

  if (!isOpen) return null;

  const currentPool = yearlyPools[selectedYear] || { total: 20000000 };

  // Handle Add New Year Pool
  const handleAddYearPool = (e) => {
    e.preventDefault();
    if (!newYearInput.trim() || isNaN(newYearInput)) {
      alert("Please enter a valid year number (e.g. 2028).");
      return;
    }
    const yr = newYearInput.trim();
    setYearlyPools(prev => ({
      ...prev,
      [yr]: { total: Number(newBudgetInput), startMonth: "Jan", endMonth: "Dec" }
    }));
    setSelectedYear(yr);
    setNewYearInput('');
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const boxBg = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      <div className={`glass-panel w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
        isDark ? 'border-white/10' : 'border-slate-200 bg-white'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div>
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              <SettingsIcon className="w-5 h-5 text-indigo-500" />
              Multi-Year Token Pools & Governance Settings
            </h3>
            <p className={`text-xs ${textMuted}`}>
              Configure annual token budgets per year, custom fiscal month cycles, and warning alerts
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

        <div className="space-y-5">
          
          {/* 1. Multi-Year Pool Selector & Budget Editor */}
          <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
            <h4 className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5 uppercase tracking-wider`}>
              <Layers className="w-4 h-4 text-indigo-500" /> Manage Yearly Token Pools
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Active Year Pool</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full glass-input text-xs rounded-lg py-2 px-3 font-bold"
                >
                  {Object.keys(yearlyPools).map(y => (
                    <option key={y} value={y} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      Year {y} ({formatTokenNumber(yearlyPools[y].total, true)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${textMuted}`}>{selectedYear} Budget Pool</label>
                <input
                  type="number"
                  step="1000000"
                  value={currentPool.total}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setYearlyPools(prev => ({
                      ...prev,
                      [selectedYear]: { ...(prev[selectedYear] || {}), total: val }
                    }));
                  }}
                  className="w-full glass-input text-xs rounded-lg py-2 px-3 font-mono font-bold"
                />
              </div>
            </div>

            {/* Quick Add New Year */}
            <form onSubmit={handleAddYearPool} className="pt-2 flex items-center gap-2 border-t border-slate-200 dark:border-white/5">
              <input
                type="text"
                placeholder="New Year (e.g. 2028)"
                value={newYearInput}
                onChange={(e) => setNewYearInput(e.target.value)}
                className="w-1/2 glass-input text-xs rounded-lg py-1.5 px-3"
              />
              <button
                type="submit"
                className="w-1/2 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Year Pool
              </button>
            </form>
          </div>

          {/* 2. Custom Fiscal Date Range (Start & End Month) */}
          <div className={`p-4 rounded-xl border space-y-3 ${boxBg}`}>
            <h4 className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5 uppercase tracking-wider`}>
              <Calendar className="w-4 h-4 text-indigo-500" /> Contract Fiscal Cycle (Distribution Range)
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className={`block font-medium mb-1 ${textMuted}`}>Start Month</label>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="w-full glass-input text-xs rounded-lg py-2 px-3 font-semibold"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-medium mb-1 ${textMuted}`}>End Month</label>
                <select
                  value={endMonth}
                  onChange={(e) => setEndMonth(e.target.value)}
                  className="w-full glass-input text-xs rounded-lg py-2 px-3 font-semibold"
                >
                  {MONTHS.map(m => (
                    <option key={m} value={m} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className={`text-[11px] ${textMuted}`}>
              Allows setting non-calendar fiscal years (e.g. April to March or July to June).
            </p>
          </div>

          {/* 3. Rollover Policy Toggle */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl border ${boxBg}`}>
            <div>
              <div className={`text-xs font-bold ${textPrimary}`}>Unused Token Rollover Policy</div>
              <p className={`text-[11px] mt-0.5 ${textMuted}`}>
                Automatically carry over up to 50% unused monthly tokens into the following month's quota.
              </p>
            </div>
            <button
              onClick={() => setRolloverEnabled(!rolloverEnabled)}
              className="text-indigo-500 hover:text-indigo-600 transition-colors shrink-0 ml-3 cursor-pointer"
            >
              {rolloverEnabled ? (
                <ToggleRight className="w-8 h-8 text-indigo-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-400" />
              )}
            </button>
          </div>

          {/* 4. Alert Threshold Sliders */}
          <div className={`space-y-3 p-3.5 rounded-xl border ${boxBg}`}>
            <h4 className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5`}>
              <Sliders className="w-3.5 h-3.5 text-indigo-500" /> Quota Warning Thresholds
            </h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Soft Warning Threshold:</span>
                <span className="text-amber-500 font-bold">{warningThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="90"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Critical Alert Threshold:</span>
                <span className="text-red-500 font-bold">{criticalThreshold}%</span>
              </div>
              <input
                type="range"
                min="85"
                max="99"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`flex justify-end pt-4 mt-6 border-t ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Settings
          </button>
        </div>

      </div>
    </div>
  );
}
