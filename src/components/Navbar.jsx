import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Settings, 
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Search,
  Activity,
  Download,
  ChevronDown,
  Building2,
  Terminal,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { MONTHS } from '../data/initialData';
import { formatTokenNumber } from '../utils/formatters';

export default function Navbar({
  theme,
  setTheme,
  yearlyPools,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  role,
  setRole,
  selectedUseCaseOwner,
  setSelectedUseCaseOwner,
  useCases,
  pendingTopupsCount,
  onOpenTopups,
  onOpenSettings,
  onResetData,
  searchQuery,
  setSearchQuery,
  showTelemetry,
  setShowTelemetry,
  onExportCSV
}) {
  const isDark = theme === 'dark';
  const currentPoolTotal = (yearlyPools[selectedYear] && yearlyPools[selectedYear].total) || 20000000;
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Keyboard shortcut ⌘K / Ctrl+K focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-colors border-b px-4 lg:px-8 py-2.5 mb-5 ${
      isDark ? 'bg-slate-950/90 border-slate-800/80 backdrop-blur-xl' : 'bg-white/95 border-slate-200/90 shadow-sm backdrop-blur-xl'
    }`}>
      {/* Top Banner Sub-header: Enterprise Breadcrumbs & Live Status Ticker */}
      <div className={`hidden sm:flex items-center justify-between text-[11px] pb-2 mb-2 border-b ${
        isDark ? 'border-slate-800/60 text-slate-400' : 'border-slate-100 text-slate-500'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> Saudi Telecom Company (STC)
          </span>
          <span className="opacity-40">/</span>
          <span>EPM AI Governance</span>
          <span className="opacity-40">/</span>
          <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Multi-Year Token Orchestrator</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Vertex AI & Azure Gateways: Operational</span>
            <span className="opacity-40">•</span>
            <span className="text-slate-500 dark:text-slate-400">Avg Latency 14ms</span>
          </div>
          
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer text-[10px] font-semibold ${
              showTelemetry
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDark ? 'bg-slate-900 text-indigo-300 border border-slate-800 hover:border-indigo-500/40' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Zap className="w-3 h-3" />
            {showTelemetry ? 'Live Telemetry Active' : 'Show API Telemetry Feed'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand Logo & Core Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20 flex-shrink-0">
            <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${
              isDark ? 'bg-slate-950' : 'bg-white'
            }`}>
              <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-lg font-bold tracking-tight ${
                isDark 
                  ? 'bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent'
              }`}>
                STC Token Orchestrator
              </h1>
              <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md uppercase flex items-center gap-1 border ${
                isDark 
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                Enterprise v2.4
              </span>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Multi-Year Token Budget Pool & 5 AI Use Cases Governance
            </p>
          </div>
        </div>

        {/* Search Bar & Global Controls */}
        <div className="flex-1 max-w-sm hidden lg:block">
          <div className="relative">
            <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
            <input
              id="global-search-input"
              type="text"
              placeholder="Search Use Case, Model, or Cost Center... (⌘K)"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-12 py-1.5 text-xs rounded-lg glass-input transition-all ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <kbd className={`absolute right-2.5 top-2 px-1.5 py-0.5 text-[10px] font-mono rounded border ${
              isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-400 border-slate-200 shadow-xs'
            }`}>
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Controls Center */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Active Year Selector */}
          <div className={`flex items-center gap-1.5 border rounded-lg p-1 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <Clock className={`w-3.5 h-3.5 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className={`bg-transparent font-bold pr-1 text-xs focus:outline-none cursor-pointer ${
                isDark ? 'text-indigo-300' : 'text-indigo-700'
              }`}
            >
              {Object.keys(yearlyPools).map(yr => (
                <option key={yr} value={yr} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  Pool: {yr} ({formatTokenNumber(yearlyPools[yr].total, true)})
                </option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div className={`flex items-center gap-1 border rounded-lg p-1 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <Calendar className={`w-3.5 h-3.5 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`bg-transparent font-semibold pr-1 text-xs focus:outline-none cursor-pointer ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {MONTHS.map((m) => (
                <option key={m} value={m} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  Month: {m} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher */}
          <div className={`flex items-center border rounded-lg p-0.5 text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs font-semibold ${
                role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
            <button
              onClick={() => setRole('usecase_lead')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs font-semibold ${
                role === 'usecase_lead'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Lead
            </button>
          </div>

          {/* If Use Case Lead role active */}
          {role === 'usecase_lead' && (
            <select
              value={selectedUseCaseOwner}
              onChange={(e) => setSelectedUseCaseOwner(e.target.value)}
              className="glass-input text-xs rounded-lg py-1 px-2 font-medium"
            >
              {useCases.map((uc) => (
                <option key={uc.id} value={uc.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                  {uc.code}: {uc.name.slice(0, 20)}...
                </option>
              ))}
            </select>
          )}

          {/* Export CSV Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                isDark 
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
              }`}
              title="Export Allocation Matrix to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 shadow-xs'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Top-up Requests Trigger Button */}
          <button
            onClick={onOpenTopups}
            className={`relative p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
            title="Pending Top-Up Requests"
          >
            <Bell className="w-4 h-4" />
            {pendingTopupsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-xs">
                {pendingTopupsCount}
              </span>
            )}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
            }`}
            title="Settings & Rollover Rules"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetData}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-amber-400' 
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-amber-600 shadow-xs'
            }`}
            title="Reset to Initial Demo State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Profile Badge */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg border transition-all cursor-pointer ${
                isDark ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                SL
              </div>
              <div className="text-left hidden sm:block">
                <div className={`text-[11px] font-semibold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Sarah Lin
                </div>
                <div className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  FinOps Lead
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-xl border p-3 shadow-xl z-50 ${
                isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <div className="font-bold text-xs">Sarah Lin</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">sarah.lin@enterprise-stc.com</div>
                  <div className="text-[10px] mt-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                    Role: {role === 'admin' ? 'Enterprise Admin' : 'Use Case Lead'}
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    <span>Active Org:</span>
                    <strong className="text-[10px]">STC EPM</strong>
                  </div>
                  <div className="py-1 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between">
                    <span>Region:</span>
                    <strong className="text-[10px]">me-central1</strong>
                  </div>
                  <button 
                    onClick={() => { setIsProfileOpen(false); onOpenSettings(); }}
                    className="w-full text-left py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    Governance Settings
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
