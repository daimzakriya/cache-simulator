import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2, Trophy, Clock, Cpu } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSimStore } from '../store/useSimStore';
import { runSimulationAsync } from '../lib/simulator/simulator';
import { GlassCard } from '../components/ui/GlassCard';
import { BadgePill } from '../components/ui/BadgePill';
import { cn } from '../lib/utils';
import type { SimulationResult, Policy } from '../lib/simulator/types';

interface ComparisonEntry extends SimulationResult {
  policyName: Policy;
}

export default function ComparisonPage() {
  const { config, addresses } = useSimStore();
  const [results, setResults] = useState<ComparisonEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (addresses.length === 0) return;
    let isMounted = true;
    setLoading(true);

    const runAll = async () => {
      const policies: Policy[] = ['LRU', 'FIFO', 'LFU'];
      const promises = policies.map(p => runSimulationAsync(addresses, { ...config, policy: p }));
      const allRes = await Promise.all(promises);
      
      if (isMounted) {
        setResults(allRes.map((r, i) => ({ ...r, policyName: policies[i] })));
        setLoading(false);
      }
    };

    runAll();
    return () => { isMounted = false; };
  }, [addresses, config]);

  if (addresses.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <GlassCard className="max-w-md text-center py-16">
          <BarChart3 size={48} className="mx-auto text-textMuted mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">No Trace Loaded</h2>
          <p className="text-textSecondary text-sm">Please load a trace to compare policies.</p>
        </GlassCard>
      </div>
    );
  }

  if (loading || !results) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
          <p className="text-primary-400 font-medium animate-pulse">Running Comparative Benchmarks...</p>
        </div>
      </div>
    );
  }

  // Determine winner by highest hit rate
  const winner = [...results].sort((a, b) => b.metrics.hitRate - a.metrics.hitRate)[0];

  const chartData = results.map(r => ({
    name: r.policyName,
    'Hit Rate %': +(r.metrics.hitRate * 100).toFixed(1),
    'AMAT': +r.metrics.amat.toFixed(2),
    'CPI': +r.metrics.cpi.toFixed(2),
  }));

  return (
    <div className="py-10 px-8 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Policy Comparison</h1>
        <p className="text-textSecondary">Benchmarking LRU, FIFO, and LFU under identical workloads.</p>
      </div>

      {/* AI Insight Card */}
      <GlassCard animatedBorder glow className="mb-10 bg-gradient-to-r from-primary-900/30 to-surface">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-[4px] bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shrink-0">
            <Trophy className="text-primary-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Benchmark Results</h3>
            <p className="text-textSecondary leading-relaxed text-sm">
              <strong className="text-white">{winner.policyName}</strong> performed best with a hit rate of <strong className="text-white">{(winner.metrics.hitRate * 100).toFixed(1)}%</strong>. 
              {winner.policyName === 'LRU' && " This suggests strong temporal locality in your trace, where recently accessed blocks are highly likely to be accessed again."}
              {winner.policyName === 'LFU' && " This suggests a concentrated hot-set of blocks that are accessed extremely frequently over the trace duration."}
              {winner.policyName === 'FIFO' && " This suggests sequential streaming patterns where older blocks are uniformly less useful."}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Policy Metric Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {results.map((res) => {
          const isWinner = res.policyName === winner.policyName;
          return (
            <motion.div key={res.policyName} whileHover={{ y: -4 }}>
              <GlassCard className={cn("p-6 relative overflow-hidden h-full", isWinner && "border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]")}>
                {isWinner && (
                  <div className="absolute top-0 right-0 p-4">
                    <BadgePill variant="amber" className="shadow-[0_0_10px_rgba(245,158,11,0.5)]">Winner</BadgePill>
                  </div>
                )}
                <h3 className="text-2xl font-black text-white mb-6">{res.policyName}</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-textMuted uppercase mb-1">Hit Rate</p>
                    <p className="text-3xl font-bold tabular-nums text-emerald-400">{(res.metrics.hitRate * 100).toFixed(1)}<span className="text-lg text-emerald-400/50">%</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(139,26,26,0.15)]">
                    <div>
                      <p className="text-[10px] text-textMuted uppercase flex items-center gap-1 mb-1"><Clock size={10}/> AMAT</p>
                      <p className="text-white font-mono">{res.metrics.amat.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-textMuted uppercase flex items-center gap-1 mb-1"><Cpu size={10}/> CPI</p>
                      <p className="text-white font-mono">{res.metrics.cpi.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Chart */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-bold text-white mb-6">Hit Rate Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} unit="%" />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                contentStyle={{ background: '#16181F', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px' }}
                itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="Hit Rate %" 
                fill="#7C3AED" 
                radius={[6,6,0,0]}
                label={{ position: 'top', fill: '#c4b5fd', fontSize: 12, fontWeight: 'bold', formatter: (v: any) => `${v}%` }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
