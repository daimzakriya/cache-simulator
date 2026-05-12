// src/lib/simulator/policies.ts
import type { CacheSet } from './cache';

export interface ReplacementPolicy {
  name: string;
  chooseVictim(cset: CacheSet): number;
  onAccess(cset: CacheSet, way: number, tick: number): void;
  onFill(cset: CacheSet, way: number, tick: number): void;
}

export class LRUPolicy implements ReplacementPolicy {
  name = 'LRU';

  chooseVictim(cset: CacheSet): number {
    let minWay = 0;
    let minTick = Infinity;
    for (let i = 0; i < cset.lines.length; i++) {
      if (cset.lines[i].lastUsed < minTick) {
        minTick = cset.lines[i].lastUsed;
        minWay = i;
      }
    }
    return minWay;
  }

  onAccess(cset: CacheSet, way: number, tick: number): void {
    cset.lines[way].lastUsed = tick;
  }

  onFill(cset: CacheSet, way: number, tick: number): void {
    cset.lines[way].lastUsed = tick;
  }
}

export class FIFOPolicy implements ReplacementPolicy {
  name = 'FIFO';

  chooseVictim(cset: CacheSet): number {
    let minWay = 0;
    let minOrder = Infinity;
    for (let i = 0; i < cset.lines.length; i++) {
      if (cset.lines[i].insertOrder < minOrder) {
        minOrder = cset.lines[i].insertOrder;
        minWay = i;
      }
    }
    return minWay;
  }

  onAccess(_cset: CacheSet, _way: number, _tick: number): void {
    // FIFO doesn't change on access
  }

  onFill(cset: CacheSet, way: number, tick: number): void {
    cset.lines[way].insertOrder = tick;
  }
}

export class LFUPolicy implements ReplacementPolicy {
  name = 'LFU';

  chooseVictim(cset: CacheSet): number {
    let minWay = 0;
    let minFreq = Infinity;
    let minTick = Infinity;

    for (let i = 0; i < cset.lines.length; i++) {
      const line = cset.lines[i];
      if (line.frequency < minFreq) {
        minFreq = line.frequency;
        minTick = line.lastUsed;
        minWay = i;
      } else if (line.frequency === minFreq && line.lastUsed < minTick) {
        // Tie-breaker: LRU
        minTick = line.lastUsed;
        minWay = i;
      }
    }
    return minWay;
  }

  onAccess(cset: CacheSet, way: number, tick: number): void {
    cset.lines[way].frequency++;
    cset.lines[way].lastUsed = tick;
  }

  onFill(cset: CacheSet, way: number, tick: number): void {
    cset.lines[way].frequency = 1;
    cset.lines[way].lastUsed = tick;
  }
}

export function getPolicy(name: string): ReplacementPolicy {
  switch (name.toUpperCase()) {
    case 'LRU': return new LRUPolicy();
    case 'FIFO': return new FIFOPolicy();
    case 'LFU': return new LFUPolicy();
    default: throw new Error(`Unknown policy: ${name}`);
  }
}
