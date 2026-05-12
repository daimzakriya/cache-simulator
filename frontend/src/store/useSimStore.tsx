// src/store/useSimStore.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CacheConfig, SimulationResult } from '../lib/simulator/types';

interface ComparisonResult {
  comparison: (SimulationResult['metrics'] & { policy: string })[];
}

interface SimState {
  config: CacheConfig;
  addresses: number[];
  result: SimulationResult | null;
  comparison: ComparisonResult | null;
  isLoading: boolean;
  error: string | null;
  setConfig: (c: Partial<CacheConfig>) => void;
  setAddresses: (a: number[]) => void;
  setResult: (r: SimulationResult | null) => void;
  setComparison: (c: ComparisonResult | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

const defaultConfig: CacheConfig = {
  cacheSizeBytes: 1024,
  blockSizeBytes: 64,
  associativity: 1,
  policy: 'LRU',
  hitTime: 1,
  missPenalty: 100,
  baseCpi: 1,
};

export const SimContext = createContext<SimState | null>(null);

export function useSimStore(): SimState {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSimStore must be used inside SimProvider');
  return ctx;
}

export function SimProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<CacheConfig>(defaultConfig);
  const [addresses, setAddresses] = useState<number[]>([]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setConfig = useCallback(
    (c: Partial<CacheConfig>) => setConfigState((prev) => ({ ...prev, ...c })),
    [],
  );

  return (
    <SimContext.Provider
      value={{
        config, addresses, result, comparison, isLoading, error,
        setConfig, setAddresses, setResult, setComparison, setLoading, setError,
      }}
    >
      {children}
    </SimContext.Provider>
  );
}
