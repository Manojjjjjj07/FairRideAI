import React from 'react';

export type BadgeVariant =
  | 'open' | 'resolved' | 'closed'
  | 'high' | 'critical' | 'medium' | 'low'
  | 'cyan' | 'purple'
  | 'default';

interface BadgeProps {
  variant?:   BadgeVariant;
  children:   React.ReactNode;
  dot?:       boolean;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  open:     'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm shadow-sky-500/10',
  resolved: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10',
  closed:   'bg-slate-800/60 text-slate-400 border border-slate-700/60',
  high:     'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm shadow-rose-500/10',
  critical: 'bg-red-500/25 text-red-200 border border-red-500/40 shadow-sm shadow-red-500/20 font-bold animate-pulse',
  medium:   'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10',
  low:      'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  cyan:     'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10',
  purple:   'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10',
  default:  'bg-slate-800/80 text-slate-300 border border-slate-700/50',
};

const dotColors: Record<BadgeVariant, string> = {
  open:     'bg-sky-400',
  resolved: 'bg-emerald-400',
  closed:   'bg-slate-500',
  high:     'bg-rose-400',
  critical: 'bg-red-400',
  medium:   'bg-amber-400',
  low:      'bg-blue-400',
  cyan:     'bg-cyan-400',
  purple:   'bg-purple-400',
  default:  'bg-slate-400',
};

export default function Badge({
  variant   = 'default',
  children,
  dot       = true,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5',
        'rounded-full text-[11px] font-medium tracking-wide uppercase',
        styles[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />
      )}
      {children}
    </span>
  );
}
