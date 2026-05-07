import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Sparkles, Plus, Pencil, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { RiskMatrix } from '@/components/charts/RiskMatrix';
import { FRAMEWORKS, findItem } from '@/data/frameworks';
import type { Risk } from '@/types';

export default function Risks() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const users = useStore((s) => s.users);
  const addRisk = useStore((s) => s.addRisk);
  const updateRisk = useStore((s) => s.updateRisk);
  const aiGen = useStore((s) => s.aiGenerateRisks);

  const [open, setOpen] = useState<{ mode: 'add' } | { mode: 'edit'; itemId: string; riskId: string } | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', impact: 3, likelihood: 3,
    treatment: 'Mitigate' as 'Mitigate' | 'Accept' | 'Transfer' | 'Avoid',
    linkItem: '', assigneeId: '', owner: '', rationale: '',
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [aiBanner, setAiBanner] = useState<string | null>(null);

  const fw = eng && FRAMEWORKS[eng.framework];

  const risks = useMemo(
    () => items.flatMap((i) => i.risks.map((r) => ({ risk: r, itemId: i.itemId }))),
    [items],
  );
  const sorted = [...risks].sort((a, b) => b.risk.inherentScore - a.risk.inherentScore);

  function openAdd() {
    setForm({ title: '', description: '', impact: 3, likelihood: 3, treatment: 'Mitigate', linkItem: items[0]?.itemId || '', assigneeId: '', owner: '', rationale: '' });
    setOpen({ mode: 'add' });
  }
  function openEdit(itemId: string, r: Risk) {
    setForm({
      title: r.title, description: r.description, impact: r.impact, likelihood: r.likelihood,
      treatment: r.treatment, linkItem: itemId, assigneeId: r.assigneeId ?? '', owner: r.owner ?? '',
      rationale: r.rationale ?? '',
    });
    setOpen({ mode: 'edit', itemId, riskId: r.id });
  }
  function save() {
    if (!form.linkItem || !form.title.trim()) return;
    if (open?.mode === 'add') {
      addRisk(engagementId, form.linkItem, {
        title: form.title, description: form.description,
        impact: form.impact as any, likelihood: form.likelihood as any,
        treatment: form.treatment, owner: form.owner || undefined,
        assigneeId: form.assigneeId || undefined,
        rationale: form.rationale || undefined,
        linkedObservationIds: [], linkedItemIds: [form.linkItem],
        provenance: 'manual',
      });
    } else if (open?.mode === 'edit') {
      updateRisk(engagementId, open.itemId, open.riskId, {
        title: form.title, description: form.description,
        impact: form.impact as any, likelihood: form.likelihood as any,
        treatment: form.treatment, owner: form.owner || undefined,
        assigneeId: form.assigneeId || undefined,
        rationale: form.rationale || undefined,
      });
    }
    setOpen(null);
  }

  function runAI() {
    const n = aiGen(engagementId);
    setAiBanner(n > 0 ? `AI drafted ${n} new risk${n === 1 ? '' : 's'} from the current observations.` : 'No new risks generated. Risks are only generated for items with confirmed observations.');
    setTimeout(() => setAiBanner(null), 5000);
  }

  if (!eng || !fw) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      {aiBanner && <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 flex items-center gap-2"><Sparkles size={14} /><span>{aiBanner}</span></div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card elevated>
          <CardHeader icon={<AlertTriangle size={16} />} title="Risk register summary" />
          <div className="grid grid-cols-2 gap-3">
            <KV label="Total" value={risks.length.toString()} />
            <KV label="Critical (≥16)" value={risks.filter((r) => r.risk.inherentScore >= 16).length.toString()} tone="risk" />
            <KV label="High (9–15)" value={risks.filter((r) => r.risk.inherentScore >= 9 && r.risk.inherentScore < 16).length.toString()} tone="warn" />
            <KV label="Medium / Low" value={risks.filter((r) => r.risk.inherentScore < 9).length.toString()} tone="ok" />
          </div>
          <div className="mt-4 pt-4 border-t border-navy-700/50 flex items-center gap-2 flex-wrap">
            <Button variant="outline" iconLeft={<Sparkles size={14} />} onClick={runAI}>Generate from observations</Button>
            <Button onClick={openAdd} iconLeft={<Plus size={14} />}>Add risk</Button>
          </div>
        </Card>

        <Card elevated className="lg:col-span-2">
          <CardHeader title="Risk matrix" subtitle="Inherent risk plotted on impact × likelihood" />
          <RiskMatrix risks={risks.map((r) => ({ id: r.risk.id, title: r.risk.title, impact: r.risk.impact, likelihood: r.risk.likelihood }))} />
        </Card>
      </div>

      <Card elevated className="!p-0 overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-white">Risks</h3>
          <p className="text-xs text-slate-400 mt-0.5">Sorted by inherent risk score (descending).</p>
        </div>
        <div className="divide-y divide-navy-700/40">
          {sorted.map(({ risk, itemId }) => {
            const it = findItem(fw, itemId);
            const assignee = users.find((u) => u.id === risk.assigneeId);
            const isOpen = expanded[risk.id] ?? false;
            return (
              <div key={risk.id} className="px-5 py-4 hover:bg-navy-700/15">
                <div className="flex items-start justify-between gap-4">
                  <button onClick={() => setExpanded((e) => ({ ...e, [risk.id]: !isOpen }))} className="flex items-start gap-2 flex-1 min-w-0 text-left">
                    {isOpen ? <ChevronDown size={16} className="mt-0.5 text-slate-400 shrink-0" /> : <ChevronRightIcon size={16} className="mt-0.5 text-slate-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{risk.title}</div>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge tone={risk.inherentScore >= 16 ? 'critical' : risk.inherentScore >= 9 ? 'risk' : risk.inherentScore >= 4 ? 'warn' : 'ok'} dot>Score {risk.inherentScore}</Badge>
                        <Badge tone="muted">Impact {risk.impact}</Badge>
                        <Badge tone="muted">Likelihood {risk.likelihood}</Badge>
                        <Badge tone="info">{risk.treatment}</Badge>
                        <Badge tone={risk.provenance === 'manual' ? 'muted' : 'cyan'} dot>{risk.provenance === 'manual' ? 'Manual' : 'AI'}</Badge>
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
                    <Button size="sm" variant="ghost" iconLeft={<Pencil size={12} />} onClick={() => openEdit(itemId, risk)}>Edit</Button>
                  </div>
                </div>
                <div className={`mt-2 ${isOpen ? '' : 'line-clamp-2'}`}>
                  {risk.description.split('\n\n').map((p, i) => (
                    <p key={i} className="text-sm text-slate-300 leading-relaxed mt-2 first:mt-0">{p}</p>
                  ))}
                </div>
                {isOpen && risk.rationale && (
                  <div className="mt-2 p-3 rounded-md bg-navy-900/40 border border-navy-700/50">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Rationale</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{risk.rationale}</p>
                  </div>
                )}
                {it && (
                  <div className="mt-3 pt-3 border-t border-navy-700/50 text-[11px] text-slate-500">
                    Linked control: <span className="font-mono text-slate-300">{it.code}</span> · {it.title}
                    {risk.owner && <> <span className="text-slate-600">·</span> Owner: <span className="text-slate-300">{risk.owner}</span></>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Modal open={!!open} onClose={() => setOpen(null)}
        title={open?.mode === 'add' ? 'Add risk' : 'Edit risk'}
        size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button>
          <Button onClick={save}>{open?.mode === 'add' ? 'Save risk' : 'Save changes'}</Button>
        </>}
      >
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" rows={8} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the realistic exposure scenario, the conditions that drive likelihood, and the material consequences if it crystallises." />
          <Textarea label="Rationale (impact × likelihood justification)" rows={3} value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select label="Impact" value={form.impact.toString()} onChange={(e) => setForm({ ...form, impact: +e.target.value })}
              options={[1,2,3,4,5].map((n) => ({ value: n.toString(), label: n.toString() }))} />
            <Select label="Likelihood" value={form.likelihood.toString()} onChange={(e) => setForm({ ...form, likelihood: +e.target.value })}
              options={[1,2,3,4,5].map((n) => ({ value: n.toString(), label: n.toString() }))} />
            <Select label="Treatment" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value as any })}
              options={['Mitigate','Accept','Transfer','Avoid'].map((t) => ({ value: t, label: t }))} />
            <Input label="Owner (role)" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="CISO Office" />
            <Select label="Linked control" value={form.linkItem} onChange={(e) => setForm({ ...form, linkItem: e.target.value })}
              options={items.map((ai) => {
                const it = findItem(fw, ai.itemId);
                return { value: ai.itemId, label: it ? `${it.code} ${it.title}` : ai.itemId };
              })} />
            <Select label="Assignee" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              options={[{ value: '', label: '— Unassigned —' }, ...users.map((u) => ({ value: u.id, label: u.name }))]} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function KV({ label, value, tone = 'default' }: { label: string; value: string; tone?: string }) {
  const c = tone === 'risk' ? 'text-red-300' : tone === 'warn' ? 'text-amber-300' : tone === 'ok' ? 'text-emerald-300' : 'text-white';
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-2xl font-bold font-mono ${c}`}>{value}</div>
    </div>
  );
}
