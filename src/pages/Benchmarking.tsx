import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { MaturityRadar } from '@/components/charts/MaturityRadar';
import { BenchmarkBars } from '@/components/charts/BenchmarkBars';
import { PercentileBand } from '@/components/charts/PercentileBand';
import { buildBenchmarkSeries, buildRadarSeries, overallAverage } from '@/lib/aggregations';
import { FRAMEWORKS } from '@/data/frameworks';
import type { FrameworkId } from '@/types';
import { findBenchmark } from '@/data/mock-benchmarks';

export default function Benchmarking() {
  const engagements = useStore((s) => s.engagements);
  const clients = useStore((s) => s.clients);
  const items = useStore((s) => s.assessmentItemsByEngagement);

  const [engId, setEngId] = useState(engagements[0]?.id || '');
  const [scope, setScope] = useState<'industry' | 'country' | 'global' | 'size-band'>('industry');
  const [scopeValue, setScopeValue] = useState<string>('Financial Services');

  const eng = engagements.find((e) => e.id === engId);
  const client = eng && clients.find((c) => c.id === eng.clientId);
  const ais = eng ? items[eng.id] || [] : [];

  const radar = useMemo(() => eng ? buildRadarSeries(eng, ais, { scope, value: scopeValue }) : [], [eng, ais, scope, scopeValue]);
  const bars = useMemo(() => eng ? buildBenchmarkSeries(eng, ais, scope, scopeValue) : [], [eng, ais, scope, scopeValue]);
  const bm = eng ? findBenchmark(scope, scopeValue, eng.framework) : undefined;

  const scopeOptions = useMemo(() => {
    if (scope === 'industry') return Array.from(new Set(clients.map((c) => c.industry)));
    if (scope === 'country') return Array.from(new Set(clients.map((c) => c.country)));
    if (scope === 'size-band') return ['Small', 'Mid-market', 'Large', 'Enterprise'];
    return ['All'];
  }, [scope, clients]);

  // Peer comparison: same framework + industry
  const peers = useMemo(() => {
    if (!eng || !client) return [];
    return engagements
      .filter((e) => e.id !== eng.id && e.framework === eng.framework)
      .map((e) => {
        const c = clients.find((cl) => cl.id === e.clientId)!;
        const overall = overallAverage(items[e.id] || []);
        return { eng: e, client: c, overall };
      })
      .sort((a, b) => b.overall - a.overall);
  }, [eng, client, engagements, clients, items]);

  const myOverall = useMemo(() => eng ? overallAverage(ais) : 0, [eng, ais]);
  const cohortAverage = bm ? Object.values(bm.averageByGroup).reduce((a, b) => a + b, 0) / Object.values(bm.averageByGroup).length : 0;
  const ranking = peers.filter((p) => p.overall > myOverall).length + 1;
  const totalRanked = peers.length + 1;
  const percentile = totalRanked > 1 ? Math.round((1 - (ranking - 1) / totalRanked) * 100) : 50;

  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Benchmarking"
        description="Compare an engagement against industry, country, size band or global cohorts using internal and reference benchmarks."
      />

      <div className="px-6 lg:px-8 py-6 space-y-5">
        <Card elevated className="!p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select label="Engagement" value={engId} onChange={(e) => setEngId(e.target.value)}
              options={engagements.map((eng) => {
                const c = clients.find((cl) => cl.id === eng.clientId)!;
                const fw = FRAMEWORKS[eng.framework as FrameworkId];
                return { value: eng.id, label: `${c.name} — ${fw.shortName} ${eng.year}` };
              })} />
            <Select label="Cohort scope" value={scope}
              onChange={(e) => { const v = e.target.value as any; setScope(v); setScopeValue(v === 'global' ? 'All' : v === 'size-band' ? 'Enterprise' : v === 'country' ? 'United Kingdom' : 'Financial Services'); }}
              options={[
                { value: 'industry', label: 'Industry' },
                { value: 'country', label: 'Country' },
                { value: 'size-band', label: 'Company size' },
                { value: 'global', label: 'Global (all)' },
              ]} />
            <Select label="Cohort value" value={scopeValue} onChange={(e) => setScopeValue(e.target.value)}
              options={scopeOptions.map((o) => ({ value: o, label: o }))} disabled={scope === 'global'} />
            <div className="flex items-end gap-2">
              <div className="text-xs">
                <div className="text-slate-400">Cohort size</div>
                <div className="text-2xl font-bold text-white font-mono">{bm?.cohortSize ?? '—'}</div>
                <div className="text-[10px] text-slate-500">contributing assessments</div>
              </div>
            </div>
          </div>
        </Card>

        {eng && client && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Overall maturity" value={myOverall.toFixed(1)} sub="/ 5" tone="accent" />
              <Stat label="Cohort average" value={cohortAverage.toFixed(1)} sub="/ 5" tone="muted" />
              <Stat label="Gap to cohort" value={(myOverall - cohortAverage).toFixed(1)} sub="" tone={myOverall >= cohortAverage ? 'ok' : 'warn'}
                icon={myOverall >= cohortAverage ? TrendingUp : TrendingDown} />
              <Stat label="Percentile rank" value={`${percentile}`} sub={`th of ${totalRanked}`} tone="cyan" icon={Award} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card elevated>
                <CardHeader title="Maturity vs benchmark — radar" subtitle={`${client.name} · ${FRAMEWORKS[eng.framework].shortName}`} actions={<Badge tone="cyan">{scope}: {scopeValue}</Badge>} />
                <MaturityRadar data={radar} height={340} />
              </Card>
              <Card elevated>
                <CardHeader title="Per-group breakdown" subtitle="Lower / cohort average / upper quartile / client" />
                <BenchmarkBars data={bars} height={340} />
              </Card>
            </div>

            <Card elevated>
              <CardHeader title="Cohort distribution per group" subtitle="Where the client sits within the percentile band; gap to cohort average shown alongside." />
              <PercentileBand data={bars} />
            </Card>

            <Card elevated>
              <CardHeader title="Peer comparison" subtitle={`Other engagements assessed against ${FRAMEWORKS[eng.framework].shortName}`} />
              {peers.length === 0 ? (
                <div className="text-sm text-slate-400">No peers in the workspace for this framework.</div>
              ) : (
                <div className="space-y-2">
                  {[...peers, { eng, client, overall: myOverall, isMe: true } as any].sort((a: any, b: any) => b.overall - a.overall).map((p: any, idx: number) => {
                    const pct = (p.overall / 5) * 100;
                    return (
                      <div key={p.eng.id} className={`flex items-center gap-3 rounded-lg border ${p.isMe ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-navy-700/60 bg-navy-900/40'} px-3 py-2`}>
                        <span className="font-mono text-xs text-slate-500 w-6">#{idx + 1}</span>
                        <div className="h-7 w-7 rounded-md flex items-center justify-center text-white text-[10px] font-semibold shrink-0"
                          style={{ background: `linear-gradient(135deg, ${p.client.logoColour}, ${p.client.logoColour}aa)` }}>
                          {p.client.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white flex items-center gap-2">
                            {p.client.name}{p.isMe && <Badge tone="cyan">This engagement</Badge>}
                          </div>
                          <div className="text-[11px] text-slate-500">{p.client.industry} · {p.client.country} · {p.eng.year}</div>
                        </div>
                        <div className="hidden md:block w-48">
                          <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                            <div className={`h-full ${p.isMe ? 'bg-cyan-400' : 'bg-accent-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="font-mono text-sm text-white w-12 text-right">{p.overall.toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card elevated>
              <CardHeader title="Gap analysis — strongest and weakest groups vs cohort" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className="text-[11px] text-emerald-300 uppercase tracking-wider mb-2">Strengths</div>
                  {[...bars].sort((a, b) => (b.current - b.benchmark) - (a.current - a.benchmark)).slice(0, 3).map((b) => (
                    <div key={b.axis} className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white">{b.axis}</div>
                        <div className="font-mono text-xs text-emerald-300">+{(b.current - b.benchmark).toFixed(1)} vs avg</div>
                      </div>
                      <div className="text-[11px] text-slate-400">Client {b.current.toFixed(1)} vs cohort {b.benchmark.toFixed(1)} · upper-quartile {b.topQuartile.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[11px] text-amber-300 uppercase tracking-wider mb-2">Improvement areas</div>
                  {[...bars].sort((a, b) => (a.current - a.benchmark) - (b.current - b.benchmark)).slice(0, 3).map((b) => (
                    <div key={b.axis} className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white">{b.axis}</div>
                        <div className="font-mono text-xs text-amber-300">{(b.current - b.benchmark).toFixed(1)} vs avg</div>
                      </div>
                      <div className="text-[11px] text-slate-400">Client {b.current.toFixed(1)} vs cohort {b.benchmark.toFixed(1)} · lower-quartile {b.bottomQuartile.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone = 'accent', icon: Icon }: { label: string; value: string; sub: string; tone?: string; icon?: any }) {
  const c: Record<string, string> = { accent: 'text-accent-300', cyan: 'text-cyan-400', ok: 'text-emerald-300', warn: 'text-amber-300', muted: 'text-slate-200' };
  return (
    <Card elevated className="!p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
        {Icon && <Icon size={14} className={c[tone]} />}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-3xl font-bold font-mono ${c[tone]}`}>{value}</span>
        {sub && <span className="text-xs text-slate-500">{sub}</span>}
      </div>
    </Card>
  );
}
