import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Map, Sparkles, Plus, Trash2, GripVertical, Pencil } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { RoadmapGantt } from '@/components/charts/RoadmapGantt';
import { RoadmapTimeline, RoadmapSummary } from '@/components/charts/RoadmapTimeline';
import { RoadmapInsights } from '@/components/charts/RoadmapInsights';
import { Avatar } from '@/components/ui/Avatar';
import type { RoadmapInitiative } from '@/types';

const HORIZONS = ['0–3m', '3–6m', '6–12m', '12–24m'] as const;
const EFFORTS = ['S', 'M', 'L', 'XL'] as const;
const COSTS = ['<£25k', '£25–100k', '£100–500k', '>£500k'] as const;
const STATUSES = ['Proposed', 'Approved', 'In Progress', 'Complete'] as const;
const CAPABILITIES = ['Governance & Risk', 'Identity & Access', 'Asset Management', 'Data Protection', 'Secure Engineering', 'Resilience', 'Vulnerability Management', 'Detection & Response', 'Third-Party Risk', 'People & Culture', 'Assurance'] as const;

interface Form {
  title: string; description: string; horizon: typeof HORIZONS[number]; effort: typeof EFFORTS[number];
  costBand: typeof COSTS[number]; capabilityArea: typeof CAPABILITIES[number]; status: typeof STATUSES[number];
  owner: string; assigneeId: string; outcomes: string;
}

const blankForm: Form = {
  title: '', description: '', horizon: '3–6m', effort: 'M', costBand: '£25–100k',
  capabilityArea: 'Identity & Access', status: 'Proposed', owner: '', assigneeId: '', outcomes: '',
};

export default function Roadmap() {
  const { engagementId = '' } = useParams();
  const initiatives = useStore((s) => s.getRoadmap(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const users = useStore((s) => s.users);
  const addInitiative = useStore((s) => s.addRoadmapInitiative);
  const updateInitiative = useStore((s) => s.updateRoadmapInitiative);
  const removeInitiative = useStore((s) => s.removeRoadmapInitiative);
  const aiGenerateRoadmap = useStore((s) => s.aiGenerateRoadmap);

  const [open, setOpen] = useState<{ mode: 'add' } | { mode: 'edit'; id: string } | null>(null);
  const [form, setForm] = useState<Form>(blankForm);
  const [aiBanner, setAiBanner] = useState<string | null>(null);

  function openAdd() { setForm(blankForm); setOpen({ mode: 'add' }); }
  function openEdit(i: RoadmapInitiative) {
    setForm({
      title: i.title, description: i.description, horizon: i.horizon, effort: i.effort,
      costBand: i.costBand, capabilityArea: i.capabilityArea as any, status: i.status,
      owner: i.owner ?? '', assigneeId: i.assigneeId ?? '', outcomes: (i.outcomes ?? []).join('\n'),
    });
    setOpen({ mode: 'edit', id: i.id });
  }
  function save() {
    if (!form.title.trim()) return;
    const outcomes = form.outcomes.split('\n').map((s) => s.trim()).filter(Boolean);
    if (open?.mode === 'add') {
      addInitiative({
        engagementId, title: form.title, description: form.description, horizon: form.horizon,
        effort: form.effort, costBand: form.costBand, owner: form.owner || undefined,
        assigneeId: form.assigneeId || undefined,
        dependencies: [], linkedRecommendationIds: [], capabilityArea: form.capabilityArea, status: form.status, outcomes,
      });
    } else if (open?.mode === 'edit') {
      updateInitiative(open.id, {
        title: form.title, description: form.description, horizon: form.horizon, effort: form.effort,
        costBand: form.costBand, owner: form.owner || undefined, assigneeId: form.assigneeId || undefined,
        capabilityArea: form.capabilityArea, status: form.status, outcomes,
      });
    }
    setOpen(null);
  }

  function runAI() {
    const n = aiGenerateRoadmap(engagementId);
    setAiBanner(n > 0 ? `AI clustered ${items.flatMap((i) => i.recommendations).length} recommendations into ${n} new roadmap initiative${n === 1 ? '' : 's'}.` : 'No new initiatives generated. Either there are no recommendations yet or all capability areas already have an initiative.');
    setTimeout(() => setAiBanner(null), 5000);
  }

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      {aiBanner && (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 flex items-center gap-2">
          <Sparkles size={14} />
          <span>{aiBanner}</span>
        </div>
      )}

      <Card elevated>
        <CardHeader
          icon={<Map size={16} />}
          title="Improvement roadmap"
          subtitle="Initiatives clustered from recommendations and observations, sequenced across four horizons. Lead recommendations and outcomes carry through to the report."
          actions={
            <>
              <Button variant="outline" iconLeft={<Sparkles size={14} />} onClick={runAI}>Generate from recommendations</Button>
              <Button iconLeft={<Plus size={14} />} onClick={openAdd}>Add initiative</Button>
            </>
          }
        />
      </Card>

      <RoadmapSummary initiatives={initiatives} />

      <Card elevated>
        <CardHeader title="Roadmap timeline" subtitle="Initiatives plotted across a 24-month horizon, grouped by capability area. Status shown by colour, effort by dot." />
        <RoadmapTimeline initiatives={initiatives} />
      </Card>

      <Card elevated>
        <CardHeader title="Delivery insights" subtitle="Cost outlook, delivery state and ownership distribution" />
        <RoadmapInsights initiatives={initiatives} users={users} />
      </Card>

      <Card elevated>
        <CardHeader title="Horizon view — by capability area" subtitle="Compact view of initiatives by horizon column." />
        <RoadmapGantt initiatives={initiatives} />
      </Card>

      <Card elevated className="!p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-white">Initiatives ({initiatives.length})</h3>
          <p className="text-xs text-slate-400 mt-0.5">Each initiative bundles linked recommendations, outcomes, dependencies and an assignee.</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium" />
              <th className="text-left px-3 py-3 font-medium">Initiative</th>
              <th className="text-left px-3 py-3 font-medium">Area</th>
              <th className="text-left px-3 py-3 font-medium">Horizon</th>
              <th className="text-left px-3 py-3 font-medium">Effort / Cost</th>
              <th className="text-left px-3 py-3 font-medium">Owner / Assignee</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-left px-3 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/40">
            {initiatives.map((i) => {
              const assignee = users.find((u) => u.id === i.assigneeId);
              return (
                <tr key={i.id} className="hover:bg-navy-700/15">
                  <td className="px-5 py-3 text-slate-500"><GripVertical size={14} /></td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-white">{i.title}</div>
                    <div className="text-[12px] text-slate-300 max-w-2xl leading-relaxed line-clamp-3">{i.description}</div>
                    {i.outcomes && i.outcomes.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {i.outcomes.slice(0, 3).map((o, idx) => (
                          <li key={idx} className="text-[11px] text-emerald-300 flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 rounded-full bg-emerald-400" />
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="text-[10px] text-slate-500 mt-2">
                      {i.linkedRecommendationIds.length > 0 ? `Linked to ${i.linkedRecommendationIds.length} recommendation${i.linkedRecommendationIds.length === 1 ? '' : 's'}` : 'No linked recommendations'}
                    </div>
                  </td>
                  <td className="px-3 py-3"><Badge tone="muted">{i.capabilityArea}</Badge></td>
                  <td className="px-3 py-3"><Badge tone="cyan">{i.horizon}</Badge></td>
                  <td className="px-3 py-3 text-xs text-slate-300">
                    <Badge tone="info">{i.effort}</Badge>
                    <div className="mt-1">{i.costBand}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-300">
                    <div>{i.owner || '—'}</div>
                    {assignee && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Avatar initials={assignee.initials} colour={assignee.avatarColour} size="sm" />
                        <span className="text-[11px]">{assignee.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={i.status === 'Complete' ? 'ok' : i.status === 'In Progress' ? 'cyan' : i.status === 'Approved' ? 'accent' : 'muted'} dot>{i.status}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" iconLeft={<Pencil size={12} />} onClick={() => openEdit(i)}>Edit</Button>
                      <Button size="sm" variant="ghost" iconLeft={<Trash2 size={12} />} onClick={() => removeInitiative(i.id)}>Remove</Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {initiatives.length === 0 && (
          <div className="py-14 text-center">
            <Map className="mx-auto text-accent-400/70 mb-2" size={28} />
            <div className="text-sm font-semibold text-slate-200">No initiatives yet.</div>
            <div className="text-xs text-slate-500 mt-1">Generate from your recommendations or add manually.</div>
          </div>
        )}
      </Card>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.mode === 'add' ? 'Add roadmap initiative' : 'Edit roadmap initiative'}
        size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button>
          <Button onClick={save}>{open?.mode === 'add' ? 'Create initiative' : 'Save changes'}</Button>
        </>}
      >
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Identity Modernisation Programme" />
          <Textarea label="Description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What this initiative will deliver, the sequence of work, and the dependencies it relies on." />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Select label="Capability area" value={form.capabilityArea} onChange={(e) => setForm({ ...form, capabilityArea: e.target.value as any })}
              options={CAPABILITIES.map((c) => ({ value: c, label: c }))} />
            <Select label="Horizon" value={form.horizon} onChange={(e) => setForm({ ...form, horizon: e.target.value as any })}
              options={HORIZONS.map((h) => ({ value: h, label: h }))} />
            <Select label="Effort" value={form.effort} onChange={(e) => setForm({ ...form, effort: e.target.value as any })}
              options={EFFORTS.map((e) => ({ value: e, label: e }))} />
            <Select label="Cost band" value={form.costBand} onChange={(e) => setForm({ ...form, costBand: e.target.value as any })}
              options={COSTS.map((c) => ({ value: c, label: c }))} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              options={STATUSES.map((s) => ({ value: s, label: s }))} />
            <Input label="Owner (role)" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="CISO Office" />
            <Select label="Assignee" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              options={[{ value: '', label: '— Unassigned —' }, ...users.map((u) => ({ value: u.id, label: `${u.name} — ${u.role}` }))]} />
          </div>
          <Textarea label="Outcomes (one per line)" rows={4} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
            placeholder="Service-account MFA bypass eliminated&#10;Privileged Linux access brokered through PAM" />
        </div>
      </Modal>
    </div>
  );
}
