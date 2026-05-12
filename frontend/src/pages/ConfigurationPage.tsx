import { motion } from 'framer-motion';
import { useSimStore } from '../store/useSimStore';
import { SliderInput } from '../components/ui/SliderInput';
import { GlassCard } from '../components/ui/GlassCard';
import { BadgePill } from '../components/ui/BadgePill';
import { cn } from '../lib/utils';
import type { Policy } from '../lib/simulator/types';

const POLICIES: { id: Policy; name: string; desc: string }[] = [
  { id: 'LRU', name: 'Least Recently Used', desc: 'Evicts the block that has not been accessed for the longest time.' },
  { id: 'FIFO', name: 'First In, First Out', desc: 'Evicts the oldest block in the set based on insertion time.' },
  { id: 'LFU', name: 'Least Frequently Used', desc: 'Evicts the block with the lowest access count.' },
];

export default function ConfigurationPage() {
  const { config, setConfig } = useSimStore();

  const totalBlocks = Math.floor(config.cacheSizeBytes / config.blockSizeBytes);
  const numSets = Math.floor(totalBlocks / config.associativity);
  const offsetBits = Math.log2(config.blockSizeBytes);
  const indexBits = numSets > 1 ? Math.log2(numSets) : 0;
  
  let org = `${config.associativity}-Way Set Associative`;
  if (numSets === 1) org = 'Fully Associative';
  else if (config.associativity === 1) org = 'Direct-Mapped';

  return (
    <div className="py-10 px-8 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Configuration</h1>
        <p className="text-textSecondary">Design your cache architecture and cost parameters.</p>
      </div>

      {/* Sticky Summary Bar */}
      <div className="sticky top-6 z-30 mb-10">
        <GlassCard animatedBorder glow className="py-4 px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-textMuted mb-1 font-bold">Organization</p>
              <BadgePill variant={org === 'Direct-Mapped' ? 'cyan' : org === 'Fully Associative' ? 'amber' : 'violet'}>
                {org}
              </BadgePill>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-textMuted mb-1 font-bold">Geometry</p>
              <p className="font-mono text-sm text-white">
                {numSets} Set{numSets !== 1 ? 's' : ''} × {config.associativity} Way
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-textMuted mb-1 font-bold">Address Bits</p>
              <p className="font-mono text-sm text-textSecondary">
                Idx: <span className="text-white">{indexBits}</span> | Off: <span className="text-white">{offsetBits}</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left Column: Geometry */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-[rgba(139,26,26,0.15)] pb-2">Geometry</h2>
          
          <SliderInput
            label="Cache Size"
            value={config.cacheSizeBytes}
            min={256} max={65536} step={256} unit="B"
            onChange={(v) => setConfig({ cacheSizeBytes: v })}
            info="Total capacity of the cache in bytes."
          />
          
          <SliderInput
            label="Block Size"
            value={config.blockSizeBytes}
            min={16} max={256} step={16} unit="B"
            onChange={(v) => {
              // Enforce power of 2
              const p = Math.pow(2, Math.round(Math.log2(v)));
              setConfig({ blockSizeBytes: p });
            }}
            info="Size of a single cache line. Must be a power of 2."
          />
          
          <SliderInput
            label="Associativity (Ways)"
            value={config.associativity}
            min={1} max={16} step={1}
            onChange={(v) => setConfig({ associativity: v })}
            info="Number of cache lines per set. 1 = Direct Mapped."
          />
        </div>

        {/* Right Column: Cost & Policy */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-[rgba(139,26,26,0.15)] pb-2">Performance Costs</h2>
          
          <SliderInput
            label="Hit Time"
            value={config.hitTime}
            min={1} max={10} step={1} unit="cycles"
            onChange={(v) => setConfig({ hitTime: v })}
          />
          
          <SliderInput
            label="Miss Penalty"
            value={config.missPenalty}
            min={10} max={200} step={10} unit="cycles"
            onChange={(v) => setConfig({ missPenalty: v })}
          />

          <h2 className="text-lg font-bold text-white border-b border-[rgba(139,26,26,0.15)] pb-2 mt-8">Replacement Policy</h2>
          
          <div className="grid grid-cols-1 gap-3" role="group" aria-label="Replacement Policies">
            {POLICIES.map((p) => {
              const isSelected = config.policy === p.id;
              return (
                <motion.div
                  key={p.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setConfig({ policy: p.id })}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setConfig({ policy: p.id });
                    }
                  }}
                  className={cn(
                    'cursor-pointer rounded-sm p-4 transition-all duration-300 border relative overflow-hidden',
                    isSelected 
                      ? 'bg-[rgba(185,28,28,0.1)] border-[rgba(201,168,76,0.5)] shadow-[0_0_20px_rgba(201,168,76,0.15)]' 
                      : 'bg-white/5 border-[rgba(139,26,26,0.15)] hover:border-white/20'
                  )}
                >
                  {isSelected && (
                    <motion.div layoutId="policy-highlight" className="absolute inset-0 bg-gradient-to-r from-[rgba(201,168,76,0.2)] to-transparent pointer-events-none" />
                  )}
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h3 className={cn('font-bold tracking-tight', isSelected ? 'text-[#C9A84C]' : 'text-white')}>{p.id}</h3>
                      <p className="text-xs text-textMuted mt-1">{p.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="h-3 w-3 rounded-full bg-[#C9A84C] shadow-[0_0_10px_rgba(201,168,76,0.8)]" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
