import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'accent' | 'cyan' | 'ok' | 'warn' | 'risk' | 'info' | 'muted' | 'critical';

const toneStyles: Record<Tone, string> = {
  default: 'bg-navy-700/70 text-slate-200 border border-navy-600/60',
  accent: 'bg-accent-500/15 text-accent-300 border border-accent-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
  ok: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
  warn: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
  risk: 'bg-red-500/10 text-red-300 border border-red-500/30',
  critical: 'bg-red-700/30 text-red-200 border border-red-500/50',
  info: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
  muted: 'bg-navy-800/50 text-slate-400 border border-navy-700/40',
};

export function Badge({
  children, tone = 'default', className, dot, icon,
}: { children: ReactNode; tone?: Tone; className?: string; dot?: boolean; icon?: ReactNode }) {
  return (
    <span className={cn('chip', toneStyles[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {icon}
      {children}
    </span>
  );
}
