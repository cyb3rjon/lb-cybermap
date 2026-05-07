import type { RoadmapInitiative } from '@/types';
import { cn } from '@/lib/cn';

const HORIZONS: RoadmapInitiative['horizon'][] = ['0–3m', '3–6m', '6–12m', '12–24m'];

const statusTone: Record<RoadmapInitiative['status'], string> = {
  Proposed: 'bg-navy-700/70 border-navy-500/50 text-slate-200',
  Approved: 'bg-accent-500/20 border-accent-500/50 text-accent-200',
  'In Progress': 'bg-cyan-500/25 border-cyan-500/50 text-cyan-200',
  Complete: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200',
};

export function RoadmapGantt({ initiatives }: { initiatives: RoadmapInitiative[] }) {
  const grouped: Record<string, RoadmapInitiative[]> = {};
  for (const i of initiatives) (grouped[i.horizon] ||= []).push(i);

  return (
    <div className="space-y-2">
      <div className="grid gap-2" style={{ gridTemplateColumns: '120px repeat(4, minmax(0, 1fr))' }}>
        <div />
        {HORIZONS.map((h) => (
          <div key={h} className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center py-2 border-b border-navy-700/50">
            {h}
          </div>
        ))}
      </div>

      {Object.values(
        initiatives.reduce<Record<string, RoadmapInitiative[]>>((acc, i) => {
          (acc[i.capabilityArea] ||= []).push(i);
          return acc;
        }, {}),
      ).map((group, idx) => {
        const area = group[0].capabilityArea;
        return (
          <div key={area} className="grid gap-2 items-center" style={{ gridTemplateColumns: '120px repeat(4, minmax(0, 1fr))' }}>
            <div className="text-xs font-medium text-slate-300 truncate pr-2">{area}</div>
            {HORIZONS.map((h) => {
              const items = group.filter((g) => g.horizon === h);
              return (
                <div key={h} className="min-h-[44px] rounded-md border border-dashed border-navy-700/40 p-1.5 space-y-1.5">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      title={it.description}
                      className={cn('rounded-md border px-2 py-1 text-[11px] font-medium leading-snug', statusTone[it.status])}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">{it.title}</span>
                        <span className="font-mono text-[9px] opacity-70">{it.effort}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
