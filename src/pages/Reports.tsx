import { Link } from 'react-router-dom';
import { FileText, Download, Eye, FilePieChart, Presentation } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { FRAMEWORKS } from '@/data/frameworks';

export default function Reports() {
  const engagements = useStore((s) => s.engagements);
  const clients = useStore((s) => s.clients);

  return (
    <div>
      <PageHeader
        eyebrow="Deliverables"
        title="Reports"
        description="Generate, preview and export executive reports, scoring decks and detailed findings."
      />
      <div className="px-6 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card elevated>
            <CardHeader icon={<FilePieChart size={16} />} title="Executive Report (PDF)" subtitle="Board-level narrative including scoring, risks and roadmap" />
            <p className="text-sm text-slate-400 leading-relaxed">12-section structured PDF with cover, footprint, scoring slides, observations, risks, recommendations, roadmap and conclusion.</p>
            <div className="mt-3 flex items-center gap-2"><Badge tone="accent">PDF</Badge><Badge tone="muted">~28 pages</Badge></div>
          </Card>
          <Card elevated>
            <CardHeader icon={<Presentation size={16} />} title="Scoring Deck (PPTX)" subtitle="Editable PowerPoint for client meetings" />
            <p className="text-sm text-slate-400 leading-relaxed">Branded slide deck with radar charts, heatmaps and benchmark comparisons. Editable by client engagement leads.</p>
            <div className="mt-3 flex items-center gap-2"><Badge tone="accent">PPTX</Badge><Badge tone="muted">~22 slides</Badge></div>
          </Card>
          <Card elevated>
            <CardHeader icon={<FileText size={16} />} title="Findings Pack (DOCX)" subtitle="Detailed findings for technical review" />
            <p className="text-sm text-slate-400 leading-relaxed">Per-control evidence, scoring rationale and recommendation detail. Used by client security teams as a working document.</p>
            <div className="mt-3 flex items-center gap-2"><Badge tone="accent">DOCX</Badge><Badge tone="muted">100+ pages</Badge></div>
          </Card>
        </div>

        <Card elevated className="!p-0 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-base font-semibold text-white">Report register</h3>
            <p className="text-xs text-slate-400 mt-0.5">All deliverables across the portfolio.</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Engagement</th>
                <th className="px-3 py-3 font-medium">Framework</th>
                <th className="px-3 py-3 font-medium">Stage</th>
                <th className="px-3 py-3 font-medium">Last updated</th>
                <th className="px-3 py-3 font-medium">Outputs</th>
                <th className="px-3 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40">
              {engagements.map((eng) => {
                const c = clients.find((cl) => cl.id === eng.clientId)!;
                return (
                  <tr key={eng.id} className="hover:bg-navy-700/20">
                    <td className="px-5 py-3">
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.industry} · {eng.year}</div>
                    </td>
                    <td className="px-3 py-3"><Badge tone="accent">{FRAMEWORKS[eng.framework].shortName}</Badge></td>
                    <td className="px-3 py-3"><Badge tone={eng.status === 'Signed Off' ? 'ok' : 'info'} dot>{eng.status}</Badge></td>
                    <td className="px-3 py-3 text-xs text-slate-400">{format(new Date(eng.targetEndDate), 'd MMM yyyy')}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge tone="muted">PDF</Badge>
                        <Badge tone="muted">PPTX</Badge>
                        <Badge tone="muted">DOCX</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/engagements/${eng.id}/report`}><Button size="sm" variant="ghost" iconLeft={<Eye size={13} />}>Preview</Button></Link>
                        <Button size="sm" variant="ghost" iconLeft={<Download size={13} />}>Export</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
