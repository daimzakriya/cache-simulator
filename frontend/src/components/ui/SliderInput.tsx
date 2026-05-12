// src/components/ui/SliderInput.tsx
import { Info } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  info?: string;
  onChange: (v: number) => void;
}

export function SliderInput({ label, value, min, max, step, unit, info, onChange }: Props) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <GlassCard glow className="p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white">{label}</span>
          {info && (
            <div className="group relative cursor-help">
              <Info size={14} className="text-textMuted hover:text-primary-400 transition-colors" />
              <div className="absolute left-6 top-0 z-50 w-56 rounded-lg p-3 text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity bg-[#16181F] border border-[rgba(139,26,26,0.15)] shadow-xl text-textSecondary">
                {info}
              </div>
            </div>
          )}
        </div>
        <span className="font-mono text-sm font-bold text-[#fca5a5] bg-[rgba(139,26,26,0.15)] px-2 py-0.5 rounded-md border border-[rgba(180,50,50,0.25)]">
          {value.toLocaleString()}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      
      <div className="relative h-2 rounded-full bg-white/5 border border-[rgba(139,26,26,0.15)] overflow-visible flex items-center">
        {/* Custom Track Fill */}
        <div 
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#B91C1C] to-[#C9A84C] pointer-events-none"
          style={{ width: `${percent}%`, boxShadow: '0 0 10px rgba(185,28,28,0.5)' }}
        />
        {/* Native Range input styled transparently to sit on top */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        {/* Custom Thumb */}
        <div 
          className="absolute w-4 h-4 bg-white rounded-full pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.8)] border-2 border-[#B91C1C] transition-transform"
          style={{ left: `calc(${percent}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-textMuted font-mono">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </GlassCard>
  );
}
