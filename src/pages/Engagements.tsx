import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Briefcase } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AvatarStack } from '@/components/ui/Avatar';
import { FRAMEWORKS } from '@/data/frameworks';
import { Select } from '@/components/ui/Input';
import { format } from 'date-fns';
import { detailedProgress } from '@/lib/aggregations';

export default function Engagements() {
  const engagements = useStore((s) => s.engagements);
  const clients = useStore((s) => s.clients);
  const users = useStore((s) => s.users);
  const itemsByEng = useStore((s) => s.assessmentItemsByEngagement);
  const roadmapByEng = useStore((s) => s.roadmapByEngagement);

  const [framework, setFramework] = useState<string>('all');
  const [industry, setIndustry] = useState<string>('all');
  const [country, setCountry] = useState<string>('all');
  const [year, setYear] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const industries = useMemo(() => Array.from(new Set(clients.map((c) => c.industry))), [clients]);
  const countries = useMemo(() => Array.from(new Set(clients.map((c) => c.country))), [clients]);
  const years = useMemo(() => Array.from(new Set(engagements.map((e) => e.year))).sort((a, b) => b - a), [engagements]);

  const filtered = useMemo(() => {
    return engagements.filter((e) => {
      const c = clients.find((cl) => cl.id === e.clientId);
      if (!c) return false;
      if (framework !== 'all' && e.framework !== framework) return false;
      if (industry !== 'all' && c.industry !== industry) return false;
      if (country !== 'all' && c.country !== country) return false;
      if (year !== 'all' && e.year.toString() !== year) return false;
      if (status !== 'all' && e.status !== status) return false;
      return true;
    });
  }, [engagements, clients, framework, industry, country, year, status]);

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Engagements"
        description={`${filtered.length} of ${engagements.length} engagements shown.`}
        actions={
          <Link to="/engagements/new" className="btn-primary">
            <Plus size={15} /> New engagement
          </Link>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-5">
        <Card elevated className="!p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400 text-xs px-1">
              <Filter size={13} /> Filter
            </div>
            <Select
              value={framework} onChange={(e) => setFramework(e.target.value)}
              options={[
                { value: 'all', label: 'All frameworks' },
                { value: 'NIST_CSF_2_0', label: 'NIST CSF 2.0' },
                { value: 'CIS_V8_1_2', label: 'CIS Controls v8.1.2' },
                { value: 'NCSC_CAF_4_0', label: 'NCSC CAF 4.0' },
              ]}
              className="!py-1.5 !w-44"
            />
            <Select
              value={industry} onChange={(e) => setIndustry(e.target.value)}
              options={[{ value: 'all', label: 'All industries' }, ...industries.map((i) => ({ value: i, label: i }))]}
              className="!py-1.5 !w-44"
            />
            <Select
              value={country} onChange={(e) => setCountry(e.target.value)}
              options={[{ value: 'all', label: 'All countries' }, ...countries.map((c) => ({ value: c, label: c }))]}
              className="!py-1.5 !w-44"
            />
            <Select
              value={year} onChange={(e) => setYear(e.target.value)}
              options={[{ value: 'all', label: 'All years' }, ...years.map((y) => ({ value: y.toString(), label: y.toString() }))]}
              className="!py-1.5 !w-32"
            />
            <Select
              value={status} onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All statuses' },
                ...['Setup','Footprint','Documentation Review','Workshops & Notes','Observations','Scoring','Risks','Recommendations','Roadmap','Benchmarking','Reporting','QA Review','Signed Off'].map((s) => ({ value: s, label: s })),
              ]}
              className="!py-1.5 !w-48"
            />
          </div>
        </Card>

        <Card elevated className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-3 py-3 font-medium">Framework</th>
                <th className="px-3 py-3 font-medium">Year</th>
                <th className="px-3 py-3 font-medium">Stage</th>
                <th className="px-3 py-3 font-medium">Progress</th>
                <th className="px-3 py-3 font-medium">Lead</th>
                <th className="px-3 py-3 font-medium">Team</th>
                <th className="px-3 py-3 font-medium">Target end</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40">
              {filtered.map((eng) => {
                const c = clients.find((cl) => cl.id === eng.clientId)!;
                const lead = users.find((u) => u.id === eng.leadAssessor)!;
                const team = eng.team.map((id) => users.find((u) => u.id === id)!);
                const fw = FRAMEWORKS[eng.framework];
                return (
                  <tr key={eng.id} className="hover:bg-navy-700/20 group">
                    <td className="px-5 py-3">
                      <Link to={`/engagements/${eng.id}/setup`} className="flex items-center gap-3 group-hover:text-white">
                        <div className="h-8 w-8 rounded-md flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                          style={{ background: `linear-gradient(135deg, ${c.logoColour}, ${c.logoColour}aa)` }}>
                          {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-white">{c.name}</div>
                          <div className="text-[10px] text-slate-500">{c.industry} · {c.country}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge tone="accent">{fw.shortName}</Badge>
                        {eng.igTier && <Badge tone="cyan">IG{eng.igTier}</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 font-mono text-xs">{eng.year}</td>
                    <td className="px-3 py-3">
                      <Badge tone={eng.status === 'Signed Off' ? 'ok' : 'info'} dot>{eng.status}</Badge>
                    </td>
                    <td className="px-3 py-3 w-40">
                      {(() => {
                        const { pct } = detailedProgress(eng, itemsByEng[eng.id] || [], roadmapByEng[eng.id] || []);
                        return (
                          <>
                            <ProgressBar value={pct} tone={pct === 100 ? 'ok' : 'accent'} />
                            <div className="text-[10px] text-slate-500 mt-1">{pct}%{pct === 100 ? ' · Complete' : ''}</div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] text-white font-semibold"
                          style={{ background: `linear-gradient(135deg, ${lead.avatarColour}, ${lead.avatarColour}aa)` }}>{lead.initials}</span>
                        <span className="text-xs text-slate-200">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <AvatarStack items={team.map((u) => ({ initials: u.initials, colour: u.avatarColour, name: u.name }))} />
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-400">{format(new Date(eng.targetEndDate), 'd MMM yyyy')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-14 flex flex-col items-center text-center">
              <Briefcase className="text-accent-400/70 mb-2" size={28} />
              <div className="text-sm font-semibold text-slate-200">No engagements match your filters.</div>
              <div className="text-xs text-slate-500 mt-1">Try widening the filters above.</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
