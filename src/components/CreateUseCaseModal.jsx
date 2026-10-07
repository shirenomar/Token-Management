import React, { useState } from 'react';
import { X, FolderKanban, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CreateUseCaseModal({
  theme,
  isOpen,
  onClose,
  useCases,
  setUseCases
}) {
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Operations');
  const [priority, setPriority] = useState('Tier 2 - High');
  const [owner, setOwner] = useState('');
  const [sharePercentage, setSharePercentage] = useState(15);
  const [color, setColor] = useState('#6366F1');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  // Active use cases sum ONLY (excluding frozen use cases)
  const activeUseCases = useCases.filter(uc => !uc.isFrozen);
  const existingActiveSum = activeUseCases.reduce((acc, uc) => acc + (uc.sharePercentage || 0), 0);
  const newTotalActiveSum = existingActiveSum + Number(sharePercentage);
  const isOver100 = newTotalActiveSum > 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide a Use Case Name.");
      return;
    }

    if (isOver100) {
      alert(`Cannot create Use Case. Active total share percentage (${newTotalActiveSum}%) exceeds 100%. Remaining available active share is ${100 - existingActiveSum}%.`);
      return;
    }

    const newUc = {
      id: `uc-${Date.now()}`,
      name: name.trim(),
      category,
      priority,
      owner: owner.trim() || 'Use Case Lead',
      description: description.trim() || 'Automated AI solution.',
      color,
      status: 'active',
      isFrozen: false,
      sharePercentage: Number(sharePercentage)
    };

    setUseCases(prev => [...prev, newUc]);
    setName('');
    setDescription('');
    setOwner('');
    onClose();
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

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
            <h3 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
              <FolderKanban className="w-5 h-5 text-purple-500" />
              Add New AI Use Case
            </h3>
            <p className={`text-xs ${textMuted}`}>
              Register a new AI Use Case. Total share % across ACTIVE (unfrozen) use cases must equal 100%.
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

        {/* Active Share Validation Bar */}
        <div className={`p-3 rounded-xl border mb-4 flex items-center justify-between text-xs font-bold ${
          isOver100
            ? 'bg-red-500/10 border-red-500/30 text-red-600'
            : newTotalActiveSum === 100
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600'
        }`}>
          <div className="flex items-center gap-2">
            {isOver100 ? (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            )}
            <span>
              {isOver100 ? (
                <span>Exceeds 100%! Active share sum will be <strong>{newTotalActiveSum}%</strong></span>
              ) : (
                <span>Existing Active Share: <strong>{existingActiveSum}%</strong> + New: <strong>{sharePercentage}%</strong></span>
              )}
            </span>
          </div>
          <div>Active Total: {newTotalActiveSum}% / 100%</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Name */}
          <div>
            <label className={`block font-semibold mb-1 ${textPrimary}`}>
              Use Case Name
            </label>
            <input
              type="text"
              placeholder="e.g. Legal Contract Analyzer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input text-xs rounded-lg py-2 px-3 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className={`block font-semibold mb-1 ${textPrimary}`}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3 font-medium"
              >
                <option value="Customer Operations" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Customer Operations</option>
                <option value="Enterprise Productivity" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Enterprise Productivity</option>
                <option value="Engineering & Tech" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Engineering & Tech</option>
                <option value="Growth & Content" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Growth & Content</option>
                <option value="Executive & Strategy" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Executive & Strategy</option>
                <option value="Legal & Compliance" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Legal & Compliance</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className={`block font-semibold mb-1 ${textPrimary}`}>Priority Tier</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3 font-medium"
              >
                <option value="Tier 1 - Critical" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Tier 1 - Critical</option>
                <option value="Tier 2 - High" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Tier 2 - High</option>
                <option value="Tier 3 - Medium" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Tier 3 - Medium</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Lead / Owner */}
            <div>
              <label className={`block font-semibold mb-1 ${textPrimary}`}>Lead / Owner Name</label>
              <input
                type="text"
                placeholder="e.g. Rachel Green"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3"
              />
            </div>

            {/* Target Share % */}
            <div>
              <label className={`block font-semibold mb-1 ${textPrimary}`}>Target Active Share % (100% Max)</label>
              <input
                type="number"
                min="1"
                max={100 - existingActiveSum > 0 ? 100 - existingActiveSum : 100}
                value={sharePercentage}
                onChange={(e) => setSharePercentage(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3 font-mono font-bold"
              />
            </div>
          </div>

          {/* Color & Description */}
          <div className="grid grid-cols-4 gap-3 items-center">
            <div className="col-span-1">
              <label className={`block font-semibold mb-1 ${textPrimary}`}>Badge Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-9 p-0.5 rounded cursor-pointer border"
              />
            </div>
            <div className="col-span-3">
              <label className={`block font-semibold mb-1 ${textPrimary}`}>Description</label>
              <input
                type="text"
                placeholder="Briefly describe AI use case purpose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full glass-input text-xs rounded-lg py-2 px-3"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-white/10">
            <button
              type="submit"
              disabled={isOver100}
              className={`px-4 py-2 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                isOver100 ? 'bg-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Create Use Case
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
