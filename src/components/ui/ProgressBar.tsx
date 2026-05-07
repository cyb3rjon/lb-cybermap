import { cn } from '@/lib/cn';

export function ProgressBar({
  value, max = 100, className, showLabel, tone = 'accent',
}: {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  tone?: 'accent' | 'cyan' | 'ok' | 'warn' | 'risk';
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fill: Record<string, string> = {
    accent: 'bg-accent-gradient',
    cyan: 'bg-cyan-500',
    ok: 'bg-emerald-500',
    warn: 'bg-amber-500',
    risk: 'bg-red-500',
  };
  return (
    <div className={cn('w-full', className)}>
      <div className="h-1.5 w-full bg-navy-800/80 rounded-full overflow-hidden border border-navy-700/40">
        <div className={cn('h-full transition-all duration-500', fill[tone])} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>{Math.round(pct)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
    </div>
  );
}
