// src/lib/simulator/types.ts
export type Policy = 'LRU' | 'FIFO' | 'LFU';
export type TracePattern = 'sequential' | 'random' | 'temporal' | 'spatial' | 'thrashing' | 'mixed';

export interface CacheConfig {
  cacheSizeBytes: number;
  blockSizeBytes: number;
  associativity: number;
  policy: Policy;
  hitTime: number;
  missPenalty: number;
  baseCpi: number;
}

export interface CacheLineState {
  valid: boolean;
  tag: number | null;
  frequency: number;
  lastUsed: number;
  insertOrder: number;
}

export interface AccessResult {
  tick: number;
  address: number;
  tag: number;
  setIndex: number;
  blockOffset: number;
  hit: boolean;
  way: number;
  evictedTag: number | null;
  cacheSnapshot: CacheLineSnapshot[];
}

export interface CacheLineSnapshot {
  set: number;
  way: number;
  valid: boolean;
  tag: number | null;
  frequency: number;
  lastUsed: number;
}

export interface SimulationMetrics {
  totalAccesses: number;
  hits: number;
  misses: number;
  hitRate: number;
  missRate: number;
  amat: number;
  cpi: number;
}

export interface SimulationResult {
  metrics: SimulationMetrics;
  trace: AccessResult[];
  organization: string;
  numSets: number;
  associativity: number;
  blockOffsetBits: number;
  indexBits: number;
}
