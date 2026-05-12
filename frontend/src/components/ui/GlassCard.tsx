// src/components/ui/GlassCard.tsx
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Props extends HTMLMotionProps<"div"> {
  animatedBorder?: boolean;
  glow?: boolean;
}

export function GlassCard({ animatedBorder, glow, className, children, ...props }: Props) {
  return (
    <motion.div
      className={cn(
        'glass-panel gloss p-6',
        animatedBorder && 'animated-border',
        glow && 'glass-panel-glow',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
