import React, { useState, useEffect } from 'react';
import { Play, Sparkles, RefreshCw, Zap, Terminal, CheckCircle2, Shield, Activity, ChevronRight } from 'lucide-react';
import { formatTokenNumber } from '../utils/formatters';

export default function LiveSimulator({
  theme,
  useCases,
  allocations,
  usage,
  setUsage,
  selectedMonth,
  selectedYear,
  onAddAlert
}) {
  const isDark = theme === 'dark';
  const [selectedUcId, setSelectedUcId] = useState(useCases[0]?.id || 'uc-1');
  const [batchAmount, setBatchAmount] = useState(50000);
  const [promptTokensRatio, setPromptTokensRatio] = useState(70);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastSimResult, setLastSimResult] = useState(null);
  
  // Real-time API gateway log stream
  const [apiLogs, setApiLogs] = useState([
    {
      id: 1,
      time: new Date(Date.now() - 120000).toTimeString().slice(0, 8),
      ucCode: 'UC-GENAI-01',
      model: 'Gemini 1.5 Pro',
      tokens: 1420,
      latency: 14,
      cost: '$0.0035',
      status: '200 OK'
    },
    {
      id: 2,
      time: new Date(Date.now() - 60000).toTimeString().slice(0, 8),
      ucCode: 'UC-DEV-03',
      model: 'Claude 3.5 Sonnet',
      tokens: 3850,
      latency: 22,
      cost: '$0.0115',
      status: '200 OK'
    }
  ]);

  const [isAutoStreamActive, setIsAutoStreamActive] = useState(false);

  // Auto streaming simulation interval
  useEffect(() => {
    let interval;
    if (isAutoStreamActive) {
      interval = setInterval(() => {
        const activeUcs = useCases.filter(u => !u.isFrozen);
        if (activeUcs.length === 0) return;
        const randomUc = activeUcs[Math.floor(Math.random() * activeUcs.length)];
        const tokensUsed = Math.floor(Math.random() * 2500) + 500;
        const latency = Math.floor(Math.random() * 30) + 10;
        const costVal = ((tokensUsed / 1000) * 0.0025).toFixed(4);

        // Update usage in background
        setUsage(prev => {
          const currentYearUsage = prev[selectedYear] || {};
          const currentUcUsage = currentYearUsage[randomUc.id] || {};
          const oldVal = currentUcUsage[selectedMonth] || 0;
          return {
            ...prev,
            [selectedYear]: {
              ...currentYearUsage,
              [randomUc.id]: {
                ...currentUcUsage,
                [selectedMonth]: oldVal + tokensUsed
              }
            }
          };
        });

        // Add to live log
        const newLog = {
          id: Date.now(),
          time: new Date().toTimeString().slice(0, 8),
          ucCode: randomUc.code,
          model: randomUc.model.slice(0, 18),
          tokens: tokensUsed,
          latency: latency,
          cost: `$${costVal}`,
          status: '200 OK'
        };

        setApiLogs(prev => [newLog, ...prev.slice(0, 7)]);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoStreamActive, useCases, selectedMonth, selectedYear, setUsage]);

  const selectedUc = useCases.find(uc => uc.id === selectedUcId) || useCases[0];
  const currentYearAlloc = (allocations[selectedYear] && allocations[selectedYear][selectedUcId]) || {};
  const currentYearUsage = (usage[selectedYear] && usage[selectedYear][selectedUcId]) || {};
  
  const currentAllocated = currentYearAlloc[selectedMonth] || 0;
  const currentConsumed = currentYearUsage[selectedMonth] || 0;

  const handleRunSimulation = () => {
    if (selectedUc?.isFrozen) {
      alert(`Cannot simulate API calls for "${selectedUc.name}" because it is FROZEN by Admin.`);
      return;
    }

    setIsSimulating(true);

    setTimeout(() => {
      const promptCount = Math.round(batchAmount * (promptTokensRatio / 100));
      const completionCount = batchAmount - promptCount;
      const newConsumed = currentConsumed + batchAmount;

      setUsage(prev => ({
        ...prev,
        [selectedYear]: {
          ...(prev[selectedYear] || {}),
          [selectedUcId]: {
            ...((prev[selectedYear] && prev[selectedYear][selectedUcId]) || {}),
            [selectedMonth]: newConsumed
          }
        }
      }));

      const oldPercent = currentAllocated > 0 ? (currentConsumed / currentAllocated) * 100 : 0;
      const newPercent = currentAllocated > 0 ? (newConsumed / currentAllocated) * 100 : 0;

      if (newPercent >= 95 && oldPercent < 95 && onAddAlert) {
        onAddAlert({
          id: `alt-${Date.now()}`,
          type: 'critical',
          title: `Critical Alert: ${selectedUc.name} at ${Math.round(newPercent)}% Quota!`,
          message: `Monthly token quota is nearly depleted (${formatTokenNumber(newConsumed)} / ${formatTokenNumber(currentAllocated)}).`,
          timestamp: 'Just now',
          useCaseId: selectedUcId
        });
      } else if (newPercent >= 80 && oldPercent < 80 && onAddAlert) {
        onAddAlert({
          id: `alt-${Date.now()}`,
          type: 'warning',
          title: `Warning: ${selectedUc.name} hit ${Math.round(newPercent)}% Quota`,
          message: `Token consumption crossed soft alert threshold.`,
          timestamp: 'Just now',
          useCaseId: selectedUcId
        });
      }

      setLastSimResult({
        ucName: selectedUc.name,
        totalTokens: batchAmount,
        promptTokens: promptCount,
        completionTokens: completionCount,
        newPercent: Math.round(newPercent)
      });

      // Add to API logs
      setApiLogs(prev => [{
        id: Date.now(),
        time: new Date().toTimeString().slice(0, 8),
        ucCode: selectedUc.code,
        model: selectedUc.model.slice(0, 18),
        tokens: batchAmount,
        latency: 38,
        cost: `$${((batchAmount / 1000) * 0.0025).toFixed(4)}`,
        status: '200 OK (Batch)'
      }, ...prev.slice(0, 7)]);

      setIsSimulating(false);
    }, 350);
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`glass-panel p-5 rounded-2xl mb-6 border shadow-xl ${
      isDark ? 'border-white/10 bg-slate-900/90' : 'border-slate-200 bg-white'
    }`}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`font-bold ${textPrimary} text-sm flex items-center gap-2`}>
              STC Vertex AI Gateway Telemetry & Token Simulator
              {isAutoStreamActive && (
                <span className="uui-badge uui-badge-success text-[10px]">
                  <span className="uui-badge-dot animate-ping"></span> Live Streaming Active
                </span>
              )}
            </h3>
            <p className={`text-xs ${textMuted}`}>
              Test live model token consumption batches, quota triggers, and prompt/completion breakdowns
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAutoStreamActive(!isAutoStreamActive)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isAutoStreamActive 
              ? 'bg-emerald-600 text-white shadow-xs' 
              : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Activity className={`w-3.5 h-3.5 ${isAutoStreamActive ? 'animate-pulse text-white' : ''}`} />
          {isAutoStreamActive ? 'Pause Auto Traffic Stream' : 'Start Auto Traffic Stream'}
        </button>
      </div>

      {/* Simulator Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
        
        {/* Select Use Case */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Target Use Case</label>
          <select
            value={selectedUcId}
            onChange={(e) => setSelectedUcId(e.target.value)}
            className="w-full glass-input text-xs rounded-lg py-1.5 px-3 font-medium"
          >
            {useCases.map(uc => (
              <option key={uc.id} value={uc.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {uc.code}: {uc.name.slice(0, 22)}... {uc.isFrozen ? '(FROZEN)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Token Amount */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Token Batch Size</label>
          <select
            value={batchAmount}
            onChange={(e) => setBatchAmount(parseInt(e.target.value, 10))}
            className="w-full glass-input text-xs rounded-lg py-1.5 px-3 font-medium font-mono"
          >
            <option value={10000} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>10,000 Tokens (Copilot Inquiry)</option>
            <option value={50000} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>50,000 Tokens (Medium Batch)</option>
            <option value={100000} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>100,000 Tokens (Vector RAG Call)</option>
            <option value={250000} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>250,000 Tokens (PR Code Sweep)</option>
          </select>
        </div>

        {/* Prompt/Completion Ratio */}
        <div>
          <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Prompt Ratio</label>
          <div className="flex items-center gap-2 text-xs">
            <input
              type="range"
              min="40"
              max="90"
              value={promptTokensRatio}
              onChange={(e) => setPromptTokensRatio(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold shrink-0 text-xs">{promptTokensRatio}% Prompt</span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || selectedUc?.isFrozen}
            className={`w-full py-1.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
              selectedUc?.isFrozen
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simulating...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" /> Run Token Batch
              </>
            )}
          </button>
        </div>

      </div>

      {/* Live Telemetry Gateway Log Feed */}
      <div className={`rounded-xl border p-3 font-mono text-[11px] overflow-hidden ${
        isDark ? 'bg-slate-950 border-slate-800/80 text-slate-300' : 'bg-slate-900 border-slate-900 text-slate-200'
      }`}>
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-indigo-400" />
            <span>Vertex AI API Gateway Real-Time Telemetry Log</span>
          </div>
          <span>Status 200 OK</span>
        </div>

        <div className="space-y-1 max-h-32 overflow-y-auto">
          {apiLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between gap-2 py-0.5 hover:bg-slate-800/50 px-1 rounded transition-colors text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">[{log.time}]</span>
                <span className="font-bold text-indigo-400">{log.ucCode}</span>
                <span className="text-slate-300">{log.model}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-semibold">+{formatTokenNumber(log.tokens)} tk</span>
                <span className="text-slate-400">{log.latency}ms</span>
                <span className="text-amber-300">{log.cost}</span>
                <span className="text-emerald-500 font-bold">{log.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
