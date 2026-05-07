import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lightbulb, Sparkles, Plus, Filter, Pencil, ChevronDown, ChevronRight as ChevronRightIcon, Target, ListChecks } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { FRAMEWORKS, findItem } from '@/data/frameworks';
import type { Recommendation, Priority, Effort, CostBand, Horizon } from '@/types';

const PRIORITY_TONE: Record<string, any> = { P1: 'critical', P2: 'risk', P3: 'warn', P4: 'muted' };

export default function Recommendations() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const users = useStore((s) => s.users);
  const addRec = useStore((s) => s.addRecommendation);
  const updateRec = useStore((s) => s.updateRecommendation);
  const aiGen = useStore((s) => s.aiGenerateRecommendations);

  const [open, setOpen] = useState<{ mode: 'add' } | { mode: 'edit'; itemId: string; recId: string } | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'P2' as Priority, effort: 'M' as Effort, costBand: '£25–100k' as CostBand,
    horizon: '3–6m' as Horizon, capabilityArea: 'Identity & Access', linkItem: '', assigneeId: '',
    benefits: '', successCriteria: '',
  });
  const [filterPrio, setFilterPrio] = useState('all');
  const [filterArea, setFilterArea] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [aiBanner, setAiBanner] = useState<string | null>(null);

  const fw = eng && FRAMEWORKS[eng.framework];

  const recs = useMemo(
    () => items.flatMap((i) => i.recommendations.map((r) => ({ rec: r, itemId: i.itemId }))),
    [items],
  );
  const areas = Array.from(new Set(recs.map((r) => r.rec.capabilityArea)));

  const order = { P1: 1, P2: 2, P3: 3, P4: 4 } as const;
  const filtered = recs
    .filter((r) => filterPrio === 'all' || r.rec.priority === filterPrio)
    .filter((r) => filterArea === 'all' || r.rec.capabilityArea === filterArea)
    .filter((r) => filterAssignee === 'all' || r.rec.assigneeId === filterAssignee)
    .sort((a, b) => order[a.rec.priority] - order[b.rec.priority]);

  function openAdd() {
    setForm({
      title: '', description: '', priority: 'P2', effort: 'M', costBand: '£25–100k', horizon: '3–6m',
      capabilityArea: 'Identity & Access', linkItem: items[0]?.itemId || '', assigneeId: '',
      benefits: '', successCriteria: '',
    });
    setOpen({ mode: 'add' });
  }
  function openEdit(itemId: string, r: Recommendation) {
    setForm({
      title: r.title, description: r.description, priority: r.priority, effort: r.effort, costBand: r.costBand,
      horizon: r.horizon, capabilityArea: r.capabilityArea, linkItem: itemId, assigneeId: r.assigneeId ?? '',
      benefits: r.benefits ?? '', successCriteria: (r.successCriteria ?? []).join('\n'),
    });
    setOpen({ mode: 'edit', itemId, recId: r.id });
  }
  function save() {
    if (!form.linkItem || !form.title.trim()) return;
    const successCriteria = form.successCriteria.split('\n').map((s) => s.trim()).filter(Boolean);
    if (open?.mode === 'add') {
      addRec(engagementId, form.linkItem, {
        title: form.title, description: form.description,
        priority: form.priority, effort: form.effort, costBand: form.costBand, horizon: form.horizon,
        capabilityArea: form.capabilityArea, provenance: 'manual',
        linkedItemIds: [form.linkItem], linkedObservationIds: [],
        assigneeId: form.assigneeId || undefined,
        benefits: form.benefits || undefined,
        successCriteria,
      });
    } else if (open?.mode === 'edit') {
      updateRec(engagementId, open.itemId, open.recId, {
        title: form.title, description: form.description,
        priority: form.priority, effort: form.effort, costBand: form.costBand, horizon: form.horizon,
        capabilityArea: form.capabilityArea, assigneeId: form.assigneeId || undefined,
        benefits: form.benefits || undefined, successCriteria,
      });
    }
    setOpen(null);
  }
  function runAI() {
    const n = aiGen(engagementId);
    setAiBanner(n > 0 ? `AI drafted ${n} new recommendation${n === 1 ? '' : 's'} from notes and observations.` : 'No new recommendations generated. Items either already have a recommendation or lack supporting notes/observations.');
    setTimeout(() => setAiBanner(null), 5000);
  }

  if (!eng || !fw) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      {aiBanner && <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 flex items-center gap-2"><Sparkles size={14} /><span>{aiBanner}</span></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['P1','P2','P3','P4'] as Priority[]).map((p) => (
          <Card key={p} elevated className="!p-4">
            <div className="flex items-center justify-between">
              <Badge tone={PRIORITY_TONE[p]}>{p}</Badge>
              <Lightbulb size={14} className="text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-2">{recs.filter((r) => r.rec.priority === p).length}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              {p === 'P1' ? 'Critical' : p === 'P2' ? 'High' : p === 'P3' ? 'Medium' : 'Low'}
            </div>
          </Card>
        ))}
      </div>

      <Card elevated className="!p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-xs px-1"><Filter size={13} /> Filter</div>
          <Select value={filterPrio} onChange={(e) => setFilterPrio(e.target.value)}
            options={[{ value: 'all', label: 'All priorities' }, ...['P1','P2','P3','P4'].map((p) => ({ value: p, label: p }))]} className="!w-44" />
          <Select value={filterArea} onChange={(e) => setFilterArea(e.target.value)}
            options={[{ value: 'all', label: 'All capability areas' }, ...areas.map((a) => ({ value: a, label: a }))]} className="!w-56" />
          <Select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
            options={[{ value: 'all', label: 'All assignees' }, ...users.map((u) => ({ value: u.id, label: u.name }))]} className="!w-56" />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" iconLeft={<Sparkles size={14} />} onClick={runAI}>Generate from notes</Button>
            <Button onClick={openAdd} iconLeft={<Plus size={14} />}>Add recommendation</Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map(({ rec, itemId }) => {
          const it = findItem(fw, itemId);
          const assignee = users.find((u) => u.id === rec.assigneeId);
          const isOpen = expanded[rec.id] ?? false;
          return (
            <Card key={rec.id} elevated>
              <div className="flex items-start justify-between gap-3 mb-2">
                <button onClick={() => setExpanded((e) => ({ ...e, [rec.id]: !isOpen }))} className="flex items-start gap-2 text-left flex-1 min-w-0">
                  {isOpen ? <ChevronDown size={16} className="mt-1 text-slate-400 shrink-0" /> : <ChevronRightIcon size={16} className="mt-1 text-slate-400 shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-white">{rec.title}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge tone={PRIORITY_TONE[rec.priority]} dot>{rec.priority}</Badge>
                      <Badge tone="muted">{rec.capabilityArea}</Badge>
                      <Badge tone="info">Effort {rec.effort}</Badge>
                      <Badge tone="muted">{rec.costBand}</Badge>
                      <Badge tone="cyan">{rec.horizon}</Badge>
                      <Badge tone={rec.provenance === 'manual' ? 'muted' : 'cyan'} dot>{rec.provenance === 'manual' ? 'Manual' : 'AI'}</Badge>
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  {assignee && (
                    <div className="flex items-center gap-1.5">
                      <Avatar initials={assignee.initials} colour={assignee.avatarColour} size="sm" />
                      <span className="text-[11px] text-slate-300 hidden md:inline">{assignee.name}</span>
                    </div>
                  )}
                  <Button size="sm" variant="ghost" iconLeft={<Pencil size={12} />} onClick={() => openEdit(itemId, rec)}>Edit</Button>
                </div>
              </div>
              <div className={isOpen ? '' : 'line-clamp-3'}>
                {rec.description.split('\n\n').map((p, i) => (
                  <p key={i} className="text-sm text-slate-300 leading-relaxed mt-2 first:mt-0 whitespace-pre-line">{p}</p>
                ))}
              </div>
              {isOpen && (
                <>
                  {rec.benefits && (
                    <div className="mt-3 p-3 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-[12px] text-emerald-200 flex items-start gap-2">
                      <Target size={13} className="mt-0.5 shrink-0" />
                      <div><span className="text-[10px] uppercase tracking-wider text-emerald-300/70 mr-2">Benefits</span>{rec.benefits}</div>
                    </div>
                  )}
                  {rec.successCriteria && rec.successCriteria.length > 0 && (
                    <div className="mt-2 p-3 rounded-md bg-cyan-500/5 border border-cyan-500/20">
                      <div className="text-[10px] uppercase tracking-wider text-cyan-300/70 flex items-center gap-1.5 mb-1.5"><ListChecks size={12} />Success criteria</div>
                      <ul className="space-y-0.5">
                        {rec.successCriteria.map((s, i) => (
                          <li key={i} className="text-[12px] text-cyan-100 flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 rounded-full bg-cyan-400" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
              {it && (
                <div className="mt-3 pt-3 border-t border-navy-700/50 text-[11px] text-slate-500">
                  Linked control: <span className="font-mono text-slate-300">{it.code}</span> · {it.title}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)}
        title={open?.mode === 'add' ? 'Add recommendation' : 'Edit recommendation'}
        size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button>
          <Button onClick={save}>{open?.mode === 'add' ? 'Save' : 'Save changes'}</Button>
        </>}
      >
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" rows={10} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What to do, in detail. Use multi-paragraph form: design intent, sequence of work, dependencies, indicative cost in year one." />
          <Textarea label="Benefits" rows={2} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            placeholder="What this recommendation will deliver if executed." />
          <Textarea label="Success criteria (one per line)" rows={4} value={form.successCriteria} onChange={(e) => setForm({ ...form, successCriteria: e.target.value })}
            placeholder="Measurable outcome 1&#10;Measurable outcome 2" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
              options={['P1','P2','P3','P4'].map((p) => ({ value: p, label: p }))} />
            <Select label="Effort" value={form.effort} onChange={(e) => setForm({ ...form, effort: e.target.value as Effort })}
              options={['S','M','L','XL'].map((e) => ({ value: e, label: e }))} />
            <Select label="Cost band" value={form.costBand} onChange={(e) => setForm({ ...form, costBand: e.target.value as CostBand })}
              options={['<£25k','£25–100k','£100–500k','>£500k'].map((c) => ({ value: c, label: c }))} />
            <Select label="Horizon" value={form.horizon} onChange={(e) => setForm({ ...form, horizon: e.target.value as Horizon })}
              options={['0–3m','3–6m','6–12m','12–24m'].map((h) => ({ value: h, label: h }))} />
            <Input label="Capability area" value={form.capabilityArea} onChange={(e) => setForm({ ...form, capabilityArea: e.target.value })} />
            <Select label="Linked control" value={form.linkItem} onChange={(e) => setForm({ ...form, linkItem: e.target.value })}
              options={items.map((ai) => {
                const it = findItem(fw, ai.itemId);
                return { value: ai.itemId, label: it ? `${it.code} ${it.title}` : ai.itemId };
              })} />
            <Select label="Assignee" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              options={[{ value: '', label: '— Unassigned —' }, ...users.map((u) => ({ value: u.id, label: u.name }))]} className="md:col-span-2" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
