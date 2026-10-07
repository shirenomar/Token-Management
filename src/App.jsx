import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LiveSimulator from './components/LiveSimulator';
import YearPoolGovernance from './components/YearPoolGovernance';
import UseCaseManager from './components/UseCaseManager';
import CreateYearPoolModal from './components/CreateYearPoolModal';
import CreateUseCaseModal from './components/CreateUseCaseModal';
import TopupRequestsModal from './components/TopupRequestsModal';
import SettingsModal from './components/SettingsModal';

import { 
  DEFAULT_YEARLY_POOLS, 
  INITIAL_USE_CASES, 
  generateInitialAllocations, 
  generateInitialUsage,
  INITIAL_TOPUP_REQUESTS,
  INITIAL_ALERTS,
  INITIAL_TRANSACTIONS,
  MONTHS
} from './data/initialData';

import { calculateTotals, formatTokenNumber } from './utils/formatters';

import { 
  Bell, 
  Settings as SettingsIcon, 
  RotateCcw,
  AlertTriangle,
  Info,
  X,
  Layers,
  FolderKanban
} from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('token_app_theme');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('token_app_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Sidebar Menu State: 'list_year_pool' | 'list_use_cases'
  const [activeMenu, setActiveMenu] = useState('list_year_pool');

  // Global Search & Telemetry State
  const [searchQuery, setSearchQuery] = useState('');
  const [showTelemetry, setShowTelemetry] = useState(false);

  // Multi-Year Pools State
  const [yearlyPools, setYearlyPools] = useState(() => {
    const saved = localStorage.getItem('token_yearly_pools');
    return saved ? JSON.parse(saved) : DEFAULT_YEARLY_POOLS;
  });

  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('Oct');
  const [role, setRole] = useState('admin');
  const [selectedUseCaseOwner, setSelectedUseCaseOwner] = useState('uc-1');

  const [useCases, setUseCases] = useState(() => {
    const saved = localStorage.getItem('token_use_cases');
    return saved ? JSON.parse(saved) : INITIAL_USE_CASES;
  });

  const [allocations, setAllocations] = useState(() => {
    const saved = localStorage.getItem('token_allocations');
    return saved ? JSON.parse(saved) : generateInitialAllocations();
  });

  const [usage, setUsage] = useState(() => {
    const saved = localStorage.getItem('token_usage');
    return saved ? JSON.parse(saved) : generateInitialUsage(generateInitialAllocations());
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('token_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [topupRequests, setTopupRequests] = useState(() => {
    const saved = localStorage.getItem('token_topup_requests');
    return saved ? JSON.parse(saved) : INITIAL_TOPUP_REQUESTS;
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('token_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Governance Settings
  const [rolloverEnabled, setRolloverEnabled] = useState(true);
  const [warningThreshold, setWarningThreshold] = useState(80);
  const [criticalThreshold, setCriticalThreshold] = useState(95);

  // Modal Controllers
  const [isCreateYearPoolOpen, setIsCreateYearPoolOpen] = useState(false);
  const [isCreateUseCaseOpen, setIsCreateUseCaseOpen] = useState(false);
  const [isTopupsModalOpen, setIsTopupsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [topupTargetUc, setTopupTargetUc] = useState(null);

  // Persist State
  useEffect(() => {
    localStorage.setItem('token_yearly_pools', JSON.stringify(yearlyPools));
    localStorage.setItem('token_use_cases', JSON.stringify(useCases));
    localStorage.setItem('token_allocations', JSON.stringify(allocations));
    localStorage.setItem('token_usage', JSON.stringify(usage));
    localStorage.setItem('token_transactions', JSON.stringify(transactions));
    localStorage.setItem('token_topup_requests', JSON.stringify(topupRequests));
    localStorage.setItem('token_alerts', JSON.stringify(alerts));
  }, [yearlyPools, useCases, allocations, usage, transactions, topupRequests, alerts]);

  // Reset State
  const handleResetData = () => {
    if (window.confirm("Reset all token pools, allocations, usage, and transactions to demo state?")) {
      localStorage.clear();
      const initialAlloc = generateInitialAllocations();
      setYearlyPools(DEFAULT_YEARLY_POOLS);
      setSelectedYear('2026');
      setUseCases(INITIAL_USE_CASES);
      setAllocations(initialAlloc);
      setUsage(generateInitialUsage(initialAlloc));
      setTransactions(INITIAL_TRANSACTIONS);
      setTopupRequests(INITIAL_TOPUP_REQUESTS);
      setAlerts(INITIAL_ALERTS);
      setSelectedMonth('Oct');
      setRole('admin');
      setTheme('light');
    }
  };

  const handleAddTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
  };

  // AUTOMATIC REVERSAL TO UNALLOCATED POOL WHEN A USE CASE IS FROZEN
  const handleToggleFreeze = (ucId) => {
    const targetUc = useCases.find(uc => uc.id === ucId);
    if (!targetUc) return;

    const isCurrentlyFrozen = targetUc.isFrozen;
    const isFreezing = !isCurrentlyFrozen;

    if (isFreezing) {
      // Calculate remaining allocations in current & future months for selectedYear
      const curMonthIdx = MONTHS.indexOf(selectedMonth);
      const yearAlloc = allocations[selectedYear] && allocations[selectedYear][ucId] ? allocations[selectedYear][ucId] : {};
      const yearUsage = usage[selectedYear] && usage[selectedYear][ucId] ? usage[selectedYear][ucId] : {};
      
      let reclaimedTotal = 0;
      const updatedAllocUc = { ...yearAlloc };

      MONTHS.forEach((m, idx) => {
        if (idx === curMonthIdx) {
          const aVal = updatedAllocUc[m] || 0;
          const uVal = yearUsage[m] || 0;
          const remVal = Math.max(0, aVal - uVal);
          if (remVal > 0) {
            reclaimedTotal += remVal;
            updatedAllocUc[m] = uVal;
          }
        } else if (idx > curMonthIdx) {
          const aVal = updatedAllocUc[m] || 0;
          if (aVal > 0) {
            reclaimedTotal += aVal;
            updatedAllocUc[m] = 0;
          }
        }
      });

      if (reclaimedTotal > 0) {
        setAllocations(prev => ({
          ...prev,
          [selectedYear]: {
            ...(prev[selectedYear] || {}),
            [ucId]: updatedAllocUc
          }
        }));

        handleAddTransaction({
          id: `tx-${Date.now()}`,
          year: selectedYear,
          month: selectedMonth,
          useCaseId: ucId,
          useCaseName: targetUc.name,
          type: 'FREEZE_REVERSAL_TO_UNALLOCATED',
          amount: -reclaimedTotal,
          performedBy: 'System Admin',
          description: `Frozen ${targetUc.name}: Automatically reclaimed ${formatTokenNumber(reclaimedTotal)} remainder tokens back to ${selectedYear} Unallocated Pool.`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
        });
      }

      setAlerts(a => [{
        id: `alt-${Date.now()}`,
        type: 'critical',
        title: `Admin Action: Frozen ${targetUc.name}`,
        message: `Token consumption locked. ${formatTokenNumber(reclaimedTotal)} remainder tokens returned to ${selectedYear} Unallocated Pool.`,
        timestamp: 'Just now',
        useCaseId: ucId
      }, ...a]);
    }

    setUseCases(prev => prev.map(uc => {
      if (uc.id === ucId) {
        return { 
          ...uc, 
          isFrozen: isFreezing,
          sharePercentage: isFreezing ? 0 : uc.sharePercentage
        };
      }
      return uc;
    }));
  };

  const handleAddAlert = (alertObj) => {
    setAlerts(prev => [alertObj, ...prev]);
  };

  // Export Matrix to CSV
  const handleExportCSV = () => {
    const currentYearAlloc = allocations[selectedYear] || {};
    const currentYearUsage = usage[selectedYear] || {};
    const headers = ['Code', 'Use Case Name', 'Category', 'Model', 'Status', ...MONTHS.map(m => `${m} Allocated`), ...MONTHS.map(m => `${m} Remainder`)];
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
        ...ucRem
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `STC_Token_Governance_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingRequestsCount = topupRequests.filter(r => r.status === 'pending').length;
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      isDark ? 'bg-[#0B0F19] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. Side Navigation Bar */}
      <Sidebar
        theme={theme}
        setTheme={setTheme}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        yearlyPools={yearlyPools}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        role={role}
        setRole={setRole}
        onOpenCreateYearPool={() => setIsCreateYearPoolOpen(true)}
        onOpenCreateUseCase={() => setIsCreateUseCaseOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Production Top Header Bar */}
        <Navbar
          theme={theme}
          setTheme={setTheme}
          yearlyPools={yearlyPools}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          role={role}
          setRole={setRole}
          selectedUseCaseOwner={selectedUseCaseOwner}
          setSelectedUseCaseOwner={setSelectedUseCaseOwner}
          useCases={useCases}
          pendingTopupsCount={pendingRequestsCount}
          onOpenTopups={() => setIsTopupsModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onResetData={handleResetData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showTelemetry={showTelemetry}
          setShowTelemetry={setShowTelemetry}
          onExportCSV={handleExportCSV}
        />

        <main className="px-4 lg:px-8 pb-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Live Telemetry Ticker Stream when enabled */}
          {showTelemetry && (
            <LiveSimulator
              theme={theme}
              useCases={useCases}
              allocations={allocations}
              usage={usage}
              setUsage={setUsage}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onAddAlert={handleAddAlert}
            />
          )}

          {/* Alerts Banner */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.slice(0, 1).map(alt => (
                <div 
                  key={alt.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    alt.type === 'critical'
                      ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div>
                      <strong className="font-bold">{alt.title}: </strong>
                      <span>{alt.message}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setAlerts(prev => prev.filter(a => a.id !== alt.id))}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Render Active Menu View */}
          {activeMenu === 'list_year_pool' ? (
            <YearPoolGovernance
              theme={theme}
              yearlyPools={yearlyPools}
              setYearlyPools={setYearlyPools}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              role={role}
              useCases={useCases}
              allocations={allocations}
              setAllocations={setAllocations}
              usage={usage}
              setUsage={setUsage}
              onOpenCreateYearPool={() => setIsCreateYearPoolOpen(true)}
              onAddTransaction={handleAddTransaction}
              searchQuery={searchQuery}
            />
          ) : (
            <UseCaseManager
              theme={theme}
              useCases={useCases}
              setUseCases={setUseCases}
              allocations={allocations}
              usage={usage}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              yearlyPools={yearlyPools}
              role={role}
              transactions={transactions}
              onOpenCreateUseCase={() => setIsCreateUseCaseOpen(true)}
              onToggleFreeze={handleToggleFreeze}
              onRequestTopup={(uc) => {
                setTopupTargetUc(uc);
                setIsTopupsModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      <CreateYearPoolModal
        theme={theme}
        isOpen={isCreateYearPoolOpen}
        onClose={() => setIsCreateYearPoolOpen(false)}
        yearlyPools={yearlyPools}
        setYearlyPools={setYearlyPools}
        setSelectedYear={setSelectedYear}
      />

      <CreateUseCaseModal
        theme={theme}
        isOpen={isCreateUseCaseOpen}
        onClose={() => setIsCreateUseCaseOpen(false)}
        useCases={useCases}
        setUseCases={setUseCases}
      />

      <TopupRequestsModal
        theme={theme}
        isOpen={isTopupsModalOpen}
        onClose={() => setIsTopupsModalOpen(false)}
        requests={topupRequests}
        setRequests={setTopupRequests}
        useCases={useCases}
        allocations={allocations[selectedYear] || {}}
        setAllocations={(updater) => {
          setAllocations(prev => ({
            ...prev,
            [selectedYear]: updater(prev[selectedYear] || {})
          }));
        }}
        selectedMonth={selectedMonth}
        role={role}
        initialTargetUc={topupTargetUc}
      />

      <SettingsModal
        theme={theme}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        yearlyPools={yearlyPools}
        setYearlyPools={setYearlyPools}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        startMonth="Jan"
        setStartMonth={() => {}}
        endMonth="Dec"
        setEndMonth={() => {}}
        rolloverEnabled={rolloverEnabled}
        setRolloverEnabled={setRolloverEnabled}
        warningThreshold={warningThreshold}
        setWarningThreshold={setWarningThreshold}
        criticalThreshold={criticalThreshold}
        setCriticalThreshold={setCriticalThreshold}
      />

    </div>
  );
}
