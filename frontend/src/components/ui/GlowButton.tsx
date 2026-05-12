// src/components/ui/GlowButton.tsx
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export function GlowButton({ variant = 'primary', isLoading, className, children, disabled, ...props }: Props) {
  const baseClass = variant === 'primary' ? 'btn-premium' : variant === 'danger' ? 'text-white border border-[rgba(220,38,38,0.5)] px-6 py-3 font-medium text-sm transition-all' : 'btn-secondary';
  
  const dangerStyle = variant === 'danger' ? {
    background: 'linear-gradient(135deg, #B91C1C, #6B0F0F)',
    borderRadius: '2px',
    boxShadow: '0 4px 14px rgba(185,28,28,0.4)'
  } : {};

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(baseClass, (disabled || isLoading) && 'opacity-60 cursor-not-allowed', className)}
      style={{ ...dangerStyle, ...(props.style || {}) }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children as React.ReactNode}
    </motion.button>
  );
}
