// src/components/ui/MetricCard.tsx
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Props {
  label: string;
  value: number | string;
  icon: LucideIcon;
  unit?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  format?: 'number' | 'percent' | 'fixed2' | 'fixed3' | 'string';
}

const COLOR_MAP = {
  primary: '#B91C1C',   // Maroon
  secondary: '#C9A84C', // Gold
  success: '#10B981',   // Emerald
  warning: '#F59E0B',   // Amber
  danger: '#EF4444',    // Red
};

function useCountUp(target: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    // Easing function: easeOutExpo
    const easeOutExpo = (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    const start = performance.now();
    
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCurrent(target * easeOutExpo(p));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    
    frame.current = requestAnimationFrame(tick);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
  }, [target, duration]);

  return current;
}

export function MetricCard({ label, value, icon: Icon, unit, color = 'primary', format = 'number' }: Props) {
  const numVal = typeof value === 'number' ? value : 0;
  const animated = useCountUp(numVal);
  const hex = COLOR_MAP[color];

  const display = () => {
    if (typeof value === 'string') return value;
    if (format === 'percent') return `${(animated * 100).toFixed(1)}%`;
    if (format === 'fixed2') return animated.toFixed(2);
    if (format === 'fixed3') return animated.toFixed(3);
    return Math.floor(animated).toLocaleString();
  };

  return (
    <GlassCard glow className="p-5 flex flex-col justify-between min-h-[120px]">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-semibold tracking-wider text-textSecondary uppercase">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: `${hex}15`, border: `1px solid ${hex}30` }}>
          <Icon size={16} style={{ color: hex }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black tabular-nums tracking-tight" 
           style={{ color: '#F8FAFC', textShadow: `0 0 20px ${hex}40` }}>
          {display()}
        </p>
        {unit && <p className="text-xs text-textMuted mt-1">{unit}</p>}
      </div>
    </GlassCard>
  );
}
