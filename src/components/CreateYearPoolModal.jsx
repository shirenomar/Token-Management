import React, { useState } from 'react';
import { X, Layers, PlusCircle, Calendar, Coins } from 'lucide-react';
import { MONTHS } from '../data/initialData';
import { formatTokenNumber } from '../utils/formatters';

export default function CreateYearPoolModal({
  theme,
  isOpen,
  onClose,
  yearlyPools,
  setYearlyPools,
  setSelectedYear
}) {
  const isDark = theme === 'dark';
  const [yearInput, setYearInput] = useState('2028');
  const [startMonth, setStartMonth] = useState('Jan');
  const [endMonth, setEndMonth] = useState('Dec');
  const [authorizedTokens, setAuthorizedTokens] = useState(25000000);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const yearStr = yearInput.trim();
    if (!yearStr || isNaN(yearStr)) {
      alert("Please enter a valid numeric Year (e.g. 2028).");
      return;
    }

    if (yearlyPools[yearStr]) {
      alert(`Year Pool for ${yearStr} already exists. You can modify it directly in Settings.`);
      return;
    }

    setYearlyPools(prev => ({
      ...prev,
      [yearStr]: {
        total: Number(authorizedTokens),
        startMonth,
        endMonth
      }
    }));

    setSelectedYear(yearStr);
    onClose();
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      <div className={`glass-panel w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
        isDark ? 'border-white/10' : 'border-slate-200 bg-white'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div>
            <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <Layers className="w-5 h-5 text-indigo-500" />
              Define New Year Token Pool
            </h3>
            <p className={`text-xs ${textMuted}`}>
              Authorize an annual token budget and fiscal month range for a new contract year
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

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Year Input */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              Year Identifier
            </label>
            <input
              type="text"
              placeholder="e.g. 2028"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-full glass-input text-xs rounded-lg py-2 px-3 font-mono font-bold"
            />
          </div>

          {/* Authorized Tokens */}
          <div>
            <label className={`block text-xs font-semibold mb-1 ${textPrimary}`}>
              Authorized Annual Tokens
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1000000"
                value={authorizedTokens}
                onChange={(e) => setAuthorizedTokens(Number(e.target.value))}
                className="w-full glass-input text-xs rounded-lg py-2 px-3 font-mono font-bold"
              />
              <span className="text-xs font-bold text-indigo-600 shrink-0">
                ({formatTokenNumber(authorizedTokens, true)})
              </span>
            </div>
          </div>

          {/* Fiscal Cycle Months */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className={`block font-semibold mb-1 ${textPrimary}`}>Start Month</label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3 font-medium"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1 ${textPrimary}`}>End Month</label>
              <select
                value={endMonth}
                onChange={(e) => setEndMonth(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3 font-medium"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Create Year Pool
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
