import { GlassCard } from '../components/ui/GlassCard';

export default function AboutPage() {
  return (
    <div className="py-10 px-8 pb-32 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">Computer Architecture Theory</h1>
        <p className="text-lg text-textSecondary font-light">Understanding the principles behind cache memory simulation.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-[rgba(139,26,26,0.15)] pb-2">Cache Organization</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-bold text-primary-300 mb-2">Direct-Mapped</h3>
              <p className="text-sm text-textSecondary leading-relaxed mb-4">
                Each memory block maps to exactly one set in the cache. Very fast lookup, but highly susceptible to conflict misses if multiple active blocks map to the same set.
              </p>
              <code className="text-xs font-mono bg-black/30 p-2 rounded block text-emerald-400">set = address % num_sets</code>
            </GlassCard>
            
            <GlassCard>
              <h3 className="text-lg font-bold text-primary-300 mb-2">Fully Associative</h3>
              <p className="text-sm text-textSecondary leading-relaxed mb-4">
                A block can be placed anywhere in the cache. No conflict misses, but requires expensive hardware comparators to check all tags simultaneously.
              </p>
              <code className="text-xs font-mono bg-black/30 p-2 rounded block text-emerald-400">set = 0 (only 1 set total)</code>
            </GlassCard>

            <GlassCard className="md:col-span-2">
              <h3 className="text-lg font-bold text-primary-300 mb-2">Set-Associative</h3>
              <p className="text-sm text-textSecondary leading-relaxed mb-4">
                A compromise between Direct-Mapped and Fully Associative. The cache is divided into sets, and each set contains N ways. A block maps to a specific set, but can be placed in any of the N ways within that set.
              </p>
            </GlassCard>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-[rgba(139,26,26,0.15)] pb-2">Replacement Policies</h2>
          <div className="space-y-4">
            <GlassCard animatedBorder>
              <h3 className="text-xl font-bold text-white mb-1">Least Recently Used (LRU)</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Evicts the block that has not been accessed for the longest time. Highly effective for traces with strong temporal locality, but requires hardware to maintain access history.
              </p>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-1">First In, First Out (FIFO)</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Evicts the oldest block in the set, regardless of how often it is accessed. Simple to implement in hardware using a round-robin pointer.
              </p>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-1">Least Frequently Used (LFU)</h3>
              <p className="text-sm text-textSecondary leading-relaxed">
                Evicts the block that has been accessed the fewest number of times. Good for workloads where some blocks are accessed very often, but vulnerable to "cache pollution" if a block is accessed heavily once and never again.
              </p>
            </GlassCard>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-[rgba(139,26,26,0.15)] pb-2">Performance Metrics</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <GlassCard glow>
              <h3 className="text-lg font-bold text-amber-400 mb-2">AMAT</h3>
              <p className="text-[10px] uppercase font-bold text-textMuted mb-2">Average Memory Access Time</p>
              <p className="text-sm text-textSecondary leading-relaxed mb-4">
                The average time it takes to access a memory block, factoring in both hits and misses.
              </p>
              <div className="bg-black/30 p-3 rounded-lg border border-[rgba(139,26,26,0.15)]">
                <code className="text-xs font-mono text-white">AMAT = Hit Time + (Miss Rate × Miss Penalty)</code>
              </div>
            </GlassCard>

            <GlassCard glow>
              <h3 className="text-lg font-bold text-[#E8C97A] mb-2">CPI</h3>
              <p className="text-[10px] uppercase font-bold text-textMuted mb-2">Cycles Per Instruction</p>
              <p className="text-sm text-textSecondary leading-relaxed mb-4">
                The average number of clock cycles needed to execute an instruction, including memory stall cycles.
              </p>
              <div className="bg-black/30 p-3 rounded-lg border border-[rgba(139,26,26,0.15)]">
                <code className="text-xs font-mono text-white">CPI = Base CPI + (Miss Rate × Miss Penalty)</code>
              </div>
            </GlassCard>
          </div>
        </section>
      </div>
    </div>
  );
}
