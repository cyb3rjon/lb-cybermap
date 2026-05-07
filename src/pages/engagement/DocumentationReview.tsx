import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileSearch, Upload, Filter, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, Input } from '@/components/ui/Input';
import { DocStatusDot, docStatusMeta } from '@/components/ui/StatusDot';
import { FRAMEWORKS } from '@/data/frameworks';
import type { DocStatus } from '@/types';

export default function DocumentationReview() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const setDocStatus = useStore((s) => s.setDocStatus);

  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all');
  const [q, setQ] = useState('');

  const fw = eng && FRAMEWORKS[eng.framework];

  const summary = useMemo(() => {
    const out: Record<DocStatus, number> = { in_place: 0, partial: 0, out_of_date: 0, not_in_place: 0, not_applicable: 0 };
    for (const i of items) out[i.docStatus]++;
    return out;
  }, [items]);

  const rows = useMemo(() => {
    if (!fw) return [];
    const flat: { groupCode: string; groupName: string; code: string; itemId: string; title: string; description: string; igTier?: number; status: DocStatus }[] = [];
    for (const g of fw.groups) {
      for (const c of g.categories) {
        for (const it of c.items) {
          const ai = items.find((x) => x.itemId === it.id);
          if (!ai) continue;
          flat.push({ groupCode: g.code, groupName: g.name, code: it.code, itemId: it.id, title: it.title, description: it.description, igTier: it.igTier, status: ai.docStatus });
        }
      }
    }
    return flat
      .filter((r) => groupFilter === 'all' || r.groupCode === groupFilter)
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.code.toLowerCase().includes(q.toLowerCase()));
  }, [fw, items, groupFilter, statusFilter, q]);

  if (!eng || !fw) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.entries(docStatusMeta) as [DocStatus, typeof docStatusMeta[DocStatus]][]).map(([k, m]) => (
          <Card key={k} elevated className="!p-4">
            <div className="flex items-center justify-between mb-2">
              <DocStatusDot status={k} />
              <span className="text-xs text-slate-400">{m.label}</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">{summary[k]}</div>
          </Card>
        ))}
      </div>

      <Card elevated className="!p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-xs px-1"><Filter size={13} /> Filter</div>
          <Input placeholder="Search controls…" value={q} onChange={(e) => setQ(e.target.value)} className="!w-64" />
          <Select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            options={[{ value: 'all', label: 'All groups' }, ...fw.groups.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }))]}
            className="!w-72"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'in_place', label: 'In place' },
              { value: 'partial', label: 'Partial' },
              { value: 'out_of_date', label: 'Out of date' },
              { value: 'not_in_place', label: 'Not in place' },
              { value: 'not_applicable', label: 'N/A' },
            ]}
            className="!w-44"
          />
          <div className="ml-auto">
            <Button variant="outline" iconLeft={<Upload size={14} />}>Upload evidence</Button>
          </div>
        </div>
      </Card>

      <Card elevated className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Control</th>
              <th className="text-left px-3 py-3 font-medium">Group</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-left px-3 py-3 font-medium">Set status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/40">
            {rows.map((r) => (
              <tr key={r.itemId} className="hover:bg-navy-700/15">
                <td className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <FileText size={14} className="text-accent-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm">
                        <span className="font-mono text-[11px] text-slate-500 mr-2">{r.code}</span>
                        <span className="text-white font-medium">{r.title}</span>
                        {r.igTier && <Badge tone="cyan" className="ml-2">IG{r.igTier}</Badge>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 max-w-2xl">{r.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-slate-300">{r.groupCode}</td>
                <td className="px-3 py-3"><DocStatusDot status={r.status} withLabel /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    {(['in_place','partial','out_of_date','not_in_place','not_applicable'] as DocStatus[]).map((s) => {
                      const m = docStatusMeta[s];
                      const active = r.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setDocStatus(engagementId, r.itemId, s)}
                          title={m.label}
                          className={`h-7 w-7 rounded-md border transition flex items-center justify-center ${
                            active ? 'border-accent-500/60 bg-accent-500/15' : 'border-navy-700/60 hover:border-accent-500/40'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ring-2 ${m.ring} ${m.bg}`} />
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-14 flex flex-col items-center text-center">
            <FileSearch className="text-accent-400/70 mb-2" size={28} />
            <div className="text-sm font-semibold text-slate-200">No items match your filters.</div>
          </div>
        )}
      </Card>
    </div>
  );
}
