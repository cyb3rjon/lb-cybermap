import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { MaturityRadar } from '@/components/charts/MaturityRadar';
import { BenchmarkBars } from '@/components/charts/BenchmarkBars';
import { PercentileBand } from '@/components/charts/PercentileBand';
import { YoyTrend } from '@/components/charts/YoyTrend';
import { buildRadarSeries, buildBenchmarkSeries, overallAverage } from '@/lib/aggregations';
import { findBenchmark } from '@/data/mock-benchmarks';
import { FRAMEWORKS } from '@/data/frameworks';

export default function EngagementBenchmarking() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const allEngagements = useStore((s) => s.engagements);
  const clients = useStore((s) => s.clients);
  const allItems = useStore((s) => s.assessmentItemsByEngagement);
  const client = useStore((s) => eng && s.getClient(eng.clientId));

  const [scope, setScope] = useState<'industry' | 'country' | 'global' | 'size-band'>('industry');
  const [scopeValue, setScopeValue] = useState<string>(client?.industry ?? 'Financial Services');

  const radar = useMemo(() => eng ? buildRadarSeries(eng, items, { scope, value: scopeValue }) : [], [eng, items, scope, scopeValue]);
  const bars = useMemo(() => eng ? buildBenchmarkSeries(eng, items, scope, scopeValue) : [], [eng, items, scope, scopeValue]);
  const bm = eng ? findBenchmark(scope, scopeValue, eng.framework) : undefined;
  const myOverall = useMemo(() => eng ? overallAverage(items) : 0, [eng, items]);

  // Year-on-year — based on prior engagements for the same client/framework
  const priorEngagements = useMemo(() => {
    if (!eng || !client) return [];
    return allEngagements
      .filter((e) => e.clientId === client.id && e.framework === eng.framework && e.id !== eng.id && e.year < eng.year)
      .sort((a, b) => a.year - b.year);
  }, [eng, client, allEngagements]);

  const yoy = useMemo(() => {
    if (!eng || !client) return [];
    const series = [...priorEngagements.map((e) => ({ year: String(e.year), overall: overallAverage(allItems[e.id] || []), govern: 0, identify: 0, protect: 0, detect: 0, respond: 0, recover: 0 })),
      { year: String(eng.year), overall: myOverall, govern: 0, identify: 0, protect: 0, detect: 0, respond: 0, recover: 0 }];
    return series;
  }, [eng, client, priorEngagements, allItems, myOverall]);

  const peers = useMemo(() => {
    if (!eng || !client) return [];
    return allEngagements
      .filter((e) => e.id !== eng.id && e.framework === eng.framework)
      .map((e) => {
        const c = clients.find((cl) => cl.id === e.clientId)!;
        return { eng: e, client: c, overall: overallAverage(allItems[e.id] || []) };
      })
      .sort((a, b) => b.overall - a.overall);
  }, [eng, client, allEngagements, clients, allItems]);

  const ranking = peers.filter((p) => p.overall > myOverall).length + 1;
  const totalRanked = peers.length + 1;
  const percentile = totalRanked > 1 ? Math.round((1 - (ranking - 1) / totalRanked) * 100) : 50;
  const cohortAverage = bm ? Object.values(bm.averageByGroup).reduce((a, b) => a + b, 0) / Object.values(bm.averageByGroup).length : 0;

  if (!eng || !client) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      <Card elevated className="!p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select label="Cohort scope" value={scope}
            onChange={(e) => { const v = e.target.value as any; setScope(v); setScopeValue(v === 'global' ? 'All' : v === 'size-band' ? client.sizeBand : v === 'country' ? client.country : client.industry); }}
            options={[{ value: 'industry', label: 'Industry' }, { value: 'country', label: 'Country' }, { value: 'size-band', label: 'Company size' }, { value: 'global', label: 'Global' }]} />
          <Select label="Cohort value" value={scopeValue} onChange={(e) => setScopeValue(e.target.value)}
            options={[{ value: scopeValue, label: scopeValue }]} />
          <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Cohort size</div>
            <div className="text-2xl font-bold text-white font-mono">{bm?.cohortSize ?? '—'}</div>
            <div className="text-[10px] text-slate-500">contributing assessments</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Overall maturity" value={myOverall.toFixed(1)} sub="/ 5" tone="accent" />
        <Stat label="Cohort average" value={cohortAverage.toFixed(1)} sub="/ 5" tone="muted" />
        <Stat label="Gap to cohort" value={(myOverall - cohortAverage).toFixed(1)} sub="" tone={myOverall >= cohortAverage ? 'ok' : 'warn'} icon={myOverall >= cohortAverage ? TrendingUp : TrendingDown} />
        <Stat label="Percentile rank" value={`${percentile}`} sub={`th of ${totalRanked}`} tone="cyan" icon={Award} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card elevated>
          <CardHeader title="Maturity vs benchmark" subtitle={`${client.industry} cohort`} actions={<Badge tone="cyan">{scope}: {scopeValue}</Badge>} />
          <MaturityRadar data={radar} height={320} />
        </Card>
        <Card elevated>
          <CardHeader title="Per-group quartiles" />
          <BenchmarkBars data={bars} height={320} />
        </Card>
      </div>

      <Card elevated>
        <CardHeader title="Cohort distribution per group" subtitle="Where the client sits within the percentile band; gap to cohort average shown alongside." />
        <PercentileBand data={bars} />
      </Card>

      <Card elevated>
        <CardHeader title="Year-on-year — client trend" subtitle={priorEngagements.length === 0 ? 'No prior engagements for this client and framework yet.' : `Maturity progression across ${priorEngagements.length + 1} assessments`} />
        {yoy.length > 1 ? <YoyTrend data={yoy} /> : <div className="text-xs text-slate-500 py-3">Year-on-year visualisation will appear once a second engagement is signed off.</div>}
      </Card>

      <Card elevated>
        <CardHeader title="Peer comparison" subtitle={`Other engagements assessed against ${FRAMEWORKS[eng.framework].shortName}`} />
        {peers.length === 0 ? (
          <div className="text-sm text-slate-400">No peers for this framework.</div>
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
                    <div className="text-sm font-medium text-white flex items-center gap-2">{p.client.name}{p.isMe && <Badge tone="cyan">This engagement</Badge>}</div>
                    <div className="text-[11px] text-slate-500">{p.client.industry} · {p.client.country} · {p.eng.year}</div>
                  </div>
                  <div className="hidden md:block w-48"><div className="h-2 rounded-full bg-navy-800 overflow-hidden"><div className={`h-full ${p.isMe ? 'bg-cyan-400' : 'bg-accent-500'}`} style={{ width: `${pct}%` }} /></div></div>
                  <div className="font-mono text-sm text-white w-12 text-right">{p.overall.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
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
