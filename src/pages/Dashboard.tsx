import { Link } from 'react-router-dom';
import {
  TrendingUp, AlertTriangle, ShieldCheck, Briefcase, Users, Sparkles, ArrowUpRight,
  Activity, CheckCircle2, Clock,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AvatarStack } from '@/components/ui/Avatar';
import { Sparkline } from '@/components/charts/Sparkline';
import { YoyTrend } from '@/components/charts/YoyTrend';
import { PageHeader } from '@/components/layout/PageHeader';
import { overallAverage, detailedProgress } from '@/lib/aggregations';
import { FRAMEWORKS } from '@/data/frameworks';

export default function Dashboard() {
  const engagements = useStore((s) => s.engagements);
  const clients = useStore((s) => s.clients);
  const items = useStore((s) => s.assessmentItemsByEngagement);
  const users = useStore((s) => s.users);

  const active = engagements.filter((e) => e.status !== 'Signed Off');
  const completed = engagements.filter((e) => e.status === 'Signed Off');
  const overallAvgs = engagements.map((e) => overallAverage(items[e.id] || []));
  const overallAvg = overallAvgs.length ? +(overallAvgs.reduce((a, b) => a + b, 0) / overallAvgs.length).toFixed(2) : 0;

  const allRisks = engagements.flatMap((e) => (items[e.id] || []).flatMap((i) => i.risks));
  const criticalRisks = allRisks.filter((r) => r.inherentScore >= 16);

  const yoyData = [
    { year: '2022', overall: 1.9, govern: 1.7, identify: 1.9, protect: 2.0, detect: 1.7, respond: 1.8, recover: 1.6 },
    { year: '2023', overall: 2.3, govern: 2.2, identify: 2.3, protect: 2.4, detect: 2.0, respond: 2.1, recover: 1.9 },
    { year: '2024', overall: 2.7, govern: 2.6, identify: 2.7, protect: 2.8, detect: 2.4, respond: 2.5, recover: 2.3 },
    { year: '2025', overall: 3.1, govern: 3.0, identify: 3.1, protect: 3.2, detect: 2.8, respond: 2.9, recover: 2.7 },
  ];

  const stats = [
    { label: 'Active engagements', value: active.length.toString(), trend: '+2 this quarter', icon: Briefcase, tone: 'accent' as const, spark: [3, 4, 4, 5, 6, 6, active.length] },
    { label: 'Clients on platform', value: clients.length.toString(), trend: '4 industries', icon: Users, tone: 'cyan' as const, spark: [4, 4, 5, 5, 6, 6, clients.length] },
    { label: 'Average maturity', value: overallAvg.toFixed(1), trend: '+0.4 YoY', icon: TrendingUp, tone: 'ok' as const, spark: [1.9, 2.3, 2.5, 2.6, 2.8, 3.0, overallAvg] },
    { label: 'Critical risks', value: criticalRisks.length.toString(), trend: 'Across portfolio', icon: AlertTriangle, tone: 'risk' as const, spark: [12, 11, 10, 9, 8, 7, criticalRisks.length] },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Welcome back, Jon"
        description="Six engagements in flight across financial services, energy, healthcare, retail, logistics and manufacturing."
      />

      <div className="px-6 lg:px-8 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} elevated className="!p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-400 mb-1">{s.label}</div>
                  <div className="text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{s.trend}</div>
                </div>
                <div className={`rounded-lg p-2 ${
                  s.tone === 'accent' ? 'bg-accent-500/15 text-accent-300' :
                  s.tone === 'cyan' ? 'bg-cyan-500/15 text-cyan-400' :
                  s.tone === 'ok' ? 'bg-emerald-500/15 text-emerald-300' :
                  'bg-red-500/15 text-red-300'
                }`}>
                  <s.icon size={18} />
                </div>
              </div>
              <div className="mt-2">
                <Sparkline data={s.spark} colour={
                  s.tone === 'accent' ? '#3B82F6' :
                  s.tone === 'cyan' ? '#06B6D4' :
                  s.tone === 'ok' ? '#10B981' : '#EF4444'
                } />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active engagements */}
          <Card elevated className="lg:col-span-2 !p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Active engagements</h3>
                <p className="text-xs text-slate-400 mt-0.5">{active.length} in flight</p>
              </div>
              <Link to="/engagements" className="text-xs text-accent-400 hover:text-accent-300 inline-flex items-center gap-1">
                View all <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="divide-y divide-navy-700/50">
              {active.slice(0, 6).map((eng) => {
                const client = clients.find((c) => c.id === eng.clientId)!;
                const team = eng.team.map((id) => users.find((u) => u.id === id)!);
                const fw = FRAMEWORKS[eng.framework];
                return (
                  <Link key={eng.id} to={`/engagements/${eng.id}/setup`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-navy-700/30 transition group">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-glow shrink-0"
                      style={{ background: `linear-gradient(135deg, ${client.logoColour}, ${client.logoColour}aa)` }}>
                      {client.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">{client.name}</span>
                        <Badge tone="accent">{fw.shortName}</Badge>
                        {eng.igTier && <Badge tone="cyan">IG{eng.igTier}</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <Activity size={11} />
                        <span>{eng.status}</span>
                        <span className="text-slate-600">·</span>
                        <span>{client.industry}</span>
                        <span className="text-slate-600">·</span>
                        <span>{eng.year}</span>
                      </div>
                    </div>
                    <div className="hidden md:block w-32">
                      {(() => {
                        const { pct } = detailedProgress(eng, items[eng.id] || [], []);
                        return (<><ProgressBar value={pct} tone={pct === 100 ? 'ok' : 'accent'} /><div className="text-[10px] text-slate-500 mt-1 text-right">{pct}%</div></>);
                      })()}
                    </div>
                    <AvatarStack items={team.map((u) => ({ initials: u.initials, colour: u.avatarColour, name: u.name }))} />
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Right column: AI activity + activity feed */}
          <div className="space-y-6">
            <Card elevated>
              <CardHeader
                icon={<Sparkles size={16} />}
                title="AI Studio activity"
                subtitle="Past 7 days across the portfolio"
              />
              <div className="space-y-3">
                {[
                  { label: 'Transcripts processed', value: 14, tone: 'cyan' },
                  { label: 'Notes auto-generated', value: 286, tone: 'accent' },
                  { label: 'Observations drafted', value: 64, tone: 'accent' },
                  { label: 'Risks suggested', value: 38, tone: 'warn' },
                  { label: 'Recommendations drafted', value: 51, tone: 'ok' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-mono text-white">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-navy-700/50 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  All AI services nominal
                </div>
                <Link to="/ai-studio" className="text-xs text-cyan-400 hover:text-cyan-300">
                  Open AI Studio →
                </Link>
              </div>
            </Card>

            <Card elevated>
              <CardHeader title="Recent activity" subtitle="Across your engagements" />
              <ul className="space-y-3">
                {[
                  { icon: CheckCircle2, tone: 'text-emerald-400', text: 'Acorn Health: 32 documents ingested for Doc Review.', when: '2h ago' },
                  { icon: Sparkles, tone: 'text-cyan-400', text: 'Meridian: AI drafted 12 risks from 4 workshops.', when: '4h ago' },
                  { icon: ShieldCheck, tone: 'text-accent-300', text: 'BlueRiver: scoring complete for Objective B.', when: 'yesterday' },
                  { icon: Clock, tone: 'text-amber-300', text: 'Apex: roadmap review scheduled with CISO Friday.', when: '1 day ago' },
                ].map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <a.icon size={14} className={`mt-0.5 ${a.tone}`} />
                    <div className="flex-1">
                      <div className="text-sm text-slate-200">{a.text}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{a.when}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* YoY trend */}
        <Card elevated>
          <CardHeader
            title="Portfolio maturity — year on year"
            subtitle="Average CMMI across engagements (illustrative)"
            actions={<Badge tone="ok" dot>+0.4 YoY</Badge>}
          />
          <YoyTrend data={yoyData} />
        </Card>

        {/* Recently signed off */}
        <Card elevated className="!p-0">
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Recently signed off</h3>
              <p className="text-xs text-slate-400 mt-0.5">Archived assessments contributing to internal benchmarks</p>
            </div>
            <Link to="/engagements" className="text-xs text-accent-400 hover:text-accent-300">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-px bg-navy-700/40">
            {completed.slice(0, 4).map((eng) => {
              const client = clients.find((c) => c.id === eng.clientId)!;
              const fw = FRAMEWORKS[eng.framework];
              return (
                <Link key={eng.id} to={`/engagements/${eng.id}/report`} className="bg-navy-850/60 hover:bg-navy-700/30 px-5 py-4 flex items-center gap-4 transition">
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                    style={{ background: `linear-gradient(135deg, ${client.logoColour}, ${client.logoColour}aa)` }}>
                    {client.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{client.name}</div>
                    <div className="text-[11px] text-slate-400">{fw.shortName} · {eng.year}</div>
                  </div>
                  <Badge tone="ok" dot>Signed off</Badge>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
