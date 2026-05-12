// src/lib/simulator/cache.ts
import type { CacheLineState } from './types';

export class CacheSet {
  lines: CacheLineState[];

  constructor(associativity: number) {
    this.lines = Array.from({ length: associativity }, () => ({
      valid: false,
      tag: null,
      frequency: 0,
      lastUsed: 0,
      insertOrder: 0,
    }));
  }

  findLine(tag: number): number | null {
    const idx = this.lines.findIndex((l) => l.valid && l.tag === tag);
    return idx === -1 ? null : idx;
  }

  hasEmptyLine(): number | null {
    const idx = this.lines.findIndex((l) => !l.valid);
    return idx === -1 ? null : idx;
  }
}

export class Cache {
  cacheSizeBytes: number;
  blockSizeBytes: number;
  associativity: number;
  numSets: number;
  blockOffsetBits: number;
  indexBits: number;
  sets: CacheSet[];

  constructor(cacheSizeBytes: number, blockSizeBytes: number, associativity: number) {
    if (blockSizeBytes <= 0 || (blockSizeBytes & (blockSizeBytes - 1)) !== 0) {
      throw new Error('Block size must be a positive power of 2.');
    }
    const totalBlocks = Math.floor(cacheSizeBytes / blockSizeBytes);
    if (totalBlocks < associativity) {
      throw new Error('Cache too small for the requested associativity.');
    }

    this.cacheSizeBytes = cacheSizeBytes;
    this.blockSizeBytes = blockSizeBytes;
    this.associativity = associativity;
    this.numSets = Math.floor(totalBlocks / associativity);
    
    this.blockOffsetBits = Math.log2(blockSizeBytes);
    this.indexBits = this.numSets > 1 ? Math.log2(this.numSets) : 0;

    this.sets = Array.from({ length: this.numSets }, () => new CacheSet(associativity));
  }

  decodeAddress(address: number) {
    // We use Math.floor and division instead of bitwise operators for tags 
    // because JS bitwise operators are 32-bit signed, which breaks on large addresses.
    const blockSize = this.blockSizeBytes;
    const blockOffset = address % blockSize;
    const blockAddress = Math.floor(address / blockSize);
    const setIndex = this.numSets > 1 ? blockAddress % this.numSets : 0;
    const tag = Math.floor(blockAddress / this.numSets);

    return { tag, setIndex, blockOffset };
  }

  getOrganization(): string {
    if (this.numSets === 1) return 'Fully Associative';
    if (this.associativity === 1) return 'Direct-Mapped';
    return `${this.associativity}-Way Set Associative`;
  }
}
