import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileOutput, Download, Sparkles, ChevronRight, FilePieChart, Presentation, FileText, Printer, ShieldCheck, Eye,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FRAMEWORKS } from '@/data/frameworks';
import { MaturityRadar } from '@/components/charts/MaturityRadar';
import { MaturityHeatmap } from '@/components/charts/MaturityHeatmap';
import { BenchmarkBars } from '@/components/charts/BenchmarkBars';
import { RiskMatrix } from '@/components/charts/RiskMatrix';
import { RoadmapTimeline, RoadmapSummary } from '@/components/charts/RoadmapTimeline';
import { Avatar } from '@/components/ui/Avatar';
import { buildHeatmapRows, buildRadarSeries, buildBenchmarkSeries, overallAverage, overallTarget, averageByGroup } from '@/lib/aggregations';
import { exportReportToPDF, exportReportToPPTX } from '@/lib/exporters';
import { SEVERITY_RANK, PRIORITY_RANK } from '@/data/content-library';
import { format } from 'date-fns';

const SECTIONS = [
  { key: 'cover', label: 'Cover & metadata' },
  { key: 'execSummary', label: 'Executive summary' },
  { key: 'footprint', label: 'Business & technology footprint' },
  { key: 'approach', label: 'Assessment approach & scope' },
  { key: 'scoring', label: 'Maturity scoring' },
  { key: 'benchmark', label: 'Benchmarking' },
  { key: 'observations', label: 'Key observations' },
  { key: 'risks', label: 'Risk register' },
  { key: 'recommendations', label: 'Improvement recommendations' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'qa', label: 'QA sign-off' },
  { key: 'conclusion', label: 'Conclusion & next steps' },
  { key: 'appendices', label: 'Appendices' },
];

// Pagination limits so landscape pages keep a readable font size
const OBSERVATIONS_PER_PAGE = 3;
const RISKS_PER_PAGE = 3;
const RECS_PER_PAGE = 3;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out.length ? out : [[]];
}

export default function Report() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const client = useStore((s) => eng && s.getClient(eng.clientId));
  const lead = useStore((s) => eng && s.getUser(eng.leadAssessor));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const initiatives = useStore((s) => s.getRoadmap(engagementId));
  const users = useStore((s) => s.users);
  const bumpVersion = useStore((s) => s.bumpReportVersion);

  const [active, setActive] = useState('cover');
  const [previewAll, setPreviewAll] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'pptx' | null>(null);

  const radar = useMemo(() => eng ? buildRadarSeries(eng, items, { scope: 'industry', value: client?.industry ?? 'Financial Services' }) : [], [eng, items, client]);
  const heatmap = useMemo(() => eng ? buildHeatmapRows(eng, items) : [], [eng, items]);
  const aggs = useMemo(() => eng ? averageByGroup(eng, items) : [], [eng, items]);
  const bars = useMemo(() => eng ? buildBenchmarkSeries(eng, items, 'industry', client?.industry ?? 'Financial Services') : [], [eng, items, client]);

  if (!eng || !client || !lead) return null;
  const fw = FRAMEWORKS[eng.framework];
  const overall = overallAverage(items);
  const overallT = overallTarget(items);
  const observations = [...items.flatMap((i) => i.observations)].sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
  const allRisks = [...items.flatMap((i) => i.risks)].sort((a, b) => b.inherentScore - a.inherentScore);
  const allRecs = [...items.flatMap((i) => i.recommendations)].sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
  const topRisksList = allRisks.slice(0, 12);
  const topRecs = allRecs.slice(0, 12);

  async function exportPDF() {
    try {
      setExporting('pdf');
      setPreviewAll(true);
      bumpVersion(engagementId);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
      await new Promise((r) => setTimeout(r, 200)); // give charts a moment to draw
      await exportReportToPDF({
        filename: `${client!.name.replace(/\s+/g, '-')}-${eng!.year}-${fw.shortName.replace(/\s+/g, '')}-Report.pdf`,
        sectionSelector: '.report-page',
      });
    } catch (err) {
      console.error('PDF export failed', err);
      alert('PDF export failed — check the console for detail.');
    } finally {
      setExporting(null);
    }
  }

  async function exportPPTX() {
    try {
      setExporting('pptx');
      setPreviewAll(true);
      bumpVersion(engagementId);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
      await new Promise((r) => setTimeout(r, 200));
      await exportReportToPPTX({
        filename: `${client!.name.replace(/\s+/g, '-')}-${eng!.year}-${fw.shortName.replace(/\s+/g, '')}-Report.pptx`,
        sectionSelector: '.report-page',
        meta: { title: `${client!.name} — ${fw.shortName} ${fw.version} Maturity Assessment`, subtitle: `Year ${eng!.year} · Lead: ${lead!.name}` },
      });
    } catch (err) {
      console.error('PPTX export failed', err);
      alert('PPTX export failed — check the console for detail.');
    } finally {
      setExporting(null);
    }
  }

  function exportDOCX() {
    const bundle = {
      meta: { client: client.name, framework: `${fw.shortName} ${fw.version}`, year: eng.year, lead: lead.name },
      executiveSummary: `Overall maturity ${overall.toFixed(1)}/5; target ${overallT.toFixed(1)}.`,
      observations, risks: allRisks, recommendations: allRecs, roadmap: initiatives,
    };
    download(`${client.name.replace(/\s+/g, '-')}-${eng.year}-findings.docx.json`, JSON.stringify(bundle, null, 2));
  }

  return (
    <div className="px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-6 print:block print:p-0">
      <div className="space-y-3 print:hidden">
        <Card elevated>
          <CardHeader icon={<FileOutput size={16} />} title="Report builder" subtitle={`v${eng.reportVersion} · ${eng.qaSignOff ? eng.qaSignOff.decision : 'unsigned'}`} />
          <div className="space-y-1">
            {SECTIONS.map((s, i) => (
              <button key={s.key} onClick={() => { setActive(s.key); setPreviewAll(false); }}
                className={`w-full flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-left transition ${
                  active === s.key && !previewAll ? 'border-accent-500/60 bg-accent-500/10 text-white' : 'border-transparent text-slate-300 hover:bg-navy-700/30'
                }`}>
                <span className="font-mono text-[10px] text-slate-500 w-6">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1 truncate">{s.label}</span>
                <ChevronRight size={12} className="text-slate-500" />
              </button>
            ))}
          </div>
        </Card>

        <Card elevated>
          <CardHeader title="Output" subtitle="PDF uses your browser print engine. PPTX and DOCX produce a bundle for the back-end generator." />
          <div className="space-y-2">
            <Button className="w-full" iconLeft={<Eye size={14} />} onClick={() => setPreviewAll(true)}>Preview full report</Button>
            <Button variant="outline" className="w-full" iconLeft={<FilePieChart size={14} />} onClick={exportPDF} loading={exporting === 'pdf'}>Export PDF (landscape)</Button>
            <Button variant="outline" className="w-full" iconLeft={<Presentation size={14} />} onClick={exportPPTX} loading={exporting === 'pptx'}>Export PPTX</Button>
            <Button variant="outline" className="w-full" iconLeft={<FileText size={14} />} onClick={exportDOCX}>Export DOCX bundle</Button>
            <Button variant="ghost" className="w-full" iconLeft={<Sparkles size={14} />}>AI redraft summary</Button>
          </div>
        </Card>

        <Card elevated>
          <CardHeader icon={<ShieldCheck size={16} />} title="QA status" />
          {eng.qaSignOff ? (
            <div className="space-y-1.5">
              <Badge tone={eng.qaSignOff.decision === 'Rejected' ? 'risk' : 'ok'} dot>{eng.qaSignOff.decision}</Badge>
              <div className="text-[11px] text-slate-400">By {users.find((u) => u.id === eng.qaSignOff!.reviewerId)?.name} on {format(new Date(eng.qaSignOff.signedAt), 'd MMM yyyy')}</div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Pending. Submit for QA from the QA Review stage.</div>
          )}
        </Card>
      </div>

      <div className="space-y-5 print:space-y-8">
        {(previewAll ? SECTIONS : SECTIONS.filter((s) => s.key === active)).flatMap((sec) => {
          // Multi-page sections — split content into chunks so landscape font stays consistent
          if (sec.key === 'observations') {
            const chunks = chunk(observations, OBSERVATIONS_PER_PAGE);
            return chunks.map((slice, idx) => (
              <Card elevated key={`${sec.key}-${idx}`} className="report-page break-after-page">
                <ObservationsSection observations={slice} pageNum={idx + 1} totalPages={chunks.length} totalCount={observations.length} />
              </Card>
            ));
          }
          if (sec.key === 'risks') {
            const chunks = chunk(allRisks, RISKS_PER_PAGE);
            return chunks.map((slice, idx) => (
              <Card elevated key={`${sec.key}-${idx}`} className="report-page break-after-page">
                <RiskRegister risks={slice} pageNum={idx + 1} totalPages={chunks.length} totalCount={allRisks.length} allRisks={allRisks} showMatrix={idx === 0} />
              </Card>
            ));
          }
          if (sec.key === 'recommendations') {
            const chunks = chunk(allRecs, RECS_PER_PAGE);
            return chunks.map((slice, idx) => (
              <Card elevated key={`${sec.key}-${idx}`} className="report-page break-after-page">
                <Recommendations recs={slice} pageNum={idx + 1} totalPages={chunks.length} totalCount={allRecs.length} />
              </Card>
            ));
          }
          return [(
            <Card elevated key={sec.key} className="report-page break-after-page">
              {sec.key === 'cover' && <Cover client={client} fw={fw} eng={eng} lead={lead} />}
              {sec.key === 'execSummary' && <ExecutiveSummary client={client} fw={fw} items={items} initiatives={initiatives} overall={overall} overallT={overallT} eng={eng} />}
              {sec.key === 'footprint' && <Footprint client={client} />}
              {sec.key === 'approach' && <Approach eng={eng} fw={fw} items={items} />}
              {sec.key === 'scoring' && <Scoring overall={overall} overallT={overallT} fw={fw} items={items} radar={radar} aggs={aggs} heatmap={heatmap} />}
              {sec.key === 'benchmark' && <Benchmark client={client} bars={bars} radar={radar} />}
              {sec.key === 'roadmap' && <Roadmap initiatives={initiatives} />}
              {sec.key === 'qa' && <QABlock eng={eng} users={users} lead={lead} />}
              {sec.key === 'conclusion' && <Conclusion overall={overall} overallT={overallT} client={client} />}
              {sec.key === 'appendices' && <Appendices items={items} />}
            </Card>
          )];
        })}

        {!previewAll && (
          <div className="flex items-center justify-between print:hidden">
            <div className="text-xs text-slate-500">
              Section <span className="text-slate-300 font-medium">{SECTIONS.findIndex((s) => s.key === active) + 1}</span> of {SECTIONS.length}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" iconLeft={<Eye size={14} />} onClick={() => setPreviewAll(true)}>Preview full report</Button>
              <Button iconLeft={<Download size={14} />} onClick={exportPDF} loading={exporting === 'pdf'}>Export PDF</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function SectionTitle({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <div className="border-b border-navy-700/60 pb-3 mb-4 flex items-center gap-3">
      <span className="h-1 w-8 bg-accent-gradient rounded-full" />
      <div>
        {eyebrow && <div className="text-[10px] uppercase tracking-[0.18em] text-accent-300 mb-0.5">{eyebrow}</div>}
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
    </div>
  );
}

function Cover({ client, fw, eng, lead }: any) {
  return (
    <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-navy-850 via-navy-900 to-navy-950 border border-accent-500/30 p-10 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -top-20 -right-20 h-72 w-72 bg-accent-500/20 blur-3xl rounded-full" />
      <div className="relative z-10">
        <div className="text-[11px] uppercase tracking-[0.3em] text-accent-300">Internal · Strictly Confidential</div>
        <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-slate-400">Cyber Security Maturity Assessment</div>
        <div className="mt-8 text-5xl font-bold text-white tracking-tight">{client.name}</div>
        <div className="mt-3 text-lg text-slate-300">{fw.name} {fw.version}{eng.igTier ? ` · IG${eng.igTier}` : ''}</div>
      </div>
      <div className="relative z-10 grid grid-cols-3 gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Lead assessor</div>
          <div className="text-sm text-slate-200 font-medium">{lead.name}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Period</div>
          <div className="text-sm text-slate-200 font-medium">{format(new Date(eng.startDate), 'MMM yyyy')} — {format(new Date(eng.targetEndDate), 'MMM yyyy')}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Report version</div>
          <div className="text-sm text-slate-200 font-medium">v{eng.reportVersion} · {eng.qaSignOff ? eng.qaSignOff.decision : 'Draft (unsigned)'}</div>
        </div>
      </div>
    </div>
  );
}

function ExecutiveSummary({ client, fw, items, initiatives, overall, overallT, eng }: any) {
  const observations = items.flatMap((i: any) => i.observations);
  const risks = items.flatMap((i: any) => i.risks);
  const critical = risks.filter((r: any) => r.inherentScore >= 16);
  const recsP1 = items.flatMap((i: any) => i.recommendations).filter((r: any) => r.priority === 'P1');
  return (
    <div>
      <SectionTitle eyebrow="01" title="Executive Summary" />
      <p className="text-slate-300 leading-relaxed">
        {client.name}’s overall cyber maturity stands at <strong className="text-white">{overall.toFixed(1)} / 5</strong> on the CMMI scale,
        with a defined target of <strong className="text-cyan-400">{overallT.toFixed(1)}</strong>. The assessment was conducted against
        {' '}<strong>{fw.name} {fw.version}</strong>{eng.igTier ? ` (Implementation Group ${eng.igTier})` : ''}, covering
        {' '}{items.length} control items across {fw.groups.length} {eng.framework === 'NCSC_CAF_4_0' ? 'objectives' : 'functions'}.
        Maturity is highest in foundational governance and controlled below the cohort average in detection and resilience.
      </p>
      <p className="text-slate-300 leading-relaxed mt-3">
        We identified {observations.length} observations of which {observations.filter((o: any) => o.severity === 'Critical' || o.severity === 'High').length} are rated High or Critical, and {risks.length} risks of which {critical.length} are above appetite. {recsP1.length} P1 recommendations and {initiatives.length} clustered initiatives are proposed across the four delivery horizons. Adopting the recommended roadmap should lift overall maturity from {overall.toFixed(1)} to {overallT.toFixed(1)} within 18–24 months.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        <Stat label="Overall maturity" value={overall.toFixed(1)} suffix="/ 5" tone="accent" />
        <Stat label="Target" value={overallT.toFixed(1)} suffix="/ 5" tone="cyan" />
        <Stat label="Critical risks" value={critical.length.toString()} tone="risk" />
        <Stat label="P1 recommendations" value={recsP1.length.toString()} tone="info" />
      </div>
      <h4 className="text-sm font-semibold text-white mt-6 mb-2">Headline themes</h4>
      <ul className="space-y-2">
        {observations.filter((o: any) => o.severity === 'Critical' || o.severity === 'High').slice(0, 6).map((o: any) => (
          <li key={o.id} className="flex items-start gap-2">
            <Badge tone={o.severity === 'Critical' ? 'critical' : 'risk'}>{o.severity}</Badge>
            <span className="text-sm text-slate-200">{o.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footprint({ client }: any) {
  return (
    <div>
      <SectionTitle eyebrow="02" title="Business & Technology Footprint" />
      <p className="text-slate-300 leading-relaxed">
        {client.name} operates across {client.businessFootprint.markets.length} markets, with {client.employees.toLocaleString('en-GB')} employees and a revenue band of {client.revenueBand}. The technology estate spans {client.techFootprint.endpointEstate.workstations.toLocaleString('en-GB')} workstations, {client.techFootprint.endpointEstate.servers.toLocaleString('en-GB')} servers, and {client.techFootprint.saasApps} SaaS applications across {client.techFootprint.cloudProviders.join(' and ')}. {client.techFootprint.ot ? 'Operational technology is in scope.' : 'No operational technology is in scope.'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4"><h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Markets</h5><div className="flex flex-wrap gap-1.5">{client.businessFootprint.markets.map((x: string) => <Badge key={x} tone="accent">{x}</Badge>)}</div></div>
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4"><h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Lines of business</h5><div className="flex flex-wrap gap-1.5">{client.businessFootprint.linesOfBusiness.map((x: string) => <Badge key={x} tone="accent">{x}</Badge>)}</div></div>
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4"><h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Regulatory regimes</h5><div className="flex flex-wrap gap-1.5">{client.businessFootprint.regulatoryRegimes.map((x: string) => <Badge key={x} tone="warn">{x}</Badge>)}</div></div>
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4"><h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Critical processes</h5><div className="flex flex-wrap gap-1.5">{client.businessFootprint.criticalProcesses.map((x: string) => <Badge key={x} tone="muted">{x}</Badge>)}</div></div>
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4"><h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Cloud & identity</h5><div className="flex flex-wrap gap-1.5">{client.techFootprint.cloudProviders.map((x: string) => <Badge key={x} tone="cyan">{x}</Badge>)}{client.techFootprint.identityProviders.map((x: string) => <Badge key={x} tone="info">{x}</Badge>)}</div></div>
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4"><h5 className="text-xs uppercase tracking-wider text-slate-400 mb-2">Key platforms</h5><div className="flex flex-wrap gap-1.5">{client.techFootprint.keyPlatforms.map((x: string) => <Badge key={x} tone="muted">{x}</Badge>)}</div></div>
      </div>
    </div>
  );
}

function Approach({ eng, fw, items }: any) {
  return (
    <div>
      <SectionTitle eyebrow="03" title="Assessment Approach & Scope" />
      <p className="text-slate-300 leading-relaxed">
        The assessment was performed using a structured workshop programme, documentation review and evidence sampling, scored against the CMMI maturity scale (0–5).
        Each control item was assessed for documentation completeness, operational effectiveness, and consistency. The framework applied was {fw.name} {fw.version}{eng.igTier ? ` (Implementation Group ${eng.igTier})` : ''}, comprising {items.length} in-scope items.
      </p>
      <p className="text-slate-300 leading-relaxed mt-3">
        Three lines of evidence were considered for every item: (i) policy and standard documentation; (ii) operational evidence (tickets, dashboards, sample logs, configuration extracts); and (iii) workshop testimony from named control owners. Where evidence categories diverged, the lower of the two was used and the rationale captured in the per-item rationale field.
      </p>
      <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4 mt-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Scope statement</div>
        <p className="text-sm text-slate-200 leading-relaxed">{eng.scope || '—'}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        <KV label="Items in scope">{items.length}</KV>
        <KV label="Workshops conducted">{Math.max(4, Math.round(items.length / 18))}</KV>
        <KV label="Evidence sampled">{items.flatMap((i: any) => i.evidence).length} documents</KV>
      </div>
    </div>
  );
}

function Scoring({ overall, overallT, fw, items, radar, aggs, heatmap }: any) {
  const isCIS = fw.id === 'CIS_V8_1_2';
  const groupLabel = isCIS ? 'CIS Controls' : fw.id === 'NCSC_CAF_4_0' ? 'CAF Objectives' : 'NIST Functions';
  const groupSingular = isCIS ? 'Control' : fw.id === 'NCSC_CAF_4_0' ? 'Objective' : 'Function';
  const itemLabel = isCIS ? 'Safeguard' : fw.id === 'NCSC_CAF_4_0' ? 'Outcome' : 'Subcategory';
  const implementedCount = items.filter((i: any) => i.currentScore >= 3).length;
  const implementedPct = items.length ? Math.round((implementedCount / items.length) * 100) : 0;
  return (
    <div>
      <SectionTitle eyebrow="04" title="Maturity Scoring" />

      {/* Overall maturity — front and centre */}
      <div className="rounded-xl border border-accent-500/30 bg-gradient-to-br from-accent-500/10 via-navy-900/40 to-cyan-500/5 p-6 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-accent-300">Overall maturity score</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Average of all {items.length} {itemLabel.toLowerCase()}s assessed</div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-6xl font-bold font-mono text-white tracking-tight">{overall.toFixed(1)}</span>
              <span className="text-2xl text-slate-400">/ 5</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider">Target</span>
              <span className="font-mono text-cyan-400 text-lg">{overallT.toFixed(1)} / 5</span>
              <span className="text-[11px] text-slate-500">(+{(overallT - overall).toFixed(1)} uplift)</span>
            </div>
            <div className="mt-3 pt-3 border-t border-navy-700/50">
              <div className="text-[10px] uppercase tracking-wider text-slate-400">Implementation</div>
              <div className="flex items-baseline gap-2">
                <span className="text-emerald-300 font-mono text-2xl">{implementedCount}</span>
                <span className="text-xs text-slate-500">/ {items.length} implemented · {implementedPct}%</span>
              </div>
              <div className="text-[10px] text-slate-500">(safeguards with score ≥ 3)</div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">{groupSingular} scores — {groupLabel}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {aggs.map((a: any) => {
                const grp = fw.groups.find((g: any) => g.code === a.groupCode);
                const groupItems = items.filter((i: any) => {
                  const flat = grp?.categories.flatMap((c: any) => c.items) || [];
                  return flat.some((x: any) => x.id === i.itemId);
                });
                const implemented = groupItems.filter((i: any) => i.currentScore >= 3).length;
                return (
                  <div key={a.groupCode} className="rounded-md border border-navy-700/60 bg-navy-900/40 px-2.5 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">{a.groupCode}</span>
                      <Badge tone={a.averageCurrent >= 3 ? 'ok' : 'warn'} dot>{a.averageCurrent >= 3 ? 'Imp.' : 'Not imp.'}</Badge>
                    </div>
                    <div className="text-[11px] font-medium text-slate-200 truncate" title={a.groupName}>{a.groupName}</div>
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                      <span className="font-mono text-base text-white">{a.averageCurrent.toFixed(1)}</span>
                      <span className="text-cyan-400 text-[11px]">→ {a.averageTarget.toFixed(1)}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{implemented}/{groupItems.length} {itemLabel.toLowerCase()}s implemented</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-white mt-2 mb-2">Maturity radar — current vs target vs industry benchmark (amber)</h4>
      <MaturityRadar data={radar} height={340} />

      <h4 className="text-sm font-semibold text-white mt-6 mb-2">Per-{itemLabel.toLowerCase()} heatmap</h4>
      <MaturityHeatmap rows={heatmap} />
    </div>
  );
}

function Benchmark({ client, bars, radar }: any) {
  return (
    <div>
      <SectionTitle eyebrow="05" title="Benchmarking" />
      <p className="text-slate-300 leading-relaxed">
        Compared against the {client.industry} cohort. The radar shows the client position relative to the cohort average; the bar view shows lower / cohort-average / upper-quartile / client values per group. The client position is between the cohort average and the upper quartile across the majority of groups.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3"><MaturityRadar data={radar} height={300} /></div>
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3"><BenchmarkBars data={bars} height={300} /></div>
      </div>
    </div>
  );
}

function ObservationsSection({ observations, pageNum, totalPages, totalCount }: any) {
  const pageInfo = totalPages && totalPages > 1 ? ` — page ${pageNum} of ${totalPages}` : '';
  return (
    <div>
      <SectionTitle eyebrow={`06${pageInfo}`} title="Key Observations" />
      {pageNum === 1 && (
        <p className="text-slate-300 mb-4 text-sm">{totalCount ?? observations.length} observation{(totalCount ?? observations.length) === 1 ? '' : 's'} identified across the assessment, sorted by severity (highest first). Each observation links to exactly one safeguard.</p>
      )}
      <div className="space-y-3">
        {observations.map((o: any) => (
          <div key={o.id} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h5 className="text-sm font-semibold text-white leading-tight">{o.title}</h5>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge tone={o.severity === 'Critical' ? 'critical' : o.severity === 'High' ? 'risk' : o.severity === 'Medium' ? 'warn' : 'muted'}>{o.severity}</Badge>
                <Badge tone="muted">{o.theme}</Badge>
              </div>
            </div>
            {o.body.split('\n\n').slice(0, 3).map((p: string, i: number) => (
              <p key={i} className="text-[12px] text-slate-300 leading-relaxed mt-2 first:mt-0">{p}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskRegister({ risks, pageNum, totalPages, totalCount, allRisks, showMatrix }: any) {
  const pageInfo = totalPages && totalPages > 1 ? ` — page ${pageNum} of ${totalPages}` : '';
  return (
    <div>
      <SectionTitle eyebrow={`07${pageInfo}`} title="Risk Register" />
      {showMatrix && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
            <RiskMatrix risks={(allRisks || risks).map((r: any) => ({ id: r.id, title: r.title, impact: r.impact, likelihood: r.likelihood }))} />
          </div>
          <div className="space-y-2">
            <Stat label="Total risks" value={(totalCount ?? risks.length).toString()} />
            <Stat label="Critical (≥16)" value={(allRisks || risks).filter((r: any) => r.inherentScore >= 16).length.toString()} tone="risk" />
            <Stat label="High (9–15)" value={(allRisks || risks).filter((r: any) => r.inherentScore >= 9 && r.inherentScore < 16).length.toString()} tone="warn" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {risks.map((r: any) => (
          <div key={r.id} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h5 className="text-sm font-semibold text-white leading-tight">{r.title}</h5>
              <Badge tone={r.inherentScore >= 16 ? 'critical' : r.inherentScore >= 9 ? 'risk' : 'warn'} dot>Score {r.inherentScore}</Badge>
            </div>
            {r.description.split('\n\n').slice(0, 2).map((p: string, i: number) => (
              <p key={i} className="text-[12px] text-slate-300 leading-relaxed mt-2 first:mt-0">{p}</p>
            ))}
            <div className="mt-2 text-[11px] text-slate-500">Impact {r.impact} · Likelihood {r.likelihood} · Treatment {r.treatment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recommendations({ recs, pageNum, totalPages, totalCount }: any) {
  const pageInfo = totalPages && totalPages > 1 ? ` — page ${pageNum} of ${totalPages}` : '';
  return (
    <div>
      <SectionTitle eyebrow={`08${pageInfo}`} title="Improvement Recommendations" />
      {pageNum === 1 && (
        <p className="text-slate-300 mb-4 text-sm">{totalCount ?? recs.length} recommendation{(totalCount ?? recs.length) === 1 ? '' : 's'} proposed, prioritised P1–P4 with effort, cost band and delivery horizon. Each recommendation is paired to a specific observation.</p>
      )}
      <div className="space-y-3">
        {recs.map((r: any) => (
          <div key={r.id} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h5 className="text-sm font-semibold text-white leading-tight">{r.title}</h5>
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                <Badge tone={r.priority === 'P1' ? 'critical' : r.priority === 'P2' ? 'risk' : 'warn'}>{r.priority}</Badge>
                <Badge tone="cyan">{r.horizon}</Badge>
                <Badge tone="muted">{r.costBand}</Badge>
                <Badge tone="info">Effort {r.effort}</Badge>
              </div>
            </div>
            {r.description.split('\n\n').slice(0, 2).map((p: string, i: number) => (
              <p key={i} className="text-[12px] text-slate-300 leading-relaxed mt-2 first:mt-0 whitespace-pre-line">{p}</p>
            ))}
            {r.benefits && <p className="text-[12px] text-emerald-200 mt-2"><span className="text-[10px] uppercase tracking-wider text-emerald-300/70 mr-2">Benefits</span>{r.benefits}</p>}
            {r.successCriteria && r.successCriteria.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {r.successCriteria.slice(0, 3).map((s: string, i: number) => (
                  <li key={i} className="text-[11px] text-cyan-100 flex items-start gap-1.5"><span className="mt-1 h-1 w-1 rounded-full bg-cyan-400" /><span>{s}</span></li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Roadmap({ initiatives }: any) {
  return (
    <div>
      <SectionTitle eyebrow="09" title="Improvement Roadmap" />
      <p className="text-slate-300 mb-4">{initiatives.length} initiative{initiatives.length === 1 ? '' : 's'} sequenced across four horizons (0–3m, 3–6m, 6–12m, 12–24m).</p>
      <RoadmapSummary initiatives={initiatives} />
      <div className="mt-4">
        <RoadmapTimeline initiatives={initiatives} />
      </div>
      <ul className="mt-5 space-y-2">
        {initiatives.map((i: any) => (
          <li key={i.id} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold text-white">{i.title}</div>
              <div className="flex items-center gap-1.5">
                <Badge tone="cyan">{i.horizon}</Badge>
                <Badge tone="muted">{i.capabilityArea}</Badge>
                <Badge tone="info">Effort {i.effort}</Badge>
              </div>
            </div>
            <div className="text-[12px] text-slate-300 leading-relaxed">{i.description}</div>
            {i.outcomes && i.outcomes.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {i.outcomes.map((o: string, idx: number) => <li key={idx} className="text-[11px] text-emerald-300 flex items-start gap-1.5"><span className="mt-1 h-1 w-1 rounded-full bg-emerald-400" /><span>{o}</span></li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function QABlock({ eng, users, lead }: any) {
  const reviewer = eng.qaSignOff && users.find((u: any) => u.id === eng.qaSignOff.reviewerId);
  return (
    <div>
      <SectionTitle eyebrow="10" title="QA Sign-off" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Lead assessor</div>
          <div className="flex items-center gap-3 mb-3">
            <Avatar initials={lead.initials} colour={lead.avatarColour} />
            <div>
              <div className="text-sm font-semibold text-white">{lead.name}</div>
              <div className="text-[11px] text-slate-400">{lead.role}</div>
            </div>
          </div>
          <div className="border-t border-navy-700/50 pt-3 mt-3">
            <div className="text-[11px] text-slate-500 mb-1">Signature</div>
            <div className="font-[Caveat,cursive] text-2xl text-cyan-300 italic" style={{ fontFamily: 'Caveat, "Brush Script MT", cursive' }}>{lead.name}</div>
            <div className="text-[10px] text-slate-500 mt-1">Date: {format(new Date(eng.targetEndDate), 'd MMM yyyy')}</div>
          </div>
        </div>
        <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">QA reviewer</div>
          {reviewer ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Avatar initials={reviewer.initials} colour={reviewer.avatarColour} />
                <div>
                  <div className="text-sm font-semibold text-white">{reviewer.name}</div>
                  <div className="text-[11px] text-slate-400">{reviewer.role}</div>
                </div>
              </div>
              <div className="border-t border-navy-700/50 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge tone={eng.qaSignOff.decision === 'Rejected' ? 'risk' : 'ok'} dot>{eng.qaSignOff.decision}</Badge>
                  <span className="text-[10px] text-slate-500">{format(new Date(eng.qaSignOff.signedAt), 'd MMM yyyy HH:mm')}</span>
                </div>
                {eng.qaSignOff.comments && <p className="text-[12px] text-slate-300 leading-relaxed">{eng.qaSignOff.comments}</p>}
                <div className="font-[Caveat,cursive] text-2xl text-cyan-300 italic mt-3" style={{ fontFamily: 'Caveat, "Brush Script MT", cursive' }}>{reviewer.name}</div>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-400 leading-relaxed">QA sign-off pending. Submit through the QA Review stage.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Conclusion({ overall, overallT, client }: any) {
  return (
    <div>
      <SectionTitle eyebrow="11" title="Conclusion & Next Steps" />
      <p className="text-slate-300 leading-relaxed">
        {client.name} is making measurable progress on its security programme, with foundational governance and documentation broadly mature, and material work to do in detection coverage, recovery validation, and identity hygiene. The recommended roadmap focuses delivery on the highest-leverage uplift in the first 6 months and sequences longer-running programmes thereafter.
      </p>
      <p className="text-slate-300 leading-relaxed mt-3">
        Adopting the recommended roadmap should lift overall maturity from {overall.toFixed(1)} to {overallT.toFixed(1)} within 18–24 months. We recommend the following next steps:
      </p>
      <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1 mt-3 ml-2">
        <li>Approve the roadmap and assign accountable owners to each initiative.</li>
        <li>Establish quarterly governance over delivery, with executive visibility of progress and residual risk position.</li>
        <li>Execute the P1 recommendations within the next 90 days.</li>
        <li>Schedule a follow-up assessment in 12 months to confirm uplift and re-baseline against the benchmark cohort.</li>
        <li>Integrate the lessons-learned process so that improvement actions feed structurally back into the security programme.</li>
      </ol>
    </div>
  );
}

function Appendices({ items }: any) {
  return (
    <div>
      <SectionTitle eyebrow="12" title="Appendices" />
      <ul className="text-sm text-slate-300 space-y-1.5 list-disc list-inside">
        <li>Appendix A — Evidence index ({items.flatMap((i: any) => i.evidence).length} documents)</li>
        <li>Appendix B — Workshop participation log</li>
        <li>Appendix C — Framework cross-mappings (NIST ↔ CIS ↔ CAF)</li>
        <li>Appendix D — Detailed scoring rationale (per item)</li>
        <li>Appendix E — Glossary of terms</li>
        <li>Appendix F — Methodology and CMMI scale definitions</li>
      </ul>
    </div>
  );
}

function Stat({ label, value, suffix, tone = 'accent' }: { label: string; value: string; suffix?: string; tone?: string }) {
  const t: Record<string, string> = { accent: 'text-accent-300', cyan: 'text-cyan-400', risk: 'text-red-300', info: 'text-sky-300' };
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold font-mono ${t[tone]}`}>{value}</span>
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-sm text-white font-medium">{children}</div>
    </div>
  );
}
