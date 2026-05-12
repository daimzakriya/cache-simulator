import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Shuffle, FileCode2, Play } from 'lucide-react';
import { useSimStore } from '../store/useSimStore';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { BadgePill } from '../components/ui/BadgePill';
import { cn } from '../lib/utils';
import { generateTrace } from '../lib/simulator/traceGenerator';
import type { TracePattern } from '../lib/simulator/types';

type Tab = 'manual' | 'upload' | 'generate';

export default function TraceInputPage() {
  const { addresses, setAddresses } = useSimStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  
  // Manual
  const [textVal, setTextVal] = useState(addresses.join('\n'));
  
  // Generate
  const [pattern, setPattern] = useState<TracePattern>('mixed');
  const [genCount, setGenCount] = useState(100);

  const handleApplyText = () => {
    const nums = textVal.split(/[\s,]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    setAddresses(nums);
  };

  const handleGenerate = () => {
    const arr = generateTrace(pattern, genCount);
    setAddresses(arr);
    setTextVal(arr.join('\n'));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setTextVal(content);
      const nums = content.split(/[\s,]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
      setAddresses(nums);
    };
    reader.readAsText(file);
  };

  return (
    <div className="py-10 px-8 pb-32 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Trace Input</h1>
          <p className="text-textSecondary">Provide memory addresses for the simulation.</p>
        </div>
        <div className="text-right">
          <BadgePill variant={addresses.length > 0 ? 'emerald' : 'slate'} className="mb-2">
            {addresses.length.toLocaleString()} Addresses Loaded
          </BadgePill>
          {addresses.length > 0 && (
            <div className="mt-2">
               <GlowButton onClick={() => navigate('/simulate')} className="px-4 py-2 text-xs">
                 Run Simulation <Play size={14} className="ml-1" />
               </GlowButton>
            </div>
          )}
        </div>
      </div>

      {/* Animated Tabs */}
      <div className="flex gap-2 p-1.5 bg-white/[0.02] border border-[rgba(139,26,26,0.15)] rounded-[4px] mb-8 w-fit backdrop-blur-md">
        {[
          { id: 'generate', label: 'Synthetic Generator', icon: Shuffle },
          { id: 'manual', label: 'Manual Entry', icon: FileCode2 },
          { id: 'upload', label: 'File Upload', icon: Upload },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as Tab)}
            className={cn(
              "relative px-6 py-2.5 text-sm font-semibold rounded-sm flex items-center gap-2 transition-colors",
              activeTab === t.id ? "text-white" : "text-textMuted hover:text-textSecondary"
            )}
          >
            {activeTab === t.id && (
              <motion.div layoutId="traceTab" className="absolute inset-0 bg-white/10 rounded-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
            )}
            <t.icon size={16} className="relative z-10" />
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'generate' && (
            <GlassCard className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(['sequential', 'spatial', 'temporal', 'random', 'thrashing', 'mixed'] as TracePattern[]).map((p) => {
                  const descriptions: Record<TracePattern, string> = {
                    sequential: 'Linear stride through memory addresses.',
                    spatial: 'Accesses to tightly clustered adjacent addresses.',
                    temporal: 'Repeated accesses to the same small working set.',
                    random: 'Completely random uniformly distributed accesses.',
                    thrashing: 'Accesses that intentionally cause constant eviction.',
                    mixed: 'A realistic blend of spatial and temporal locality.'
                  };
                  return (
                    <div
                      key={p}
                      onClick={() => setPattern(p)}
                      className={cn(
                        "p-4 rounded-sm cursor-pointer border transition-all",
                        pattern === p ? "bg-primary-500/20 border-primary-500/50" : "bg-white/5 border-[rgba(139,26,26,0.15)] hover:border-white/20"
                      )}
                    >
                      <p className="font-bold text-white capitalize">{p}</p>
                      <p className="text-[10px] text-textMuted mt-1 leading-tight">{descriptions[p]}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-textMuted mb-2 uppercase">Access Count</label>
                  <input
                    type="number"
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="input-premium font-mono"
                  />
                </div>
                <GlowButton onClick={handleGenerate} className="mb-0.5">Generate Trace</GlowButton>
              </div>
            </GlassCard>
          )}

          {activeTab === 'manual' && (
            <GlassCard className="p-0 overflow-hidden flex flex-col h-[400px]">
              <div className="bg-surfaceElevated px-4 py-2 border-b border-[rgba(139,26,26,0.15)] flex items-center justify-between">
                <span className="text-xs font-mono text-textMuted">addresses.txt</span>
              </div>
              <textarea
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                className="flex-1 w-full bg-transparent p-6 text-sm font-mono text-primary-100 outline-none resize-none leading-relaxed"
                placeholder="Enter addresses, one per line or comma separated..."
                spellCheck={false}
              />
              <div className="p-4 bg-surfaceElevated border-t border-[rgba(139,26,26,0.15)] flex justify-end">
                <GlowButton onClick={handleApplyText} className="px-6 py-2 text-sm">Apply Text</GlowButton>
              </div>
            </GlassCard>
          )}

          {activeTab === 'upload' && (
            <div className="h-[300px] border-2 border-dashed border-white/20 hover:border-primary-500/50 hover:bg-primary-500/5 rounded-[4px] flex flex-col items-center justify-center transition-all cursor-pointer relative">
              <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Upload size={24} className="text-textSecondary" />
              </div>
              <p className="text-white font-bold text-lg mb-1">Drag and drop file</p>
              <p className="text-textMuted text-sm">Supports .txt or .csv with numeric addresses</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
