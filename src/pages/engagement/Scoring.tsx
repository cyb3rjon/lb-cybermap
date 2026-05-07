import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gauge, Sparkles, Filter } from 'lucide-react';
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

export default function Scoring() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const setScore = useStore((s) => s.setScore);

  const [groupFilter, setGroupFilter] = useState('all');
  const [q, setQ] = useState('');

  const fw = eng && FRAMEWORKS[eng.framework];

  const aggs = useMemo(() => eng ? averageByGroup(eng, items) : [], [eng, items]);
  const radar = useMemo(() => eng ? buildRadarSeries(eng, items, { scope: 'industry', value: 'Financial Services' }) : [], [eng, items]);
  const heatmap = useMemo(() => eng ? buildHeatmapRows(eng, items) : [], [eng, items]);

  const filtered = useMemo(() => {
    if (!fw) return [];
    return items
      .map((ai) => {
        for (const g of fw.groups) for (const c of g.categories) for (const it of c.items)
          if (it.id === ai.itemId) return { ai, it, group: g };
        return null;
      })
      .filter(Boolean) as { ai: typeof items[number]; it: any; group: any }[];
  }, [fw, items])
    .filter((r) => groupFilter === 'all' || r.group.code === groupFilter)
    .filter((r) => !q || r.it.title.toLowerCase().includes(q.toLowerCase()) || r.it.code.toLowerCase().includes(q.toLowerCase()));

  if (!eng || !fw) return null;
  const overall = overallAverage(items);
  const overallT = overallTarget(items);

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card elevated>
          <CardHeader icon={<Gauge size={16} />} title="Overall maturity" subtitle="Across all in-scope items" />
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
          <div className="mt-4 pt-4 border-t border-navy-700/50">
            <div className="text-[11px] text-slate-400 mb-2">Per-group averages</div>
            <div className="space-y-1.5">
              {aggs.map((a) => (
                <div key={a.groupCode} className="flex items-center gap-3 text-xs">
                  <span className="font-mono w-10 text-slate-500">{a.groupCode}</span>
                  <span className="flex-1 text-slate-200 truncate">{a.groupName}</span>
                  <span className="font-mono text-white">{a.averageCurrent.toFixed(1)}</span>
                  <span className="text-cyan-400 font-mono">→ {a.averageTarget.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card elevated className="lg:col-span-2">
          <CardHeader title="Radar" subtitle="Current vs. target with industry benchmark" />
          <MaturityRadar data={radar} height={300} />
        </Card>
      </div>

      <Card elevated>
        <CardHeader title="Heatmap" subtitle="Click any cell to jump to the related control." />
        <MaturityHeatmap rows={heatmap} />
      </Card>

      <Card elevated className="!p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-xs px-1"><Filter size={13} /> Filter</div>
          <Input placeholder="Search controls…" value={q} onChange={(e) => setQ(e.target.value)} className="!w-72" />
          <Select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}
            options={[{ value: 'all', label: 'All groups' }, ...fw.groups.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }))]} className="!w-72" />
          <div className="ml-auto"><Button variant="outline" iconLeft={<Sparkles size={14} />}>AI suggest scores</Button></div>
        </div>
      </Card>

      <Card elevated className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Control</th>
              <th className="text-left px-3 py-3 font-medium">Current</th>
              <th className="text-left px-3 py-3 font-medium">Target</th>
              <th className="text-left px-3 py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/40">
            {filtered.slice(0, 80).map(({ ai, it, group }) => (
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
                  <span className="font-mono text-cyan-400 text-sm">{ai.targetScore}</span>
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
            ))}
          </tbody>
        </table>
        {filtered.length > 80 && <div className="px-5 py-3 text-xs text-slate-500 border-t border-navy-700/40">Showing first 80 of {filtered.length} items.</div>}
      </Card>
    </div>
  );
}
