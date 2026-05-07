import { cn } from '@/lib/cn';
import type { DocStatus, CMMIScore } from '@/types';

export const docStatusMeta: Record<DocStatus, { label: string; tone: string; ring: string; bg: string }> = {
  in_place: { label: 'In place', tone: 'text-emerald-300', ring: 'ring-emerald-400/30', bg: 'bg-emerald-500/15' },
  partial: { label: 'Partial', tone: 'text-amber-300', ring: 'ring-amber-400/30', bg: 'bg-amber-500/15' },
  out_of_date: { label: 'Out of date', tone: 'text-orange-300', ring: 'ring-orange-400/30', bg: 'bg-orange-500/15' },
  not_in_place: { label: 'Not in place', tone: 'text-red-300', ring: 'ring-red-400/30', bg: 'bg-red-500/15' },
  not_applicable: { label: 'N/A', tone: 'text-slate-400', ring: 'ring-slate-500/20', bg: 'bg-slate-500/10' },
};

export const cmmiMeta: Record<CMMIScore, { label: string; description: string; colour: string }> = {
  0: { label: 'Not Performed', description: 'Activity is not performed.', colour: '#475569' },
  1: { label: 'Initial', description: 'Activity is performed informally and inconsistently.', colour: '#EF4444' },
  2: { label: 'Managed', description: 'Activity is planned and tracked, but reactive.', colour: '#F97316' },
  3: { label: 'Defined', description: 'Standardised, documented and consistently applied.', colour: '#F59E0B' },
  4: { label: 'Quantitatively Managed', description: 'Measured and controlled with metrics.', colour: '#22D3EE' },
  5: { label: 'Optimising', description: 'Continuously improved with proactive optimisation.', colour: '#10B981' },
};

export function DocStatusDot({ status, withLabel, className }: { status: DocStatus; withLabel?: boolean; className?: string }) {
  const m = docStatusMeta[status];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('h-2.5 w-2.5 rounded-full ring-4', m.ring, m.bg)} />
      {withLabel && <span className={cn('text-xs font-medium', m.tone)}>{m.label}</span>}
    </span>
  );
}

export function CMMIChip({ score, target, className }: { score: CMMIScore; target?: CMMIScore; className?: string }) {
  const m = cmmiMeta[score];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md border border-navy-600/60 bg-navy-800/80 px-2 py-0.5', className)}>
      <span className="h-2 w-2 rounded-full" style={{ background: m.colour }} />
      <span className="font-mono text-xs text-slate-200">{score}</span>
      {target !== undefined && (
        <>
          <span className="text-slate-500 text-xs">→</span>
          <span className="font-mono text-xs text-cyan-400">{target}</span>
        </>
      )}
    </span>
  );
}
