import React, { useState } from 'react';
import { X, Check, Trash2, Send, PlusCircle } from 'lucide-react';
import { formatTokenNumber } from '../utils/formatters';

export default function TopupRequestsModal({
  theme,
  isOpen,
  onClose,
  requests,
  setRequests,
  useCases,
  allocations,
  setAllocations,
  selectedMonth,
  role,
  initialTargetUc = null
}) {
  const isDark = theme === 'dark';
  const [targetUcId, setTargetUcId] = useState(initialTargetUc?.id || useCases[0]?.id || 'uc-1');
  const [requestedTokens, setRequestedTokens] = useState(200000);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason for the token top-up request.");
      return;
    }

    const targetUc = useCases.find(uc => uc.id === targetUcId);

    const newReq = {
      id: `req-${Date.now()}`,
      useCaseId: targetUcId,
      useCaseName: targetUc ? targetUc.name : 'AI Use Case',
      requestedBy: targetUc ? targetUc.owner : 'Use Case Owner',
      requestedTokens: Number(requestedTokens),
      month: selectedMonth,
      reason: reason.trim(),
      status: role === 'admin' ? 'approved' : 'pending',
      timestamp: 'Just now'
    };

    setRequests(prev => [newReq, ...prev]);

    if (role === 'admin') {
      setAllocations(prev => ({
        ...prev,
        [targetUcId]: {
          ...(prev[targetUcId] || {}),
          [selectedMonth]: ((prev[targetUcId] && prev[targetUcId][selectedMonth]) || 0) + Number(requestedTokens)
        }
      }));
    }

    setReason('');
  };

  const handleApprove = (req) => {
    setAllocations(prev => ({
      ...prev,
      [req.useCaseId]: {
        ...(prev[req.useCaseId] || {}),
        [req.month]: ((prev[req.useCaseId] && prev[req.useCaseId][req.month]) || 0) + req.requestedTokens
      }
    }));
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
  };

  const handleReject = (reqId) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r));
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      <div className={`glass-panel w-full max-w-2xl rounded-2xl border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
        isDark ? 'border-white/10' : 'border-slate-200 bg-white'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div>
            <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
              <PlusCircle className="w-5 h-5 text-indigo-500" />
              Token Top-Up & Quota Adjustment Portal
            </h3>
            <p className={`text-xs ${textMuted}`}>
              Request or approve emergency token budget top-ups for active AI use cases
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

        {/* Submit New Request Form */}
        <form onSubmit={handleSubmitRequest} className={`mb-6 p-4 rounded-xl border space-y-3 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {role === 'admin' ? 'Direct Admin Token Grant' : 'Submit New Top-Up Request'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Use Case</label>
              <select
                value={targetUcId}
                onChange={(e) => setTargetUcId(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3"
              >
                {useCases.map(uc => (
                  <option key={uc.id} value={uc.id} className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                    {uc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Requested Top-up Tokens</label>
              <input
                type="number"
                step="50000"
                min="10000"
                value={requestedTokens}
                onChange={(e) => setRequestedTokens(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3 font-mono"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Business Justification / Reason</label>
            <input
              type="text"
              placeholder="e.g. High volume ticket surge after v2 release..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full glass-input text-xs rounded-lg py-2 px-3"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {role === 'admin' ? 'Grant Tokens Immediately' : 'Submit Request to Admin'}
            </button>
          </div>
        </form>

        {/* Existing Requests List */}
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${textMuted}`}>
            Top-Up Requests History ({requests.length})
          </h4>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {requests.length === 0 ? (
              <div className={`text-center py-6 text-xs ${textMuted}`}>
                No top-up requests recorded yet.
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className={`${textPrimary} font-semibold`}>{req.useCaseName}</strong>
                      <span className={`text-[10px] font-mono ${textMuted}`}>({req.month} 2026)</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30'
                          : req.status === 'rejected'
                          ? 'bg-red-500/20 text-red-500 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-600 border-amber-500/30'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    <p className={`mt-1 italic ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>"{req.reason}"</p>
                    <div className={`text-[10px] mt-1 ${textMuted}`}>
                      Requested by {req.requestedBy} • {req.timestamp}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-indigo-600 text-sm">
                      +{formatTokenNumber(req.requestedTokens)}
                    </span>

                    {role === 'admin' && req.status === 'pending' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApprove(req)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                          title="Approve & Grant Tokens"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                          title="Reject Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
