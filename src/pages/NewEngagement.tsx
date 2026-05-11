import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ShieldCheck, Calendar } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { listFrameworks } from '@/data/frameworks';
import type { FrameworkId, IGTier } from '@/types';

export default function NewEngagement() {
  const nav = useNavigate();
  const clients = useStore((s) => s.clients);
  const users = useStore((s) => s.users);
  const createEngagement = useStore((s) => s.createEngagement);

  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [framework, setFramework] = useState<FrameworkId>('NIST_CSF_2_0');
  const [igTier, setIgTier] = useState<IGTier | ''>('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [leadAssessor, setLeadAssessor] = useState(users.find((u) => u.role === 'Senior Consultant')?.id || users.find((u) => u.role === 'Engagement Manager')?.id || users[0].id);
  const [team, setTeam] = useState<string[]>([leadAssessor]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetEndDate, setTargetEndDate] = useState(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));
  const [scope, setScope] = useState('');

  function next() { setStep((s) => Math.min(3, s + 1)); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  function submit() {
    const id = createEngagement({
      clientId,
      framework,
      igTier: framework === 'CIS_V8_1_2' && igTier ? Number(igTier) as IGTier : undefined,
      year,
      leadAssessor,
      team,
      startDate,
      targetEndDate,
      scope,
    });
    nav(`/engagements/${id}/setup`);
  }

  const steps = [
    { label: 'Client', desc: 'Pick the client' },
    { label: 'Framework', desc: 'NIST, CIS or CAF' },
    { label: 'Team & dates', desc: 'Lead, team, schedule' },
    { label: 'Scope', desc: 'Final scope statement' },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="New engagement"
        title="Start a maturity assessment"
        description="Configure the engagement in four short steps. You can edit any field later from the Setup stage."
      />

      <div className="px-6 lg:px-8 py-6 max-w-4xl">
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium flex-1 ${
                i === step ? 'border-accent-500/50 bg-accent-500/10 text-accent-200' :
                i < step ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' :
                'border-navy-700/60 bg-navy-900/40 text-slate-400'
              }`}>
                <span className="font-mono text-[10px] opacity-70">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1">
                  <div>{s.label}</div>
                  <div className="text-[10px] opacity-60 font-normal">{s.desc}</div>
                </div>
              </div>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-slate-600" />}
            </div>
          ))}
        </div>

        <Card elevated>
          {step === 0 && (
            <div>
              <CardHeader title="Choose client" subtitle="Select an existing client or add new from the Clients page first." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {clients.map((c) => (
                  <button
                    key={c.id} onClick={() => setClientId(c.id)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                      clientId === c.id ? 'border-accent-500/60 bg-accent-500/10' : 'border-navy-700/60 hover:border-navy-500/60 hover:bg-navy-700/30'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0"
                      style={{ background: `linear-gradient(135deg, ${c.logoColour}, ${c.logoColour}aa)` }}>
                      {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.industry} · {c.country} · {c.sizeBand}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <CardHeader title="Choose framework" subtitle="The framework determines control library, scoring set and report templates." />
              <div className="grid gap-3">
                {listFrameworks().map((fw) => (
                  <button
                    key={fw.id} onClick={() => { setFramework(fw.id); if (fw.id !== 'CIS_V8_1_2') setIgTier(''); }}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition ${
                      framework === fw.id ? 'border-accent-500/60 bg-accent-500/10' : 'border-navy-700/60 hover:border-navy-500/60'
                    }`}
                  >
                    <ShieldCheck className="text-accent-400 mt-0.5" size={18} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{fw.name}</span>
                        <Badge tone="accent">{fw.version}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fw.description}</p>
                    </div>
                  </button>
                ))}
                {framework === 'CIS_V8_1_2' && (
                  <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-4">
                    <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2">Implementation Group</div>
                    <div className="grid grid-cols-3 gap-2">
                      {([1, 2, 3] as IGTier[]).map((t) => (
                        <button
                          key={t} onClick={() => setIgTier(t)}
                          className={`rounded-md border px-3 py-2 text-sm transition ${
                            igTier === t ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200' : 'border-navy-700/60 text-slate-300 hover:border-cyan-500/30'
                          }`}
                        >
                          IG{t}
                          <div className="text-[10px] opacity-70 mt-0.5">
                            {t === 1 ? 'Essentials' : t === 2 ? 'Foundational' : 'Organisational'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <CardHeader title="Team and schedule" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Lead assessor"
                  value={leadAssessor}
                  onChange={(e) => setLeadAssessor(e.target.value)}
                  options={users.filter((u) => u.role === 'Senior Consultant' || u.role === 'Engagement Manager').map((u) => ({ value: u.id, label: `${u.name} — ${u.role}` }))}
                />
                <Input
                  label="Year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value || '0'))}
                />
                <Input
                  label="Start date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Input
                  label="Target end date"
                  type="date"
                  value={targetEndDate}
                  onChange={(e) => setTargetEndDate(e.target.value)}
                />
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Team</label>
                  <div className="flex flex-wrap gap-2">
                    {users.map((u) => {
                      const active = team.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          onClick={() =>
                            setTeam((t) => (active ? t.filter((x) => x !== u.id) : [...t, u.id]))
                          }
                          className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition ${
                            active ? 'border-accent-500/60 bg-accent-500/10 text-white' : 'border-navy-700/60 text-slate-400'
                          }`}
                        >
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                            style={{ background: u.avatarColour }}>{u.initials}</span>
                          <span>{u.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <CardHeader title="Scope" subtitle="A short paragraph defining what is in and out of scope. This appears in the report." />
              <Textarea
                rows={6}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. Group-wide assessment covering Retail Banking, Wealth Management and Corporate Lending. Excludes acquired Channel Islands subsidiary."
              />
              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Client" value={clients.find((c) => c.id === clientId)?.name || '—'} />
                <Stat label="Framework" value={listFrameworks().find((f) => f.id === framework)?.shortName || '—'} extra={igTier ? `IG${igTier}` : undefined} />
                <Stat label="Lead" value={users.find((u) => u.id === leadAssessor)?.name || '—'} />
                <Stat label="Year / End" value={`${year}`} extra={targetEndDate} />
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-navy-700/60 flex items-center justify-between">
            <Button variant="ghost" onClick={back} disabled={step === 0} iconLeft={<ChevronLeft size={15} />}>Back</Button>
            {step < steps.length - 1
              ? <Button onClick={next} iconRight={<ChevronRight size={15} />}>Continue</Button>
              : <Button onClick={submit} iconRight={<Calendar size={15} />}>Create engagement</Button>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, extra }: { label: string; value: string; extra?: string }) {
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-white truncate">{value}</div>
      {extra && <div className="text-[11px] text-cyan-400 mt-0.5">{extra}</div>}
    </div>
  );
}
