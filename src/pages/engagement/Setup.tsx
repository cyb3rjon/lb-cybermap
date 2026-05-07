import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Users, Shield, FileText, ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FRAMEWORKS } from '@/data/frameworks';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Setup() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const client = useStore((s) => eng && s.getClient(eng.clientId));
  const lead = useStore((s) => eng && s.getUser(eng.leadAssessor));
  const users = useStore((s) => s.users);
  const team = useMemo(
    () => eng ? eng.team.map((id) => users.find((u) => u.id === id)).filter(Boolean) as typeof users : [],
    [eng, users],
  );
  if (!eng || !client || !lead) return null;
  const fw = FRAMEWORKS[eng.framework];

  return (
    <div className="px-6 lg:px-8 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card elevated className="lg:col-span-2">
          <CardHeader
            icon={<Shield size={16} />}
            title="Engagement overview"
            subtitle="The configuration captured at kick-off. All fields below remain editable until sign-off."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KV label="Client">{client.name}</KV>
            <KV label="Industry">{client.industry}</KV>
            <KV label="Country">{client.country}</KV>
            <KV label="Framework">
              <span className="flex items-center gap-1.5">{fw.shortName}<Badge tone="accent">{fw.version}</Badge></span>
            </KV>
            {eng.igTier && <KV label="IG Tier"><Badge tone="cyan">IG{eng.igTier}</Badge></KV>}
            <KV label="Year">{eng.year}</KV>
            <KV label="Start">{format(new Date(eng.startDate), 'd MMM yyyy')}</KV>
            <KV label="Target end">{format(new Date(eng.targetEndDate), 'd MMM yyyy')}</KV>
            <KV label="Status"><Badge tone="info" dot>{eng.status}</Badge></KV>
          </div>

          <div className="mt-5 pt-5 border-t border-navy-700/50">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Scope</div>
            <p className="text-sm text-slate-200 leading-relaxed">{eng.scope || '—'}</p>
          </div>
        </Card>

        <Card elevated>
          <CardHeader icon={<Users size={16} />} title="Team" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar initials={lead.initials} colour={lead.avatarColour} />
              <div>
                <div className="text-sm font-semibold text-white">{lead.name}</div>
                <div className="text-[11px] text-cyan-400">Lead Assessor</div>
              </div>
            </div>
            <div className="border-t border-navy-700/50 pt-3 space-y-2">
              {team.filter((u) => u.id !== lead.id).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar initials={u.initials} colour={u.avatarColour} size="sm" />
                  <div>
                    <div className="text-sm text-slate-200">{u.name}</div>
                    <div className="text-[10px] text-slate-500">{u.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card elevated>
          <CardHeader icon={<Calendar size={16} />} title="Schedule highlights" />
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between"><span className="text-slate-400">Kick-off</span><span className="text-slate-200">{format(new Date(eng.startDate), 'd MMM')}</span></li>
            <li className="flex items-center justify-between"><span className="text-slate-400">Workshops</span><span className="text-slate-200">Weeks 2–6</span></li>
            <li className="flex items-center justify-between"><span className="text-slate-400">Draft report</span><span className="text-slate-200">Week 12</span></li>
            <li className="flex items-center justify-between"><span className="text-slate-400">Sign-off</span><span className="text-slate-200">{format(new Date(eng.targetEndDate), 'd MMM')}</span></li>
          </ul>
        </Card>

        <Card elevated>
          <CardHeader icon={<FileText size={16} />} title="Document checklist" />
          <ul className="space-y-2 text-sm">
            {[
              'Information Security Policy',
              'Risk Management Framework',
              'Asset Management Standard',
              'Identity & Access Management Policy',
              'Incident Response Plan',
              'Business Continuity / DR Plan',
            ].map((d) => (
              <li key={d} className="flex items-center justify-between text-slate-300">
                <span>{d}</span>
                <Badge tone="muted">Pending</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card elevated>
          <CardHeader title="Next stage" subtitle="Move to Footprint to capture the client's business and technology footprint." />
          <Link to={`/engagements/${eng.id}/footprint`}>
            <Button iconRight={<ArrowRight size={15} />}>Continue to Footprint</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</div>
      <div className="text-sm text-slate-100 font-medium">{children}</div>
    </div>
  );
}
