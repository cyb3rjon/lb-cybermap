import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gauge, Sparkles, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { CMMIChip, cmmiMeta } from '@/components/ui/StatusDot';
import { FRAMEWORKS } from '@/data/frameworks';
import { MaturityRadar } from '@/components/charts/MaturityRadar';
import { MaturityHeatmap } from '@/components/charts/MaturityHeatmap';
import { buildHeatmapRows, buildRadarSeries, averageByGroup, overallAverage, overallTarget } from '@/lib/aggregations';
import type { CMMIScore } from '@/types';

const IMPLEMENTATION_THRESHOLD = 3;

export default function Scoring() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const client = useStore((s) => eng && s.getClient(eng.clientId));
  const setScore = useStore((s) => s.setScore);

  const [groupFilter, setGroupFilter] = useState('all');
  const [q, setQ] = useState('');

  const fw = eng && FRAMEWORKS[eng.framework];
  const groupLabel = eng?.framework === 'CIS_V8_1_2' ? 'Control' : eng?.framework === 'NCSC_CAF_4_0' ? 'Objective' : 'Function';
  const itemLabel = eng?.framework === 'CIS_V8_1_2' ? 'Safeguard' : eng?.framework === 'NCSC_CAF_4_0' ? 'Outcome' : 'Subcategory';

  const aggs = useMemo(() => eng ? averageByGroup(eng, items) : [], [eng, items]);
  const radar = useMemo(
    () => eng ? buildRadarSeries(eng, items, { scope: 'industry', value: client?.industry ?? 'Financial Services' }) : [],
    [eng, items, client],
  );
  const heatmap = useMemo(() => eng ? buildHeatmapRows(eng, items) : [], [eng, items]);

  const filtered = useMemo(() => {
    if (!fw) return [];
    const rows = items
      .map((ai) => {
        for (const g of fw.groups) for (const c of g.categories) for (const it of c.items)
          if (it.id === ai.itemId) return { ai, it, group: g };
        return null;
      })
      .filter(Boolean) as { ai: typeof items[number]; it: any; group: any }[];
    return rows
      .filter((r) => groupFilter === 'all' || r.group.code === groupFilter)
      .filter((r) => !q || r.it.title.toLowerCase().includes(q.toLowerCase()) || r.it.code.toLowerCase().includes(q.toLowerCase()));
  }, [fw, items, groupFilter, q]);

  if (!eng || !fw) return null;
  const overall = overallAverage(items);
  const overallT = overallTarget(items);
  const implementedCount = items.filter((i) => i.currentScore >= IMPLEMENTATION_THRESHOLD).length;
  const notImplementedCount = items.length - implementedCount;
  const implementedPct = items.length ? Math.round((implementedCount / items.length) * 100) : 0;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card elevated>
          <CardHeader icon={<Gauge size={16} />} title="Overall maturity" subtitle={`Average across ${items.length} in-scope ${itemLabel.toLowerCase()}s`} />
          <div className="flex items-end gap-4">
            <div>
              <div className="text-5xl font-bold text-white font-mono leading-none">{overall.toFixed(1)}</div>
              <div className="text-[11px] text-slate-400 mt-2">Current CMMI</div>
            </div>
            <div className="text-cyan-400 text-2xl mt-3">→</div>
            <div>
              <div className="text-5xl font-bold text-cyan-400 font-mono leading-none">{overallT.toFixed(1)}</div>
              <div className="text-[11px] text-slate-400 mt-2">Target</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-navy-700/50 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Implemented</div>
              <div className="text-emerald-300 font-mono text-2xl">{implementedCount} <span className="text-xs text-slate-500">/ {items.length}</span></div>
              <div className="text-[10px] text-slate-500">≥ {IMPLEMENTATION_THRESHOLD} CMMI</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Not implemented</div>
              <div className="text-amber-300 font-mono text-2xl">{notImplementedCount}</div>
              <div className="text-[10px] text-slate-500">{implementedPct}% implemented</div>
            </div>
          </div>
        </Card>

        <Card elevated className="lg:col-span-2">
          <CardHeader title="Maturity radar" subtitle="Current vs. target vs. industry benchmark (amber)" />
          <MaturityRadar data={radar} height={300} />
        </Card>
      </div>

      <Card elevated>
        <CardHeader title={`${groupLabel} scores`} subtitle={`Average score across ${itemLabel.toLowerCase()}s in each ${groupLabel.toLowerCase()}, with implementation status`} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aggs.map((a) => {
            const grp = fw.groups.find((g) => g.code === a.groupCode);
            const groupItems = items.filter((i) => {
              const flat = grp?.categories.flatMap((c) => c.items) || [];
              return flat.some((x) => x.id === i.itemId);
            });
            const implemented = groupItems.filter((i) => i.currentScore >= IMPLEMENTATION_THRESHOLD).length;
            const total = groupItems.length;
            const pct = total ? Math.round((implemented / total) * 100) : 0;
            const tone = a.averageCurrent >= 3.5 ? 'text-emerald-300' : a.averageCurrent >= 2.5 ? 'text-cyan-300' : a.averageCurrent >= 1.5 ? 'text-amber-300' : 'text-red-300';
            return (
              <div key={a.groupCode} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-mono text-[10px] text-slate-500">{groupLabel} {a.groupCode}</div>
                  <Badge tone={a.averageCurrent >= IMPLEMENTATION_THRESHOLD ? 'ok' : 'warn'} dot>
                    {a.averageCurrent >= IMPLEMENTATION_THRESHOLD ? 'Implemented' : 'Not implemented'}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-white leading-tight">{a.groupName}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`font-mono text-3xl ${tone}`}>{a.averageCurrent.toFixed(1)}</span>
                  <span className="text-cyan-400 text-sm">→ {a.averageTarget.toFixed(1)}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">{total} {itemLabel.toLowerCase()}{total === 1 ? '' : 's'}</span>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full bg-navy-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>{implemented} / {total} implemented</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card elevated>
        <CardHeader title="Heatmap" subtitle={`${itemLabel}-level current scores; cyan dot = target uplift planned`} />
        <MaturityHeatmap rows={heatmap} />
      </Card>

      <Card elevated className="!p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-xs px-1"><Filter size={13} /> Filter</div>
          <Input placeholder={`Search ${itemLabel.toLowerCase()}s…`} value={q} onChange={(e) => setQ(e.target.value)} className="!w-72" />
          <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}
            options={[{ value: 'all', label: `All ${groupLabel.toLowerCase()}s` }, ...fw.groups.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }))]} className="!w-72" />
          <div className="ml-auto"><Button variant="outline" iconLeft={<Sparkles size={14} />}>AI suggest scores</Button></div>
        </div>
      </Card>

      <Card elevated className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">{itemLabel}</th>
              <th className="text-left px-3 py-3 font-medium">Current → Target</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-left px-3 py-3 font-medium">Set score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/40">
            {filtered.slice(0, 120).map(({ ai, it, group }) => {
              const implemented = ai.currentScore >= IMPLEMENTATION_THRESHOLD;
              return (
                <tr key={it.id} className="hover:bg-navy-700/15">
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[11px] text-slate-500">{it.code}</span>
                      <div>
                        <div className="text-sm text-white font-medium">{it.title}</div>
                        <div className="text-[10px] text-slate-500">{group.code} · {group.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><CMMIChip score={ai.currentScore} target={ai.targetScore} /></td>
                  <td className="px-3 py-3">
                    {implemented ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                        <CheckCircle2 size={11} /> Implemented
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                        <XCircle size={11} /> Not implemented
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {([0,1,2,3,4,5] as CMMIScore[]).map((s) => {
                        const active = ai.currentScore === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setScore(engagementId, it.id, s)}
                            className={`h-7 w-7 rounded-md border text-[11px] font-mono transition ${
                              active ? 'border-accent-500/80 bg-accent-500/15 text-white shadow-glow' : 'border-navy-700/60 text-slate-300 hover:border-accent-500/40'
                            }`}
                            style={active ? { borderColor: cmmiMeta[s].colour } : {}}
                            title={`${s} — ${cmmiMeta[s].label}`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 120 && <div className="px-5 py-3 text-xs text-slate-500 border-t border-navy-700/40">Showing first 120 of {filtered.length} items.</div>}
      </Card>
    </div>
  );
}
