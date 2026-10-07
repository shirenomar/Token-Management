import React, { useState } from 'react';
import { formatTokenNumber } from '../utils/formatters';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  PlusCircle, 
  Filter, 
  Search,
  FileText
} from 'lucide-react';

export default function TransactionHistory({
  theme,
  transactions,
  useCases,
  selectedYear,
  setSelectedYear,
  yearlyPools
}) {
  const isDark = theme === 'dark';
  const [filterUcId, setFilterUcId] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filtered = transactions.filter(tx => {
    if (selectedYear && tx.year && tx.year !== selectedYear) return false;
    if (filterUcId !== 'ALL' && tx.useCaseId !== filterUcId) return false;
    if (filterType !== 'ALL' && tx.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.useCaseName?.toLowerCase().includes(q);
      const matchDesc = tx.description?.toLowerCase().includes(q);
      const matchBy = tx.performedBy?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchBy) return false;
    }
    return true;
  });

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`glass-panel p-6 rounded-2xl mb-8 border shadow-xl ${
      isDark ? 'border-white/10' : 'border-slate-200 bg-white'
    }`}>
      
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500">
              <History className="w-5 h-5" />
            </div>
            <h2 className={`text-lg font-bold ${textPrimary}`}>Token Transactions & Audit Log</h2>
          </div>
          <p className={`text-xs mt-1 ${textMuted}`}>
            Complete audit trail of token pool distributions, consumption events, emergency top-ups, and rollovers
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Year Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className={`font-medium ${textMuted}`}>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="glass-input text-xs rounded-lg py-1.5 px-2 font-bold"
            >
              {Object.keys(yearlyPools).map(y => (
                <option key={y} value={y} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {y} ({formatTokenNumber(yearlyPools[y].total, true)})
                </option>
              ))}
            </select>
          </div>

          {/* Use Case Filter */}
          <select
            value={filterUcId}
            onChange={(e) => setFilterUcId(e.target.value)}
            className="glass-input text-xs rounded-lg py-1.5 px-3 font-medium"
          >
            <option value="ALL" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>All Use Cases</option>
            {useCases.map(uc => (
              <option key={uc.id} value={uc.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {uc.name}
              </option>
            ))}
          </select>

          {/* Transaction Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="glass-input text-xs rounded-lg py-1.5 px-3 font-medium"
          >
            <option value="ALL" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>All Event Types</option>
            <option value="MONTHLY_ALLOCATION" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Monthly Allocation</option>
            <option value="CONSUMPTION" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>API Consumption</option>
            <option value="TOPUP_GRANT" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Top-Up Grant</option>
            <option value="ROLLOVER_CREDIT" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Rollover Credit</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${textMuted}`} />
            <input
              type="text"
              placeholder="Search log..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input text-xs rounded-lg py-1.5 pl-8 pr-3 w-40"
            />
          </div>

        </div>
      </div>

      {/* Transactions Table */}
      <div className={`overflow-x-auto rounded-xl border ${
        isDark ? 'border-white/10 bg-slate-950/60' : 'border-slate-200 bg-white'
      }`}>
        <table className="matrix-table text-xs">
          <thead>
            <tr className={isDark ? 'bg-slate-900' : 'bg-slate-100'}>
              <th>Timestamp</th>
              <th>Use Case</th>
              <th>Type</th>
              <th>Token Delta</th>
              <th>Executed By</th>
              <th>Details & Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className={`text-center py-8 ${textMuted}`}>
                  No transaction audit records match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map(tx => {
                const isPositive = tx.amount > 0;
                
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className={`font-mono text-[11px] ${textMuted} whitespace-nowrap`}>
                      {tx.timestamp}
                    </td>

                    <td className={`font-semibold ${textPrimary}`}>
                      {tx.useCaseName}
                    </td>

                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        tx.type === 'TOPUP_GRANT'
                          ? 'bg-purple-500/20 text-purple-600 border-purple-500/30'
                          : tx.type === 'ROLLOVER_CREDIT'
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                          : tx.type === 'CONSUMPTION'
                          ? 'bg-pink-500/20 text-pink-600 border-pink-500/30'
                          : 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30'
                      }`}>
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="font-mono font-bold whitespace-nowrap">
                      <span className={`flex items-center gap-1 ${
                        isPositive ? 'text-emerald-600' : 'text-pink-600'
                      }`}>
                        {isPositive ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" /> +{formatTokenNumber(tx.amount)}
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5" /> {formatTokenNumber(tx.amount)}
                          </>
                        )}
                      </span>
                    </td>

                    <td className={`text-xs ${textMuted}`}>
                      {tx.performedBy}
                    </td>

                    <td className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {tx.description}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
