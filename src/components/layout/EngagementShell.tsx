import { useMemo } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import {
  Settings2, Building2, FileSearch, ScrollText, Eye, Gauge, AlertTriangle,
  Lightbulb, Map, BarChart3, FileOutput, ChevronLeft, ChevronRight, Sparkles, ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AvatarStack } from '@/components/ui/Avatar';
import { FRAMEWORKS } from '@/data/frameworks';
import { detailedProgress } from '@/lib/aggregations';
import { cn } from '@/lib/cn';

const STAGES = [
  { to: 'setup', label: 'Setup', icon: Settings2 },
  { to: 'footprint', label: 'Footprint', icon: Building2 },
  { to: 'documentation', label: 'Documentation Review', icon: FileSearch },
  { to: 'notes', label: 'Workshops & Notes', icon: ScrollText },
  { to: 'observations', label: 'Observations', icon: Eye },
  { to: 'scoring', label: 'Scoring', icon: Gauge },
  { to: 'risks', label: 'Risks', icon: AlertTriangle },
  { to: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: 'roadmap', label: 'Roadmap', icon: Map },
  { to: 'benchmarking', label: 'Benchmarking', icon: BarChart3 },
  { to: 'report', label: 'Report', icon: FileOutput },
  { to: 'qa', label: 'QA Review', icon: ShieldCheck },
];

export function EngagementShell() {
  const { engagementId = '' } = useParams();
  const engagement = useStore((s) => s.getEngagement(engagementId));
  const client = useStore((s) => engagement && s.getClient(engagement.clientId));
  const users = useStore((s) => s.users);
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const initiatives = useStore((s) => s.getRoadmap(engagementId));
  const team = useMemo(
    () => engagement ? engagement.team.map((id) => users.find((u) => u.id === id)).filter(Boolean) as typeof users : [],
    [engagement, users],
  );

  if (!engagement || !client) {
    return (
      <div className="p-10">
        <div className="panel p-8 text-center">
          <h2 className="text-lg font-semibold text-white mb-1">Engagement not found</h2>
          <p className="text-sm text-slate-400 mb-4">The engagement you’re looking for doesn’t exist or has been archived.</p>
          <Link to="/engagements" className="btn-primary inline-flex">Back to engagements</Link>
        </div>
      </div>
    );
  }

  const fw = FRAMEWORKS[engagement.framework];
  const { pct } = detailedProgress(engagement, items, initiatives);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-navy-900/80 via-navy-850/60 to-navy-900/80 border-b border-navy-700/60 px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/engagements" className="text-slate-400 hover:text-white transition" aria-label="Back">
              <ChevronLeft size={20} />
            </Link>
            <div className="h-12 w-12 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-glow"
              style={{ background: `linear-gradient(135deg, ${client.logoColour}, ${client.logoColour}aa)` }}>
              {client.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">
                <span>{client.industry}</span><span>·</span><span>{client.country}</span><span>·</span><span>{engagement.year}</span>
              </div>
              <h2 className="text-xl font-bold text-white truncate">{client.name}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge tone="accent">{fw.shortName} {fw.version}</Badge>
                {engagement.igTier && <Badge tone="cyan">IG{engagement.igTier}</Badge>}
                <Badge tone={engagement.status === 'Signed Off' ? 'ok' : engagement.status === 'QA Review' ? 'warn' : 'info'} dot>{engagement.status}</Badge>
                {engagement.qaSignOff && <Badge tone="ok" dot>QA: {engagement.qaSignOff.decision}</Badge>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block min-w-[200px]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Engagement progress</span>
                <span className="text-slate-200 font-medium">{pct}%</span>
              </div>
              <ProgressBar value={pct} tone={pct === 100 ? 'ok' : 'accent'} />
            </div>
            <div className="flex items-center gap-3">
              <AvatarStack items={team.map((u) => ({ initials: u.initials, colour: u.avatarColour, name: u.name }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-navy-700/60 bg-navy-900/40 px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin">
          {STAGES.map((s, idx) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2 rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition shrink-0 border',
                  isActive
                    ? 'bg-accent-500/15 text-accent-200 border-accent-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-700/40 border-transparent',
                )
              }
            >
              <span className="font-mono text-[10px] text-slate-500">{String(idx + 1).padStart(2, '0')}</span>
              <s.icon size={13} />
              <span className="font-medium">{s.label}</span>
              <ChevronRight size={12} className="text-slate-600 group-last:hidden" />
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      <div className="border-t border-navy-700/60 bg-navy-900/60 backdrop-blur px-6 lg:px-8 py-2.5 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles size={13} className="text-cyan-400" />
          <span>
            <span className="text-cyan-300 font-medium">AI Studio</span> ready — generate notes from transcripts, draft observations, risks and roadmap items.
          </span>
        </div>
        <Link to="/ai-studio" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Open AI Studio →</Link>
      </div>
    </div>
  );
}
