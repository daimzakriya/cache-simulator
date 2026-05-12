// src/components/ui/BadgePill.tsx
import { cn } from '../../lib/utils';

type Variant = 'violet' | 'cyan' | 'emerald' | 'amber' | 'red' | 'slate';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  violet: 'bg-[rgba(139,26,26,0.15)] text-[#fca5a5] border-[rgba(180,50,50,0.25)]',
  cyan: 'bg-[rgba(201,168,76,0.12)] text-[#E8C97A] border-[rgba(201,168,76,0.25)]',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function BadgePill({ children, variant = 'violet', className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  );
}
