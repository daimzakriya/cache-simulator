// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Settings2, TerminalSquare, LayoutDashboard,
  BarChart3, Download, BookOpen, Cpu, X
} from 'lucide-react';
import { cn } from '../lib/utils';

const links = [
  { to: '/',            icon: Home,            label: 'Overview' },
  { to: '/configure',   icon: Settings2,       label: 'Configure' },
  { to: '/trace',       icon: TerminalSquare,  label: 'Trace Input' },
  { to: '/simulate',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/compare',     icon: BarChart3,       label: 'Compare' },
  { to: '/export',      icon: Download,        label: 'Export' },
  { to: '/about',       icon: BookOpen,        label: 'Theory' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full w-64 flex flex-col py-6 px-4 z-40 bg-background/95 md:bg-background/80 backdrop-blur-3xl border-r border-[rgba(139,26,26,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
      open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Mobile Close Button */}
      <button 
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 p-2 text-textSecondary hover:text-white"
        aria-label="Close menu"
      >
        <X size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer group">
        <div className="relative w-10 h-10 rounded-sm flex items-center justify-center bg-white/5 border border-[rgba(139,26,26,0.15)] group-hover:border-primary-500/50 transition-colors">
          <div className="absolute inset-0 bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Cpu size={20} className="text-white relative z-10" />
        </div>
        <div>
          <h1 className="text-sm font-black text-white tracking-tight leading-tight">CacheSim</h1>
          <p className="text-[10px] text-primary-400 font-medium tracking-widest uppercase">Simulator</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'relative flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-300 group',
              isActive ? 'text-white bg-white/5' : 'text-textSecondary hover:text-white hover:bg-white/[0.02]'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-sm border border-primary-500/30 bg-primary-500/10 shadow-[inset_0_0_20px_rgba(124,58,237,0.1)]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={18} className={cn('relative z-10 transition-colors', isActive ? 'text-primary-400' : 'group-hover:text-textPrimary')} />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-2">
        <div className="p-4 rounded-sm bg-gradient-to-br from-primary-900/40 to-surface border border-[rgba(139,26,26,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }} />
          <p className="text-xs font-bold text-white relative z-10 mb-1">Local Processing</p>
          <p className="text-[10px] text-textMuted relative z-10 leading-tight">100% Frontend Engine.<br/>Zero server latency.</p>
        </div>
      </div>
    </aside>
  );
}
