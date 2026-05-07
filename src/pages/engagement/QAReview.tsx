import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, ClipboardCheck, History } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Textarea, Select } from '@/components/ui/Input';
import { format } from 'date-fns';
import { progressFromStatus } from '@/types';

export default function QAReview() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const client = useStore((s) => eng && s.getClient(eng.clientId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const initiatives = useStore((s) => s.getRoadmap(engagementId));
  const users = useStore((s) => s.users);
  const reviewers = users.filter((u) => u.role === 'Reviewer' || u.role === 'Admin');
  const setQASignOff = useStore((s) => s.setQASignOff);
  const setStatus = useStore((s) => s.setEngagementStatus);
  const bumpVersion = useStore((s) => s.bumpReportVersion);

  const [reviewerId, setReviewerId] = useState(reviewers[0]?.id || '');
  const [decision, setDecision] = useState<'Approved' | 'Approved with comments' | 'Rejected'>('Approved');
  const [comments, setComments] = useState('');

  const checks = useMemo(() => {
    const observations = items.flatMap((i) => i.observations);
    const risks = items.flatMap((i) => i.risks);
    const recs = items.flatMap((i) => i.recommendations);
    const scored = items.filter((i) => i.currentScore > 0).length;
    return [
      { label: 'All in-scope items have a current score', pass: scored === items.length, value: `${scored} / ${items.length}` },
      { label: 'All in-scope items have a target score', pass: items.every((i) => i.targetScore >= i.currentScore), value: `${items.length} / ${items.length}` },
      { label: 'Items with low score have an observation', pass: items.filter((i) => i.currentScore <= 2 && i.observations.length === 0).length === 0, value: `${items.filter((i) => i.currentScore <= 2 && i.observations.length === 0).length} gap${items.filter((i) => i.currentScore <= 2 && i.observations.length === 0).length === 1 ? '' : 's'}` },
      { label: 'Observations linked to a control', pass: observations.every((o) => o.linkedItemIds.length > 0), value: `${observations.length} obs` },
      { label: 'Risks have a treatment and rationale', pass: risks.every((r) => r.treatment && (r.rationale || r.description.length > 200)), value: `${risks.length} risks` },
      { label: 'Recommendations have benefits & success criteria', pass: recs.every((r) => r.benefits || (r.successCriteria && r.successCriteria.length > 0)), value: `${recs.length} recs` },
      { label: 'Roadmap covers ≥3 capability areas', pass: new Set(initiatives.map((i) => i.capabilityArea)).size >= 3, value: `${new Set(initiatives.map((i) => i.capabilityArea)).size} area(s)` },
      { label: 'Items with assignees on observations / risks / recs', pass: observations.every((o) => o.assigneeId) && risks.every((r) => r.assigneeId) && recs.every((r) => r.assigneeId), value: 'verify' },
    ];
  }, [items, initiatives]);

  const passing = checks.filter((c) => c.pass).length;
  const allPass = passing === checks.length;

  function submit() {
    if (!reviewerId) return;
    setQASignOff(engagementId, {
      reviewerId, decision, comments,
      signedAt: new Date().toISOString(),
    });
    if (decision === 'Rejected') setStatus(engagementId, 'Reporting');
    if (decision === 'Approved with comments' || decision === 'Approved') bumpVersion(engagementId);
  }

  if (!eng || !client) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      <Card elevated>
        <CardHeader
          icon={<ShieldCheck size={16} />}
          title="QA review and sign-off"
          subtitle="Independent review by a Reviewer / Admin role before the report is issued. The engagement progresses to 100% (Signed Off) only on approval."
          actions={<Badge tone={eng.status === 'Signed Off' ? 'ok' : 'warn'} dot>{eng.status} · {progressFromStatus(eng.status)}%</Badge>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Stat label="Client" value={client.name} />
          <Stat label="Lead assessor" value={users.find((u) => u.id === eng.leadAssessor)?.name || ''} />
          <Stat label="Report version" value={`v${eng.reportVersion}`} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card elevated className="lg:col-span-2">
          <CardHeader icon={<ClipboardCheck size={16} />} title="QA checklist" subtitle={`${passing} of ${checks.length} checks passing`} />
          <ul className="space-y-2.5">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center justify-between gap-3">
                <span className="flex items-start gap-2 text-sm">
                  {c.pass ? <CheckCircle2 size={15} className="text-emerald-400 mt-0.5" /> : <AlertTriangle size={15} className="text-amber-400 mt-0.5" />}
                  <span className="text-slate-200">{c.label}</span>
                </span>
                <Badge tone={c.pass ? 'ok' : 'warn'} dot>{c.value}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card elevated>
          <CardHeader title="Sign-off" subtitle={allPass ? 'All checks passing — ready for sign-off.' : 'Some checks failing — review before sign-off.'} />
          {eng.qaSignOff ? (
            <div className="space-y-3">
              <Badge tone={eng.qaSignOff.decision === 'Rejected' ? 'risk' : 'ok'} dot>{eng.qaSignOff.decision}</Badge>
              <div className="text-sm text-slate-300 leading-relaxed">{eng.qaSignOff.comments || '— no comments —'}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-3 border-t border-navy-700/50">
                <Avatar size="sm" initials={users.find((u) => u.id === eng.qaSignOff!.reviewerId)?.initials || '?'} colour={users.find((u) => u.id === eng.qaSignOff!.reviewerId)?.avatarColour || '#3B82F6'} />
                <span>{users.find((u) => u.id === eng.qaSignOff!.reviewerId)?.name}</span>
                <span className="text-slate-600">·</span>
                <span>{format(new Date(eng.qaSignOff.signedAt), 'd MMM yyyy HH:mm')}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setQASignOff(engagementId, { ...eng.qaSignOff!, decision: 'Approved', comments: '', signedAt: new Date().toISOString() })} className="!opacity-50 pointer-events-none">Re-open (back-end only)</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Select label="Reviewer" value={reviewerId} onChange={(e) => setReviewerId(e.target.value)}
                options={reviewers.map((r) => ({ value: r.id, label: `${r.name} — ${r.role}` }))} />
              <Select label="Decision" value={decision} onChange={(e) => setDecision(e.target.value as any)}
                options={[
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Approved with comments', label: 'Approved with comments' },
                  { value: 'Rejected', label: 'Rejected (back to Reporting)' },
                ]} />
              <Textarea label="Comments" rows={5} value={comments} onChange={(e) => setComments(e.target.value)}
                placeholder="Findings, edits required, conditions of sign-off." />
              <Button onClick={submit} className="w-full" iconLeft={decision === 'Rejected' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}>
                {decision === 'Rejected' ? 'Reject' : 'Sign off'}
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Card elevated>
        <CardHeader icon={<History size={16} />} title="Report version history" />
        <ul className="space-y-2 text-sm">
          {Array.from({ length: Math.max(eng.reportVersion, 1) }).map((_, i) => {
            const v = i + 1;
            const isCurrent = v === eng.reportVersion;
            return (
              <li key={v} className="flex items-center justify-between rounded-lg border border-navy-700/60 bg-navy-900/40 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-cyan-400">v{v}</span>
                  <span className="text-slate-300">{isCurrent ? 'Current draft' : 'Earlier draft'}</span>
                </div>
                <Badge tone={isCurrent ? 'cyan' : 'muted'} dot>{isCurrent ? 'Latest' : 'Archived'}</Badge>
              </li>
            );
          })}
          {eng.reportVersion === 0 && <li className="text-xs text-slate-500">No report drafts yet.</li>}
        </ul>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm text-white font-medium truncate">{value}</div>
    </div>
  );
}
