import React from 'react';
import { 
  Lock, 
  Unlock, 
  PlusCircle, 
  User, 
  Activity 
} from 'lucide-react';
import { formatTokenNumber, getStatusBadge } from '../utils/formatters';

export default function UseCaseCards({
  theme,
  useCases,
  allocations,
  usage,
  selectedMonth,
  role,
  onToggleFreeze,
  onRequestTopup
}) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const bgBox = isDark ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-200';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
            <Activity className="w-5 h-5 text-pink-500" />
            5 AI Use Cases - Status & Quotas ({selectedMonth} 2026)
          </h2>
          <p className={`text-xs mt-0.5 ${textMuted}`}>
            Monitor live consumption, manage emergency freeze controls, and issue token top-ups per use case.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {useCases.map(uc => {
          const allocated = (allocations[uc.id] && allocations[uc.id][selectedMonth]) || 0;
          const consumed = (usage[uc.id] && usage[uc.id][selectedMonth]) || 0;
          const remaining = Math.max(0, allocated - consumed);
          const percent = allocated > 0 ? Math.min(100, Math.round((consumed / allocated) * 100)) : 0;
          const status = getStatusBadge(percent);

          return (
            <div 
              key={uc.id} 
              className={`glass-panel p-5 rounded-2xl border relative transition-all duration-200 ${
                uc.isFrozen 
                  ? 'border-red-500/40 bg-red-950/10' 
                  : isDark ? 'border-white/10 hover:border-indigo-500/40' : 'border-slate-200 hover:border-indigo-300 shadow-sm'
              }`}
            >
              {/* Frozen Overlay Badge if Applicable */}
              {uc.isFrozen && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-500/20 text-red-500 border border-red-500/40 text-[10px] font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> FROZEN BY ADMIN
                </div>
              )}

              {/* Header: Name & Category */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-lg shadow-indigo-500/50" 
                    style={{ backgroundColor: uc.color }}
                  ></div>
                  <div>
                    <h3 className={`font-bold ${textPrimary} text-base leading-snug`}>{uc.name}</h3>
                    <span className={`text-xs font-medium ${textMuted}`}>{uc.category}</span>
                  </div>
                </div>
              </div>

              <p className={`text-xs line-clamp-2 mb-4 ${textMuted}`}>
                {uc.description}
              </p>

              {/* Owner & Priority Badges */}
              <div className={`flex flex-wrap items-center justify-between gap-2 text-xs mb-4 pb-3 border-b ${
                isDark ? 'border-white/5' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-1.5">
                  <User className={`w-3.5 h-3.5 ${textMuted}`} />
                  <span className={`text-[11px] truncate max-w-[150px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{uc.owner}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {uc.priority}
                </span>
              </div>

              {/* Token Quota Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className={textMuted}>Monthly Quota Consumption</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.colorClass}`}>
                    {percent}% ({status.label})
                  </span>
                </div>

                <div className={`w-full rounded-full h-2 overflow-hidden border ${
                  isDark ? 'bg-slate-900 border-white/5' : 'bg-slate-200 border-slate-300'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${status.progressClass}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className={`p-2 rounded-lg border ${bgBox}`}>
                    <div className={`text-[10px] font-medium ${textMuted}`}>Allocated</div>
                    <div className={`text-xs font-bold font-mono ${textPrimary}`}>{formatTokenNumber(allocated, true)}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${bgBox}`}>
                    <div className={`text-[10px] font-medium ${textMuted}`}>Consumed</div>
                    <div className="text-xs font-bold text-indigo-600 font-mono">{formatTokenNumber(consumed, true)}</div>
                  </div>
                  <div className={`p-2 rounded-lg border ${bgBox}`}>
                    <div className={`text-[10px] font-medium ${textMuted}`}>Remaining</div>
                    <div className="text-xs font-bold text-emerald-600 font-mono">{formatTokenNumber(remaining, true)}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center justify-between gap-2 pt-2 border-t ${
                isDark ? 'border-white/5' : 'border-slate-200'
              }`}>
                
                {/* Admin Freeze Toggle */}
                {role === 'admin' && (
                  <button
                    onClick={() => onToggleFreeze(uc.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      uc.isFrozen
                        ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                    }`}
                  >
                    {uc.isFrozen ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" /> Unfreeze
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" /> Freeze
                      </>
                    )}
                  </button>
                )}

                {/* Top-Up Request Trigger */}
                <button
                  onClick={() => onRequestTopup(uc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-600 border border-indigo-500/30 text-xs font-semibold transition-all ml-auto cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  {role === 'admin' ? 'Grant Top-Up' : 'Request Top-Up'}
                </button>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
