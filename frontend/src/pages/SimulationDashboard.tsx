import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, Activity, Target, Zap, Clock, FileWarning } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useSimStore } from '../store/useSimStore';
import { runSimulationAsync } from '../lib/simulator/simulator';
import { GlassCard } from '../components/ui/GlassCard';
import { MetricCard } from '../components/ui/MetricCard';
import { BadgePill } from '../components/ui/BadgePill';
import { cn } from '../lib/utils';
import type { AccessResult } from '../lib/simulator/types';

export default function SimulationDashboard() {
  const { config, addresses, result, setResult, isLoading, setLoading } = useSimStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms per step

  // Run full simulation in background immediately when we mount/config changes
  useEffect(() => {
    if (addresses.length === 0) return;
    let isMounted = true;
    
    setLoading(true);
    runSimulationAsync(addresses, config).then(res => {
      if (isMounted) {
        setResult(res);
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [addresses, config, setResult, setLoading]);

  // Playback Loop
  useEffect(() => {
    if (!isPlaying || !result || currentStep >= result.trace.length) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, playbackSpeed);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, result, playbackSpeed]);

  const fullChartData = useMemo(() => {
    if (!result) return [];
    let hits = 0;
    return result.trace.map((t, i) => {
      if (t.hit) hits++;
      return { step: i + 1, hitRate: +((hits / (i + 1)) * 100).toFixed(1) };
    });
  }, [result]);

  if (addresses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <GlassCard className="max-w-md text-center py-16">
          <FileWarning size={48} className="mx-auto text-textMuted mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">No Trace Loaded</h2>
          <p className="text-textSecondary text-sm mb-8">Go to the Trace Input page to generate or upload addresses.</p>
        </GlassCard>
      </div>
    );
  }

  if (isLoading || !result) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[rgba(139,26,26,0.15)] border-t-primary-500 rounded-full animate-spin mb-4" />
          <p className="text-primary-400 font-medium animate-pulse">Running Simulation Engine...</p>
        </div>
      </div>
    );
  }

  const currentEvent: AccessResult | undefined = result.trace[currentStep - 1];
  const chartData = fullChartData.slice(0, currentStep);

  return (
    <div className="py-10 px-8 pb-32">
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
          <p className="text-textSecondary">Real-time cache state and performance visualization.</p>
        </div>
        <div className="flex items-center gap-4 flex-1 max-w-md ml-auto">
          <input 
            type="range" 
            min={0} 
            max={result.trace.length} 
            value={currentStep} 
            onChange={(e) => setCurrentStep(Number(e.target.value))}
            className="flex-1 accent-primary-500 cursor-pointer"
          />
          <BadgePill variant="violet" className="shrink-0">Step {currentStep} / {result.trace.length}</BadgePill>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard label="Total Accesses" value={currentStep} icon={Activity} />
        <MetricCard label="Hit Rate" value={chartData[chartData.length - 1]?.hitRate || 0} icon={Target} color="success" format="percent" />
        <MetricCard label="AMAT" value={result.metrics.amat} icon={Clock} color="warning" unit="cycles" format="fixed2" />
        <MetricCard label="Hits" value={currentEvent ? result.trace.slice(0, currentStep).filter(e => e.hit).length : 0} icon={Zap} color="success" />
        <MetricCard label="Misses" value={currentEvent ? result.trace.slice(0, currentStep).filter(e => !e.hit).length : 0} icon={FileWarning} color="danger" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Cache Grid */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Cache State</h3>
              
              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlaybackSpeed(s => s === 1000 ? 500 : s === 500 ? 250 : 1000)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-textSecondary hover:text-white bg-white/5 hover:bg-white/10 transition-colors mr-2 border border-[rgba(139,26,26,0.15)]"
                  aria-label="Toggle playback speed"
                >
                  {playbackSpeed === 1000 ? '0.5x' : playbackSpeed === 500 ? '1x' : '2x'}
                </button>
                <div className="flex items-center gap-2 bg-white/5 border border-[rgba(139,26,26,0.15)] rounded-full p-1">
                  <button aria-label="Reset simulation" onClick={() => setCurrentStep(0)} className="p-2 hover:bg-white/10 rounded-full text-textSecondary hover:text-white transition-colors">
                    <RotateCcw size={14} />
                  </button>
                  <button 
                    aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
                    onClick={() => setIsPlaying(!isPlaying)} 
                    className="p-2 bg-primary-600 hover:bg-primary-500 rounded-full text-white shadow-glow transition-all"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                  </button>
                  <button aria-label="Step forward" onClick={() => setCurrentStep(Math.min(currentStep + 1, result.trace.length))} className="p-2 hover:bg-white/10 rounded-full text-textSecondary hover:text-white transition-colors">
                    <FastForward size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Cache Grid Legend */}
            <div className="flex items-center gap-4 mb-4 text-[10px] uppercase font-bold tracking-wider text-textMuted border-b border-[rgba(139,26,26,0.15)] pb-4">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-[rgba(139,26,26,0.15)] bg-white/5" /> Empty</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-primary-500/30 bg-primary-500/10" /> Filled</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-emerald-500/50 bg-emerald-500/20" /> Hit</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-red-500/50 bg-red-500/20" /> Miss</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm border border-amber-500/50 bg-amber-500/20" /> Evicted</div>
            </div>

            {/* Cache Grid Visualizer */}
            <div className="bg-surfaceElevated rounded-sm border border-[rgba(139,26,26,0.15)] p-4 overflow-x-auto min-h-[300px]">
              {result.numSets <= 16 ? (
                <div className="flex flex-col gap-2 min-w-max">
                  {Array.from({ length: result.numSets }).map((_, si) => (
                    <div key={si} className="flex items-center gap-4">
                      <div className="w-12 text-right font-mono text-xs text-textMuted">Set {si}</div>
                      <div className="flex gap-2">
                        {Array.from({ length: result.associativity }).map((_, wi) => {
                          const snap = currentEvent?.cacheSnapshot.find(s => s.set === si && s.way === wi);
                          const isActive = currentEvent?.setIndex === si && currentEvent?.way === wi;
                          let cellClass = "empty";
                          if (snap) {
                            cellClass = "filled";
                            if (isActive) {
                              cellClass = currentEvent.hit ? "hit" : "miss";
                              if (currentEvent.evictedTag !== null) cellClass = "evicted";
                            }
                          }
                          return (
                            <div key={wi} className={cn("cache-cell w-16 h-12 relative overflow-hidden", cellClass)}>
                              {snap && <span className="font-bold">{snap.tag !== null ? `0x${snap.tag.toString(16).toUpperCase()}` : ''}</span>}
                              {isActive && <motion.div layoutId="cell-pulse" className="absolute inset-0 bg-white/20 animate-pulse" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-textMuted text-sm">
                  Cache too large to visualize cell-by-cell ({result.numSets} sets).
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right: Charts & Logs */}
        <div className="space-y-6">
          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-white mb-4">Hit Rate Timeline</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="step" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
                  <Tooltip 
                    contentStyle={{ background: '#16181F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Line type="monotone" dataKey="hitRate" stroke="#06B6D4" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#06B6D4' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-bold text-white mb-4">Event Log</h3>
            <div className="h-48 overflow-y-auto space-y-2 pr-2">
              <AnimatePresence>
                {result.trace.slice(Math.max(0, currentStep - 5), currentStep).reverse().map((e) => (
                  <motion.div 
                    key={e.tick}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-lg bg-surfaceElevated border border-[rgba(139,26,26,0.15)] flex justify-between items-center"
                  >
                    <div>
                      <p className="font-mono text-xs text-white">Addr: {e.address}</p>
                      <p className="text-[10px] text-textMuted font-mono mt-0.5">Tag: {e.tag} | Set: {e.setIndex}</p>
                    </div>
                    <BadgePill variant={e.hit ? 'emerald' : 'red'}>{e.hit ? 'HIT' : 'MISS'}</BadgePill>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
