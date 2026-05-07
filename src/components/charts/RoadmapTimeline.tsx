import { useMemo } from 'react';
import type { RoadmapInitiative } from '@/types';
import { cn } from '@/lib/cn';

const HORIZONS: RoadmapInitiative['horizon'][] = ['0–3m', '3–6m', '6–12m', '12–24m'];

const horizonRange: Record<RoadmapInitiative['horizon'], [number, number]> = {
  '0–3m': [0, 3],
  '3–6m': [3, 6],
  '6–12m': [6, 12],
  '12–24m': [12, 24],
};

const statusFill: Record<RoadmapInitiative['status'], string> = {
  Proposed: 'bg-navy-600/60 border-navy-500/60 text-slate-200',
  Approved: 'bg-accent-500/30 border-accent-500/60 text-accent-100',
  'In Progress': 'bg-cyan-500/35 border-cyan-400/70 text-cyan-50 shadow-glow-cyan',
  Complete: 'bg-emerald-500/30 border-emerald-500/60 text-emerald-100',
};

const effortDot: Record<RoadmapInitiative['effort'], string> = {
  S: 'bg-emerald-400', M: 'bg-cyan-400', L: 'bg-amber-400', XL: 'bg-red-400',
};

const TOTAL_MONTHS = 24;

export function RoadmapTimeline({ initiatives }: { initiatives: RoadmapInitiative[] }) {
  const swimlanes = useMemo(() => {
    const groups: Record<string, RoadmapInitiative[]> = {};
    for (const i of initiatives) (groups[i.capabilityArea] ||= []).push(i);
    return Object.entries(groups);
  }, [initiatives]);

  const monthMarkers = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Header — month markers + horizon bands */}
        <div className="grid items-end gap-2 mb-3" style={{ gridTemplateColumns: '180px 1fr' }}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Capability area</div>
          <div className="relative">
            {/* Horizon shaded bands */}
            <div className="absolute inset-0 grid grid-cols-[3fr_3fr_6fr_12fr] rounded-md overflow-hidden">
              <div className="bg-cyan-500/5 border-r border-navy-700/50" />
              <div className="bg-accent-500/5 border-r border-navy-700/50" />
              <div className="bg-amber-500/5 border-r border-navy-700/50" />
              <div className="bg-red-500/5" />
            </div>
            {/* Horizon labels */}
            <div className="relative grid grid-cols-[3fr_3fr_6fr_12fr] text-[10px] uppercase tracking-wider py-1.5">
              <div className="text-cyan-300 px-2">0–3m · Now</div>
              <div className="text-accent-300 px-2">3–6m · Near</div>
              <div className="text-amber-300 px-2">6–12m · Mid</div>
              <div className="text-red-300 px-2">12–24m · Long</div>
            </div>
            {/* Month tick markers */}
            <div className="relative h-4">
              {monthMarkers.map((m) => (
                <div
                  key={m}
                  className="absolute top-0 bottom-0 flex flex-col items-center text-[9px] text-slate-500"
                  style={{ left: `${(m / TOTAL_MONTHS) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="h-1 w-px bg-navy-600" />
                  <span className="font-mono mt-0.5">{m}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Swimlanes */}
        <div className="space-y-2">
          {swimlanes.map(([area, list]) => (
            <div key={area} className="grid items-center gap-2 group" style={{ gridTemplateColumns: '180px 1fr' }}>
              <div className="text-xs font-medium text-slate-200 truncate pr-2">{area}</div>
              <div className="relative h-12 rounded-md border border-navy-700/40 bg-navy-900/30 overflow-hidden">
                {/* horizon background bands */}
                <div className="absolute inset-0 grid grid-cols-[3fr_3fr_6fr_12fr] pointer-events-none">
                  <div className="border-r border-navy-700/40" />
                  <div className="border-r border-navy-700/40" />
                  <div className="border-r border-navy-700/40" />
                  <div />
                </div>
                {list.map((it, idx) => {
                  const [start, end] = horizonRange[it.horizon];
                  const left = (start / TOTAL_MONTHS) * 100;
                  const width = ((end - start) / TOTAL_MONTHS) * 100;
                  const top = idx % 2 === 0 ? 'top-1' : 'top-6';
                  return (
                    <div
                      key={it.id}
                      title={`${it.title}\n${it.description}`}
                      className={cn(
                        'absolute h-5 rounded-md border px-2 text-[11px] font-medium leading-[1.05rem] truncate transition-all hover:scale-[1.02]',
                        statusFill[it.status], top,
                      )}
                      style={{ left: `${left + 0.5}%`, width: `${width - 1}%` }}
                    >
                      <span className="inline-flex items-center gap-1.5 max-w-full">
                        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', effortDot[it.effort])} />
                        <span className="truncate">{it.title}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {swimlanes.length === 0 && (
            <div className="text-xs text-slate-500 px-3 py-6 border border-dashed border-navy-700/50 rounded-md text-center">
              No initiatives yet — use Generate from recommendations or Add initiative.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-5 flex-wrap text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            {(['Proposed', 'Approved', 'In Progress', 'Complete'] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={cn('h-2.5 w-3 rounded-sm border', statusFill[s])} />
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className="h-4 w-px bg-navy-700" />
          <div className="flex items-center gap-3">
            {(['S', 'M', 'L', 'XL'] as const).map((e) => (
              <div key={e} className="flex items-center gap-1.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', effortDot[e])} />
                <span>Effort {e}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Roadmap summary cards — counts and totals across horizons / status / effort */
export function RoadmapSummary({ initiatives }: { initiatives: RoadmapInitiative[] }) {
  const byHorizon: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byEffort: Record<string, number> = {};
  for (const i of initiatives) {
    byHorizon[i.horizon] = (byHorizon[i.horizon] || 0) + 1;
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
    byEffort[i.effort] = (byEffort[i.effort] || 0) + 1;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Initiatives</div>
        <div className="text-2xl font-bold text-white font-mono mt-1">{initiatives.length}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">across {Object.keys(byHorizon).length} horizons</div>
      </div>
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Now (0–3m)</div>
        <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{byHorizon['0–3m'] || 0}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">immediate priorities</div>
      </div>
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">In progress</div>
        <div className="text-2xl font-bold text-emerald-300 font-mono mt-1">{byStatus['In Progress'] || 0}</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{byStatus['Approved'] || 0} approved · {byStatus['Proposed'] || 0} proposed</div>
      </div>
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Effort mix</div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm text-emerald-300 font-mono">S {byEffort['S'] || 0}</span>
          <span className="text-sm text-cyan-300 font-mono">M {byEffort['M'] || 0}</span>
          <span className="text-sm text-amber-300 font-mono">L {byEffort['L'] || 0}</span>
          <span className="text-sm text-red-300 font-mono">XL {byEffort['XL'] || 0}</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">delivery effort distribution</div>
      </div>
    </div>
  );
}
