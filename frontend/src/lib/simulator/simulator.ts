// src/lib/simulator/simulator.ts
import { Cache } from './cache';
import { getPolicy } from './policies';
import type { CacheConfig, SimulationResult, AccessResult, CacheLineSnapshot } from './types';

export class CacheSimulator {
  config: CacheConfig;
  cache: Cache;
  policy: ReturnType<typeof getPolicy>;
  
  hits = 0;
  misses = 0;
  tick = 0;
  events: AccessResult[] = [];

  constructor(config: CacheConfig) {
    this.config = config;
    this.cache = new Cache(config.cacheSizeBytes, config.blockSizeBytes, config.associativity);
    this.policy = getPolicy(config.policy);
  }

  access(address: number): AccessResult {
    const { tag, setIndex, blockOffset } = this.cache.decodeAddress(address);
    const cset = this.cache.sets[setIndex];
    this.tick++;

    const hitWay = cset.findLine(tag);
    let hit = false;
    let targetWay = 0;
    let evictedTag: number | null = null;

    if (hitWay !== null) {
      // HIT
      this.hits++;
      hit = true;
      targetWay = hitWay;
      this.policy.onAccess(cset, hitWay, this.tick);
    } else {
      // MISS
      this.misses++;
      const emptyWay = cset.hasEmptyLine();

      if (emptyWay !== null) {
        targetWay = emptyWay;
      } else {
        targetWay = this.policy.chooseVictim(cset);
        evictedTag = cset.lines[targetWay].tag;
      }

      // Load block
      const line = cset.lines[targetWay];
      line.valid = true;
      line.tag = tag;
      line.frequency = 0;
      line.lastUsed = 0;
      line.insertOrder = 0;
      
      this.policy.onFill(cset, targetWay, this.tick);
    }

    // Capture snapshot for visualization (deep copy needed for sets/lines we care about,
    // but to save memory, we only take a snapshot of valid lines)
    const snapshot: CacheLineSnapshot[] = [];
    for (let si = 0; si < this.cache.sets.length; si++) {
      const s = this.cache.sets[si];
      for (let wi = 0; wi < s.lines.length; wi++) {
        const l = s.lines[wi];
        if (l.valid) {
          snapshot.push({
            set: si,
            way: wi,
            valid: l.valid,
            tag: l.tag,
            frequency: l.frequency,
            lastUsed: l.lastUsed,
          });
        }
      }
    }

    const event: AccessResult = {
      tick: this.tick,
      address,
      tag,
      setIndex,
      blockOffset,
      hit,
      way: targetWay,
      evictedTag,
      cacheSnapshot: snapshot,
    };

    this.events.push(event);
    return event;
  }

  run(addresses: number[]): SimulationResult {
    for (let i = 0; i < addresses.length; i++) {
      this.access(addresses[i]);
    }

    const totalAccesses = this.hits + this.misses;
    const hitRate = totalAccesses > 0 ? this.hits / totalAccesses : 0;
    const missRate = totalAccesses > 0 ? this.misses / totalAccesses : 0;

    const amat = this.config.hitTime + missRate * this.config.missPenalty;
    const cpi = this.config.baseCpi + missRate * this.config.missPenalty;

    return {
      metrics: {
        totalAccesses,
        hits: this.hits,
        misses: this.misses,
        hitRate,
        missRate,
        amat,
        cpi,
      },
      trace: this.events,
      organization: this.cache.getOrganization(),
      numSets: this.cache.numSets,
      associativity: this.cache.associativity,
      blockOffsetBits: this.cache.blockOffsetBits,
      indexBits: this.cache.indexBits,
    };
  }
}

// Helper to run simulation completely asynchronously so it doesn't block UI
export function runSimulationAsync(addresses: number[], config: CacheConfig): Promise<SimulationResult> {
  return new Promise((resolve) => {
    // In a real huge-scale app, we'd use a Web Worker.
    // For now, a setTimeout pushes it to the macro-task queue, 
    // letting React render loading states first.
    setTimeout(() => {
      const sim = new CacheSimulator(config);
      const res = sim.run(addresses);
      resolve(res);
    }, 50);
  });
}
