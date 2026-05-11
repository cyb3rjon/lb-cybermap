import { useMemo } from 'react';
import type { RoadmapInitiative, User } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/cn';

const HORIZONS: RoadmapInitiative['horizon'][] = ['0–3m', '3–6m', '6–12m', '12–24m'];
const STATUSES: RoadmapInitiative['status'][] = ['Proposed', 'Approved', 'In Progress', 'Complete'];
const COST_MIDPOINT: Record<RoadmapInitiative['costBand'], number> = {
  '<£25k': 12, '£25–100k': 62, '£100–500k': 300, '>£500k': 750,
};

const statusColour: Record<RoadmapInitiative['status'], string> = {
  Proposed: 'bg-navy-600',
  Approved: 'bg-accent-500',
  'In Progress': 'bg-cyan-400',
  Complete: 'bg-emerald-500',
};

const horizonTone: Record<RoadmapInitiative['horizon'], string> = {
  '0–3m': 'text-cyan-300',
  '3–6m': 'text-accent-300',
  '6–12m': 'text-amber-300',
  '12–24m': 'text-red-300',
};

export function RoadmapInsights({ initiatives, users }: { initiatives: RoadmapInitiative[]; users: User[] }) {
  const byHorizon = useMemo(() => {
    const out: Record<RoadmapInitiative['horizon'], { count: number; cost: number }> = {
      '0–3m': { count: 0, cost: 0 }, '3–6m': { count: 0, cost: 0 },
      '6–12m': { count: 0, cost: 0 }, '12–24m': { count: 0, cost: 0 },
    };
    for (const i of initiatives) {
      out[i.horizon].count++;
      out[i.horizon].cost += COST_MIDPOINT[i.costBand];
    }
    return out;
  }, [initiatives]);

  const cumulativeCost = useMemo(() => {
    let running = 0;
    return HORIZONS.map((h) => ({ horizon: h, cost: byHorizon[h].cost, cumulative: (running += byHorizon[h].cost) }));
  }, [byHorizon]);
  const maxCost = Math.max(1, ...cumulativeCost.map((c) => c.cumulative));

  const statusMix = useMemo(() => {
    const out: Record<RoadmapInitiative['status'], number> = { Proposed: 0, Approved: 0, 'In Progress': 0, Complete: 0 };
    for (const i of initiatives) out[i.status]++;
    return out;
  }, [initiatives]);
  const total = initiatives.length || 1;

  const byOwner = useMemo(() => {
    const out: Record<string, RoadmapInitiative[]> = {};
    for (const i of initiatives) {
      const key = i.assigneeId || '__unassigned__';
      (out[key] ||= []).push(i);
    }
    return Object.entries(out).sort((a, b) => b[1].length - a[1].length);
  }, [initiatives]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Cost outlook */}
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Cost outlook</div>
            <div className="text-base font-semibold text-white">Indicative spend curve</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Total</div>
            <div className="text-lg font-mono text-white">£{Math.round(cumulativeCost[3]?.cumulative ?? 0).toLocaleString('en-GB')}k</div>
          </div>
        </div>
        <div className="space-y-2.5">
          {cumulativeCost.map((c) => (
            <div key={c.horizon}>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className={cn('font-medium', horizonTone[c.horizon])}>{c.horizon}</span>
                <span className="text-slate-400 font-mono">
                  +£{Math.round(c.cost).toLocaleString('en-GB')}k <span className="text-slate-600">· total £{Math.round(c.cumulative).toLocaleString('en-GB')}k</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-navy-800 overflow-hidden flex">
                <div className="h-full bg-accent-gradient" style={{ width: `${(c.cumulative / maxCost) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-500 mt-3">
          Cost figures use the midpoint of each band (e.g. £25–100k = £62k) and exclude run-rate.
        </div>
      </div>

      {/* Status mix */}
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Status mix</div>
        <div className="text-base font-semibold text-white mb-3">Delivery state</div>
        <div className="h-3 w-full rounded-full overflow-hidden bg-navy-800 flex mb-3">
          {STATUSES.map((s) => {
            const pct = (statusMix[s] / total) * 100;
            if (pct === 0) return null;
            return <div key={s} className={statusColour[s]} style={{ width: `${pct}%` }} title={`${s}: ${statusMix[s]}`} />;
          })}
        </div>
        <div className="space-y-1.5">
          {STATUSES.map((s) => (
            <div key={s} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-sm', statusColour[s])} />
                <span className="text-slate-200">{s}</span>
              </div>
              <span className="font-mono text-slate-400">
                {statusMix[s]} <span className="text-slate-600">/ {total}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ownership */}
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">Ownership</div>
        <div className="text-base font-semibold text-white mb-3">Initiatives per assignee</div>
        <div className="space-y-2">
          {byOwner.length === 0 && <div className="text-xs text-slate-500">No initiatives yet.</div>}
          {byOwner.map(([key, list]) => {
            const user = users.find((u) => u.id === key);
            const name = user ? user.name : 'Unassigned';
            const pct = (list.length / total) * 100;
            return (
              <div key={key} className="flex items-center gap-2">
                {user
                  ? <Avatar size="sm" initials={user.initials} colour={user.avatarColour} />
                  : <span className="h-7 w-7 rounded-full bg-navy-700 inline-flex items-center justify-center text-[10px] text-slate-400">?</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 truncate">{name}</span>
                    <span className="font-mono text-slate-400">{list.length}</span>
                  </div>
                  <div className="h-1.5 w-full bg-navy-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-cyan-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
