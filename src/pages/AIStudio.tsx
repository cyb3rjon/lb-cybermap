import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Wand2, FileAudio, FileText, Eye, AlertTriangle, Lightbulb, Map, ArrowRight, CheckCircle2, ScrollText, Gauge, Layers, ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea, Select, Input } from '@/components/ui/Input';
import { useStore } from '@/store/useStore';
import { FRAMEWORKS } from '@/data/frameworks';
import { ProgressBar } from '@/components/ui/ProgressBar';

const PIPELINE = [
  { icon: FileAudio, label: 'Transcript ingest', desc: 'Diarise & chunk' },
  { icon: ScrollText, label: 'Notes', desc: 'Map to controls' },
  { icon: Eye, label: 'Findings', desc: 'Obs + risk + rec triples' },
  { icon: Map, label: 'Roadmap', desc: 'Cluster initiatives' },
  { icon: Gauge, label: 'Scores', desc: 'Suggested CMMI' },
  { icon: Layers, label: 'Summary', desc: 'Executive narrative' },
];

interface JobLog {
  id: string;
  stage: string;
  engagementName: string;
  generated: number;
  ts: string;
  link?: string;
}

export default function AIStudio() {
  const engagements = useStore((s) => s.engagements);
  const clients = useStore((s) => s.clients);
  const currentUserId = useStore((s) => s.currentUserId);
  const aiGenerateNotes = useStore((s) => s.aiGenerateNotes);
  const aiGenerateFindings = useStore((s) => s.aiGenerateFindings);
  const aiGenerateRoadmap = useStore((s) => s.aiGenerateRoadmap);
  const aiSuggestScores = useStore((s) => s.aiSuggestScores);
  const ingestTranscript = useStore((s) => s.ingestTranscript);

  const [engId, setEngId] = useState(engagements[0]?.id || '');
  const [transcriptTitle, setTranscriptTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [running, setRunning] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<JobLog[]>([]);

  const eng = engagements.find((e) => e.id === engId);
  const clientName = eng ? clients.find((c) => c.id === eng.clientId)?.name : '';

  function logJob(stage: string, generated: number, link?: string) {
    if (!eng) return;
    setHistory((h) => [
      { id: Math.random().toString(16).slice(2), stage, engagementName: clientName || eng.id, generated, ts: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), link },
      ...h,
    ].slice(0, 12));
  }

  async function runStage(stage: string, fn: () => number, link?: string) {
    if (!engId) return;
    setRunning(stage); setProgress(8);
    for (let p = 22; p < 90; p += 14) {
      await new Promise((r) => setTimeout(r, 110));
      setProgress(p);
    }
    const generated = fn();
    setProgress(100);
    logJob(stage, generated, link);
    setTimeout(() => { setRunning(null); setProgress(0); }, 380);
  }

  async function runIngest() {
    if (!engId || !transcript.trim()) return;
    setRunning('notes'); setProgress(10);
    for (let p = 22; p < 80; p += 12) {
      await new Promise((r) => setTimeout(r, 100));
      setProgress(p);
    }
    const result = ingestTranscript(engId, transcriptTitle.trim() || 'AI Studio transcript', transcript, currentUserId);
    setProgress(100);
    logJob('transcript', result.notesAdded, `/engagements/${engId}/notes`);
    setTimeout(() => { setRunning(null); setProgress(0); setTranscript(''); setTranscriptTitle(''); }, 380);
  }

  const stageButtons: { key: string; label: string; icon: any; desc: string; run: () => number; link: string }[] = [
    { key: 'findings', label: 'Generate findings (observation + risk + recommendation triples)', icon: Eye, desc: 'For every low-scored item without a finding, generate a fully-aligned observation with paired risk and recommendation.', run: () => aiGenerateFindings(engId), link: `/engagements/${engId}/observations` },
    { key: 'roadmap', label: 'Cluster recommendations into roadmap', icon: Map, desc: 'Sequence into capability-area initiatives across four horizons.', run: () => aiGenerateRoadmap(engId), link: `/engagements/${engId}/roadmap` },
    { key: 'scoreSuggest', label: 'Suggest CMMI target scores', icon: CheckCircle2, desc: 'Per-item suggested target with rationale, where missing.', run: () => aiSuggestScores(engId), link: `/engagements/${engId}/scoring` },
    { key: 'fillNotes', label: 'Generate placeholder notes for untouched items', icon: ScrollText, desc: 'Useful when a workshop transcript is not yet available — draft notes for items lacking any.', run: () => aiGenerateNotes(engId), link: `/engagements/${engId}/notes` },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="AI"
        title="AI Studio"
        description="Process workshop transcripts into structured notes, then generate paired observation / risk / recommendation triples, roadmap clusters and score suggestions. Every artefact is a draft for assessor review."
        actions={<Badge tone="cyan" dot>All services nominal</Badge>}
      />
      <div className="px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card elevated>
            <CardHeader icon={<Wand2 size={16} />} title="Pipeline overview" subtitle="One chain — transcripts in, structured assessment artefacts out." />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {PIPELINE.map((p, i) => (
                <div key={p.label} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3 text-center relative">
                  <p.icon size={18} className="mx-auto text-cyan-400 mb-1.5" />
                  <div className="text-xs font-semibold text-white leading-tight">{p.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-600 z-10" size={14} />
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card elevated>
            <CardHeader icon={<Sparkles size={16} />} title="Target engagement" />
            <Select
              label="Engagement"
              value={engId}
              onChange={(e) => setEngId(e.target.value)}
              options={engagements.map((eng) => {
                const c = clients.find((cl) => cl.id === eng.clientId)!;
                return { value: eng.id, label: `${c.name} — ${FRAMEWORKS[eng.framework].shortName} ${eng.year}` };
              })}
            />
          </Card>

          <Card elevated>
            <CardHeader icon={<ScrollText size={16} />} title="Ingest transcript" subtitle="Paste a workshop transcript and the AI will extract structured notes mapped to relevant controls." />
            <div className="space-y-3">
              <Input label="Transcript title" value={transcriptTitle} onChange={(e) => setTranscriptTitle(e.target.value)} placeholder="Workshop — Identity & Access (15 Nov)" />
              <Textarea
                label="Transcript content"
                rows={6}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the workshop transcript here, or use the Notes page to upload an audio/text file."
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {transcript.length.toLocaleString('en-GB')} characters · ~{Math.max(1, Math.round(transcript.split(/\s+/).length / 150))} min read
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/engagements/${engId}/notes`}><Button variant="outline" size="sm" iconLeft={<FileAudio size={14} />}>Upload audio/file</Button></Link>
                  <Button onClick={runIngest} iconLeft={<Sparkles size={14} />} loading={running === 'notes'} disabled={!transcript.trim()}>Ingest & extract notes</Button>
                </div>
              </div>
              {running === 'notes' && <ProgressBar value={progress} tone="cyan" />}
            </div>
          </Card>

          <Card elevated>
            <CardHeader title="Stage controls" subtitle="Run an individual stage of the pipeline. Drafts are written to the engagement and immediately visible on the relevant stage page." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stageButtons.map((g) => (
                <div key={g.key} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
                  <div className="flex items-start gap-3">
                    <g.icon size={18} className="text-accent-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{g.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{g.desc}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" loading={running === g.key} onClick={() => runStage(g.key, g.run, g.link)}>Run stage</Button>
                    <Link to={g.link} className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
                      View results <ExternalLink size={11} />
                    </Link>
                  </div>
                  {running === g.key && (
                    <div className="mt-2"><ProgressBar value={progress} tone="cyan" /></div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card elevated>
            <CardHeader title="Provenance & guardrails" subtitle="Every AI artefact is auditable and editable." />
            <ul className="space-y-3 text-sm">
              {[
                'Outputs are stored as drafts; assessor must accept or edit.',
                'Findings are emitted as observation + paired risk + paired recommendation triples — never separately.',
                'Every draft records prompt version, model, and source IDs.',
                'JSON-schema validated; retries on schema failure.',
                'Optional fully-local model (Ollama) for sensitive engagements.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="mt-0.5 text-emerald-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card elevated>
            <CardHeader title="Recent jobs" subtitle="Last 12 stages run from this session" />
            {history.length === 0 ? (
              <div className="text-sm text-slate-500 py-3">No jobs yet — run a stage to see output here.</div>
            ) : (
              <div className="space-y-2">
                {history.map((j) => (
                  <div key={j.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium text-white truncate">{j.engagementName}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{j.stage} · {j.ts}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge tone={j.generated > 0 ? 'ok' : 'muted'} dot>
                        {j.generated > 0 ? `+${j.generated}` : 'no-op'}
                      </Badge>
                      {j.link && <Link to={j.link} className="text-[11px] text-cyan-400 hover:text-cyan-300">View</Link>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
