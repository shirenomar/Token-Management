import React from 'react';
import { 
  Cpu, 
  Layers, 
  FolderKanban, 
  Sun, 
  Moon, 
  RotateCcw, 
  Settings,
  Sparkles,
  ShieldCheck,
  UserCheck,
  PlusCircle
} from 'lucide-react';

export default function Sidebar({
  theme,
  setTheme,
  activeMenu,
  setActiveMenu,
  yearlyPools,
  selectedYear,
  setSelectedYear,
  role,
  setRole,
  onOpenCreateYearPool,
  onOpenCreateUseCase,
  onOpenSettings,
  onResetData
}) {
  const isDark = theme === 'dark';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <aside className={`w-64 shrink-0 glass-panel border-r h-screen sticky top-0 flex flex-col justify-between p-4 z-40 transition-colors ${
      isDark ? 'border-slate-800 bg-slate-950/95' : 'border-slate-200/80 bg-white/95 shadow-xs'
    }`}>
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 shadow-xs shrink-0 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`text-sm font-bold tracking-tight ${textPrimary}`}>
                Token Orchestrator
              </h1>
            </div>
            <span className="uui-badge uui-badge-indigo mt-0.5 py-0 px-2 text-[10px]">
              <span className="uui-badge-dot"></span>
              AI Governance
            </span>
          </div>
        </div>

        {/* Role Switcher (Untitled UI Persona Bar) */}
        <div className={`p-1.5 rounded-xl border mb-5 text-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100/80 border-slate-200'
        }`}>
          <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1 px-1.5 ${textMuted}`}>
            Active Persona
          </div>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-xs border border-slate-200 dark:border-slate-700'
                  : textMuted
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
            <button
              onClick={() => setRole('usecase_lead')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                role === 'usecase_lead'
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 shadow-xs border border-slate-200 dark:border-slate-700'
                  : textMuted
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> UC Lead
            </button>
          </div>
        </div>

        {/* Primary Navigation Menus */}
        <nav className="space-y-1">
          <div className={`text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5 ${textMuted}`}>
            Core Navigation
          </div>

          {/* Menu 1: List Year Pool */}
          <button
            onClick={() => setActiveMenu('list_year_pool')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              activeMenu === 'list_year_pool'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>List Year Pool</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              activeMenu === 'list_year_pool' ? 'bg-indigo-700 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {Object.keys(yearlyPools).length}
            </span>
          </button>

          {/* Menu 2: List of Use Cases */}
          <button
            onClick={() => setActiveMenu('list_use_cases')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
              activeMenu === 'list_use_cases'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4" />
              <span>List of Use Cases</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
              activeMenu === 'list_use_cases' ? 'bg-indigo-700 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              5
            </span>
          </button>
        </nav>

        {/* Quick Creator Triggers */}
        {role === 'admin' && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className={`text-[10px] font-semibold uppercase tracking-wider px-2 mb-1 ${textMuted}`}>
              Quick Actions
            </div>
            <button
              onClick={onOpenCreateYearPool}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uui-btn-secondary"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
              Define New Year Pool
            </button>
            <button
              onClick={onOpenCreateUseCase}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uui-btn-secondary"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-500" />
              Add New Use Case
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border uui-btn-secondary"
        >
          <span className="font-medium text-xs">Theme Mode</span>
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border uui-btn-secondary"
        >
          <Settings className="w-4 h-4 text-slate-500" />
          <span>Governance Settings</span>
        </button>

        <button
          onClick={onResetData}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border uui-btn-secondary text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo State</span>
        </button>
      </div>
    </aside>
  );
}
