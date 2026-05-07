import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, Sparkles, Plus, Filter, Pencil, FileText, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { FRAMEWORKS, findItem } from '@/data/frameworks';
import { themeForItem, SEVERITY_RANK } from '@/data/content-library';
import type { Observation, Severity } from '@/types';

const SEV: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
const SEV_TONE: Record<Severity, any> = { Critical: 'critical', High: 'risk', Medium: 'warn', Low: 'muted' };

export default function Observations() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const users = useStore((s) => s.users);
  const addObservation = useStore((s) => s.addObservation);
  const updateObservation = useStore((s) => s.updateObservation);
  const aiGen = useStore((s) => s.aiGenerateObservations);

  const [open, setOpen] = useState<{ mode: 'add' } | { mode: 'edit'; itemId: string; obsId: string } | null>(null);
  const [form, setForm] = useState({
    title: '', body: '', theme: 'Governance', severity: 'Medium' as Severity,
    linkItem: '', assigneeId: '', status: 'Draft' as 'Draft' | 'In Review' | 'Confirmed',
  });
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterTheme, setFilterTheme] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [aiBanner, setAiBanner] = useState<string | null>(null);

  const fw = eng && FRAMEWORKS[eng.framework];

  const observations = useMemo(() => {
    return items
      .flatMap((i) => i.observations.map((o) => ({ obs: o, itemId: i.itemId })))
      .filter((o) => filterSeverity === 'all' || o.obs.severity === filterSeverity)
      .filter((o) => filterTheme === 'all' || o.obs.theme === filterTheme)
      .filter((o) => filterAssignee === 'all' || o.obs.assigneeId === filterAssignee)
      .sort((a, b) => SEVERITY_RANK[b.obs.severity] - SEVERITY_RANK[a.obs.severity]);
  }, [items, filterSeverity, filterTheme, filterAssignee]);

  const themes = Array.from(new Set(items.flatMap((i) => i.observations.map((o) => o.theme))));

  function openAdd() {
    setForm({ title: '', body: '', theme: 'Governance', severity: 'Medium', linkItem: items[0]?.itemId || '', assigneeId: '', status: 'Draft' });
    setOpen({ mode: 'add' });
  }
  function openEdit(itemId: string, obs: Observation) {
    setForm({ title: obs.title, body: obs.body, theme: obs.theme, severity: obs.severity, linkItem: itemId, assigneeId: obs.assigneeId ?? '', status: obs.status ?? 'Draft' });
    setOpen({ mode: 'edit', itemId, obsId: obs.id });
  }
  function save() {
    if (!form.linkItem || !form.title.trim()) return;
    if (open?.mode === 'add') {
      const theme = fw ? themeForItem(form.linkItem, fw.id) : form.theme;
      addObservation(engagementId, form.linkItem, {
        title: form.title, body: form.body, theme, severity: form.severity,
        provenance: 'manual', linkedItemIds: [form.linkItem],
        assigneeId: form.assigneeId || undefined, status: form.status,
      });
    } else if (open?.mode === 'edit') {
      updateObservation(engagementId, open.itemId, open.obsId, {
        title: form.title, body: form.body, theme: form.theme, severity: form.severity,
        assigneeId: form.assigneeId || undefined, status: form.status,
      });
    }
    setOpen(null);
  }

  function runAI() {
    const n = aiGen(engagementId);
    setAiBanner(n > 0 ? `AI drafted ${n} new observation${n === 1 ? '' : 's'} from the current notes.` : 'No new observations generated. Items either already have observations or scored too high to flag.');
    setTimeout(() => setAiBanner(null), 5000);
  }

  if (!eng || !fw) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      {aiBanner && <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 flex items-center gap-2"><Sparkles size={14} /><span>{aiBanner}</span></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SEV.map((s) => (
          <Card key={s} elevated className="!p-4">
            <div className="flex items-center justify-between">
              <Badge tone={SEV_TONE[s]}>{s}</Badge>
              <Eye size={14} className="text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-2">
              {observations.filter((o) => o.obs.severity === s).length}
            </div>
          </Card>
        ))}
      </div>

      <Card elevated className="!p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-xs px-1"><Filter size={13} /> Filter</div>
          <Select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}
            options={[{ value: 'all', label: 'All severities' }, ...SEV.map((x) => ({ value: x, label: x }))]} className="!w-44" />
          <Select value={filterTheme} onChange={(e) => setFilterTheme(e.target.value)}
            options={[{ value: 'all', label: 'All themes' }, ...themes.map((t) => ({ value: t, label: t }))]} className="!w-56" />
          <Select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}
            options={[{ value: 'all', label: 'All assignees' }, ...users.map((u) => ({ value: u.id, label: u.name }))]} className="!w-56" />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" iconLeft={<Sparkles size={14} />} onClick={runAI}>Generate from notes</Button>
            <Button onClick={openAdd} iconLeft={<Plus size={14} />}>Add observation</Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {observations.map(({ obs, itemId }) => {
          const it = findItem(fw, itemId);
          const assignee = users.find((u) => u.id === obs.assigneeId);
          const isOpen = expanded[obs.id] ?? false;
          return (
            <Card key={obs.id} elevated>
              <div className="flex items-start justify-between gap-3 mb-2">
                <button onClick={() => setExpanded((e) => ({ ...e, [obs.id]: !isOpen }))} className="flex items-start gap-2 text-left flex-1 min-w-0">
                  {isOpen ? <ChevronDown size={16} className="mt-1 text-slate-400 shrink-0" /> : <ChevronRightIcon size={16} className="mt-1 text-slate-400 shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-white">{obs.title}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge tone={SEV_TONE[obs.severity]} dot>{obs.severity}</Badge>
                      <Badge tone="muted">{obs.theme}</Badge>
                      {obs.status && <Badge tone={obs.status === 'Confirmed' ? 'ok' : obs.status === 'In Review' ? 'cyan' : 'muted'} dot>{obs.status}</Badge>}
                      <Badge tone={obs.provenance === 'manual' ? 'muted' : 'cyan'} dot>{obs.provenance === 'manual' ? 'Manual' : 'AI'}</Badge>
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
                  <Button size="sm" variant="ghost" iconLeft={<Pencil size={12} />} onClick={() => openEdit(itemId, obs)}>Edit</Button>
                </div>
              </div>
              <div className={isOpen ? '' : 'line-clamp-3'}>
                {obs.body.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm text-slate-300 leading-relaxed mt-2 first:mt-0">{para}</p>
                ))}
              </div>
              {it && (
                <div className="mt-3 pt-3 border-t border-navy-700/50 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                  <span>
                    Linked control: <span className="font-mono text-slate-300">{it.code}</span> · {it.title}
                    {' '}<span className="text-slate-600">·</span>{' '}
                    Theme: <span className="text-slate-300">{obs.theme}</span>
                  </span>
                  {obs.evidenceRefs && obs.evidenceRefs.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-slate-400"><FileText size={11} />{obs.evidenceRefs.length} evidence ref{obs.evidenceRefs.length === 1 ? '' : 's'}</span>
                  )}
                </div>
              )}
            </Card>
          );
        })}
        {observations.length === 0 && (
          <Card elevated>
            <div className="py-10 text-center">
              <Eye className="mx-auto text-accent-400/70 mb-2" size={28} />
              <div className="text-sm text-slate-200 font-semibold">No observations yet.</div>
              <div className="text-xs text-slate-500 mt-1">Generate from notes via AI Studio or add one manually.</div>
            </div>
          </Card>
        )}
      </div>

      <Modal
        open={!!open} onClose={() => setOpen(null)}
        title={open?.mode === 'add' ? 'Add observation' : 'Edit observation'}
        size="lg"
        footer={<>
          <Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button>
          <Button onClick={save}>{open?.mode === 'add' ? 'Save observation' : 'Save changes'}</Button>
        </>}
      >
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Inconsistent policy review cadence across the security policy framework" />
          <Textarea label="Body" rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What did you observe? Why does it matter? Use multiple paragraphs (separate with a blank line) for readability in the report." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}
              options={SEV.map((s) => ({ value: s, label: s }))} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              options={['Draft', 'In Review', 'Confirmed'].map((s) => ({ value: s, label: s }))} />
            <Select label="Linked control" value={form.linkItem} onChange={(e) => setForm({ ...form, linkItem: e.target.value })}
              options={items.map((ai) => {
                const it = findItem(fw, ai.itemId);
                return { value: ai.itemId, label: it ? `${it.code} ${it.title}` : ai.itemId };
              })} />
            <Select label="Assignee" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              options={[{ value: '', label: '— Unassigned —' }, ...users.map((u) => ({ value: u.id, label: u.name }))]} />
          </div>
          {form.linkItem && (
            <div className="text-[11px] text-slate-500">
              Theme will be set automatically based on the linked control: <span className="text-cyan-400">{themeForItem(form.linkItem, fw.id)}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
