import React, { useState } from 'react';
import TransactionHistory from './TransactionHistory';
import { formatTokenNumber, getStatusBadge } from '../utils/formatters';
import { 
  FolderKanban, 
  PlusCircle, 
  Activity, 
  Lock, 
  Unlock, 
  Plus, 
  ArrowLeft,
  User,
  Eye,
  CheckCircle2,
  AlertCircle,
  Check,
  Search,
  ChevronRight,
  Edit2
} from 'lucide-react';

export default function UseCaseManager({
  theme,
  useCases,
  setUseCases,
  allocations,
  usage,
  selectedMonth,
  selectedYear,
  setSelectedYear,
  yearlyPools,
  role,
  transactions,
  onOpenCreateUseCase,
  onToggleFreeze,
  onRequestTopup
}) {
  const isDark = theme === 'dark';
  
  const [viewMode, setViewMode] = useState('LIST');
  const [selectedUcId, setSelectedUcId] = useState(useCases[0]?.id || 'uc-1');
  const [editingShareUcId, setEditingShareUcId] = useState(null);
  const [tempShareInput, setTempShareInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedUc = useCases.find(uc => uc.id === selectedUcId) || useCases[0];
  const yearAllocations = allocations[selectedYear] || {};
  const yearUsage = usage[selectedYear] || {};

  // ACTIVE USE CASES ONLY (Exclude frozen)
  const activeUseCases = useCases.filter(uc => !uc.isFrozen);

  // Calculate current sum of shares across ACTIVE (unfrozen) use cases
  const activeSharesSum = activeUseCases.reduce((acc, uc) => acc + (uc.sharePercentage || 0), 0);
  const isShareBalanced = activeSharesSum === 100;

  const filteredUseCases = useCases.filter(uc => 
    uc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uc.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-Rebalance ACTIVE Use Cases ONLY to sum to 100%
  const handleAutoRebalance = () => {
    if (activeUseCases.length === 0) return;
    
    const baseShare = Math.floor(100 / activeUseCases.length);
    const remainder = 100 - (baseShare * activeUseCases.length);

    setUseCases(prev => prev.map((uc, idx) => {
      if (uc.isFrozen) {
        return { ...uc, sharePercentage: 0 };
      }
      const activeIdx = activeUseCases.findIndex(a => a.id === uc.id);
      return {
        ...uc,
        sharePercentage: baseShare + (activeIdx === 0 ? remainder : 0)
      };
    }));
  };

  // Save inline share % edit
  const handleSaveShare = (ucId) => {
    const parsed = parseInt(tempShareInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setUseCases(prev => prev.map(uc => uc.id === ucId ? { ...uc, sharePercentage: parsed } : uc));
    }
    setEditingShareUcId(null);
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Directory Header */}
      <div className={`glass-panel p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                AI Use Cases Directory & Transaction Ledgers
              </h2>
              <span className="uui-badge uui-badge-indigo">
                <span className="uui-badge-dot"></span>
                {activeUseCases.length} Active / {useCases.length} Total
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${textMuted}`}>
              Manage active use case quotas, target budget share % (Active only), freeze controls, and audit transaction ledgers
            </p>
          </div>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center border rounded-xl p-1 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs'
                  : textMuted
              }`}
            >
              List View ({useCases.length})
            </button>
            <button
              onClick={() => setViewMode('DETAILS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'DETAILS'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs'
                  : textMuted
              }`}
            >
              Details Ledger ({selectedUc ? selectedUc.name.split(' ')[0] : ''})
            </button>
          </div>

          {role === 'admin' && (
            <button
              onClick={onOpenCreateUseCase}
              className="uui-btn-primary flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Add New Use Case
            </button>
          )}
        </div>
      </div>

      {/* Active Use Cases Share % Validation Bar */}
      <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
        isShareBalanced
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
      }`}>
        <div className="flex items-center gap-2">
          {isShareBalanced ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
          )}
          <span>
            {isShareBalanced ? (
              <strong>Perfect Active Target Share! {activeUseCases.length} Active Use Cases sum to 100% share.</strong>
            ) : (
              <span>
                Active Use Cases Combined Shares: <strong>{activeSharesSum}%</strong> / 100% (Frozen excluded).
              </span>
            )}
          </span>
        </div>

        {role === 'admin' && !isShareBalanced && (
          <button
            onClick={handleAutoRebalance}
            className="uui-btn-primary"
          >
            Auto-Rebalance Active Shares to 100%
          </button>
        )}
      </div>

      {/* VIEW 1: MASTER UNTITLED UI TABLE COMPOUND OF ALL USE CASES */}
      {viewMode === 'LIST' ? (
        <div className={`glass-panel rounded-2xl border shadow-xs overflow-hidden ${
          isDark ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
        }`}>
          
          {/* Table Compound Header Bar */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-bold ${textPrimary}`}>AI Use Cases Directory</h3>
                <span className="uui-badge uui-badge-indigo">
                  <span className="uui-badge-dot"></span>
                  {useCases.length} Total Use Cases
                </span>
              </div>
              <p className={`text-xs mt-1 ${textMuted}`}>
                Click on any use case row to view its detailed consumption history and transaction ledger.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search use case or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input text-xs rounded-xl py-2 pl-9 pr-3 w-56 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="matrix-table text-xs">
              <thead>
                <tr>
                  <th className="min-w-[200px]">Use Case Name</th>
                  <th className="min-w-[140px]">Persona Lead</th>
                  <th className="min-w-[110px] text-center">Share %</th>
                  <th className="min-w-[150px] text-right">{selectedMonth} Allocation</th>
                  <th className="min-w-[150px] text-right">{selectedMonth} Remainder</th>
                  <th className="min-w-[120px] text-center">Status</th>
                  <th className="min-w-[120px] text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUseCases.map(uc => {
                  const allocated = (yearAllocations[uc.id] && yearAllocations[uc.id][selectedMonth]) || 0;
                  const consumed = (yearUsage[uc.id] && yearUsage[uc.id][selectedMonth]) || 0;
                  const remaining = Math.max(0, allocated - consumed);
                  const remPct = allocated > 0 ? Math.round((remaining / allocated) * 100) : 0;
                  const isSelected = uc.id === selectedUcId;
                  const isEditingShare = editingShareUcId === uc.id;

                  return (
                    <tr 
                      key={uc.id}
                      onClick={() => {
                        setSelectedUcId(uc.id);
                        setViewMode('DETAILS');
                      }}
                      className={`transition-colors cursor-pointer group ${
                        uc.isFrozen 
                          ? 'bg-red-500/5 opacity-75' 
                          : isSelected 
                          ? isDark ? 'bg-purple-950/30' : 'bg-purple-50/50' 
                          : ''
                      }`}
                    >
                      {/* Use Case Name & Category */}
                      <td className="py-3.5 font-medium">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: uc.color }}></span>
                          <div>
                            <div className={`font-bold ${textPrimary} text-xs flex items-center gap-1.5 group-hover:text-purple-600 transition-colors`}>
                              <span>{uc.name}</span>
                              {uc.isFrozen && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
                            </div>
                            <div className={`text-[11px] ${textMuted}`}>{uc.category}</div>
                          </div>
                        </div>
                      </td>

                      {/* Owner Lead */}
                      <td>
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{uc.owner}</span>
                        </div>
                      </td>

                      {/* Share % & Quick Edit */}
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        {isEditingShare ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={tempShareInput}
                              onChange={(e) => setTempShareInput(e.target.value)}
                              className="w-12 text-center glass-input text-xs rounded py-0.5 font-bold font-mono"
                            />
                            <button
                              onClick={() => handleSaveShare(uc.id)}
                              className="p-1 rounded bg-emerald-600 text-white cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={role !== 'admin' || uc.isFrozen}
                            onClick={() => {
                              if (role === 'admin' && !uc.isFrozen) {
                                setEditingShareUcId(uc.id);
                                setTempShareInput(uc.sharePercentage.toString());
                              }
                            }}
                            className={`uui-badge ${
                              uc.isFrozen ? 'uui-badge-gray opacity-60' : 'uui-badge-indigo'
                            } ${role === 'admin' && !uc.isFrozen ? 'hover:scale-105 cursor-pointer' : ''}`}
                            title={uc.isFrozen ? "Frozen use case (0% share)" : "Click to edit share %"}
                          >
                            <span className="uui-badge-dot"></span>
                            {uc.isFrozen ? '0% (Frozen)' : `${uc.sharePercentage}%`}
                          </button>
                        )}
                      </td>

                      {/* Monthly Allocated */}
                      <td className="text-right font-mono font-semibold text-slate-900 dark:text-white">
                        {formatTokenNumber(allocated, true)}
                      </td>

                      {/* Monthly Remainder */}
                      <td className="text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>{formatTokenNumber(remaining, true)}</span>
                          {allocated > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              remaining === 0 
                                ? 'bg-rose-500/20 text-rose-600 font-bold' 
                                : isDark ? 'bg-slate-800 text-purple-300' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {remPct}%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Pill Badge */}
                      <td className="text-center">
                        <span className={`uui-badge ${
                          uc.isFrozen ? 'uui-badge-error' : 'uui-badge-success'
                        }`}>
                          <span className="uui-badge-dot"></span>
                          {uc.isFrozen ? 'Frozen 🔒' : 'Active'}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="text-right pr-6">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-all">
                          View Ledger <ChevronRight className="w-4 h-4" />
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
            <span>Showing {filteredUseCases.length} of {useCases.length} use cases</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Click any row to open full transaction ledger</span>
          </div>

        </div>
      ) : (
        /* VIEW 2: DETAILS VIEW & LEDGER FOR SINGLE SELECTED USE CASE */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 text-xs font-bold cursor-pointer ${textMuted} hover:text-purple-600`}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Use Cases Directory
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className={`font-semibold ${textMuted}`}>Selected Use Case:</span>
              <select
                value={selectedUcId}
                onChange={(e) => setSelectedUcId(e.target.value)}
                className="glass-input text-xs rounded-xl py-1.5 px-3 font-bold"
              >
                {useCases.map(uc => (
                  <option key={uc.id} value={uc.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {uc.name} {uc.isFrozen ? '(FROZEN)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detailed Use Case Card */}
          {selectedUc && (
            <div className={`glass-panel p-6 rounded-2xl border shadow-xl ${
              isDark ? 'border-white/10' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full shrink-0 shadow-lg" style={{ backgroundColor: selectedUc.color }}></span>
                  <div>
                    <h3 className={`text-xl font-bold ${textPrimary}`}>{selectedUc.name}</h3>
                    <div className="flex items-center gap-2 text-xs mt-0.5">
                      <span className="font-semibold text-purple-600">{selectedUc.category}</span>
                      <span>•</span>
                      <span className={textMuted}>{selectedUc.priority}</span>
                      <span>•</span>
                      <span className={textMuted}>
                        Status: <strong className={selectedUc.isFrozen ? 'text-red-500' : 'text-emerald-600'}>
                          {selectedUc.isFrozen ? 'FROZEN (0% Active Share)' : `${selectedUc.sharePercentage}% Active Share`}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {role === 'admin' && (
                    <button
                      onClick={() => onToggleFreeze(selectedUc.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedUc.isFrozen
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {selectedUc.isFrozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                  )}

                  <button
                    onClick={() => onRequestTopup(selectedUc)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Top-Up
                  </button>
                </div>
              </div>

              <p className={`text-xs mb-4 ${textMuted}`}>{selectedUc.description}</p>
            </div>
          )}

          {/* Audit Ledger filtered specifically for this Use Case */}
          <TransactionHistory
            theme={theme}
            transactions={transactions.filter(t => t.useCaseId === selectedUcId || t.useCaseId === 'ALL')}
            useCases={useCases}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            yearlyPools={yearlyPools}
          />
        </div>
      )}

    </div>
  );
}
