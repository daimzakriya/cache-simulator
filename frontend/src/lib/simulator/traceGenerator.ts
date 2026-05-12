// src/lib/simulator/traceGenerator.ts
import type { TracePattern } from './types';

// Simple mulberry32 PRNG for deterministic trace generation
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function generateTrace(pattern: TracePattern, count: number, addressSpace = 0xFFFF, seed = 42): number[] {
  const rng = mulberry32(seed);
  const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  
  const addresses: number[] = [];
  const blockSize = 64; // assume 64B for generation alignment

  if (pattern === 'sequential') {
    for (let i = 0; i < count; i++) {
      addresses.push((i * blockSize) % addressSpace);
    }
  } 
  
  else if (pattern === 'random') {
    for (let i = 0; i < count; i++) {
      const addr = randInt(0, addressSpace);
      addresses.push(addr - (addr % blockSize)); // align
    }
  }
  
  else if (pattern === 'temporal') {
    // 80% hits a small hot set of 5 blocks
    const hotSet = Array.from({ length: 5 }, () => {
      const a = randInt(0, Math.floor(addressSpace / 4));
      return a - (a % blockSize);
    });
    for (let i = 0; i < count; i++) {
      if (rng() < 0.8) {
        addresses.push(hotSet[randInt(0, hotSet.length - 1)]);
      } else {
        const addr = randInt(0, addressSpace);
        addresses.push(addr - (addr % blockSize));
      }
    }
  }
  
  else if (pattern === 'spatial') {
    // Walk in strides, occasionally jump
    let base = randInt(0, Math.floor(addressSpace / 2));
    base = base - (base % blockSize);
    for (let i = 0; i < count; i++) {
      addresses.push(base % addressSpace);
      if (rng() < 0.1) {
        base = randInt(0, Math.floor(addressSpace / 2));
        base = base - (base % blockSize);
      } else {
        base += blockSize;
      }
    }
  }
  
  else if (pattern === 'thrashing') {
    // Working set just slightly larger than typical cache
    const workingSetSize = 16; 
    const hotSet = Array.from({ length: workingSetSize }, (_, i) => (i * blockSize) % addressSpace);
    for (let i = 0; i < count; i++) {
      addresses.push(hotSet[i % workingSetSize]);
    }
  }
  
  else if (pattern === 'mixed') {
    // A mix of sequential, temporal, and random
    for (let i = 0; i < count; i++) {
      const r = rng();
      if (r < 0.3) addresses.push((i * blockSize) % addressSpace);
      else if (r < 0.8) addresses.push(randInt(0, 5) * blockSize); // tight temporal
      else {
        const a = randInt(0, addressSpace);
        addresses.push(a - (a % blockSize));
      }
    }
  }

  return addresses;
}
