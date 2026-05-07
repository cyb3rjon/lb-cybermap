import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScrollText, Sparkles, Upload, FileAudio, Search, Wand2, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { FRAMEWORKS, findItem } from '@/data/frameworks';
import { Modal } from '@/components/ui/Modal';
import { format } from 'date-fns';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function Notes() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const transcripts = useStore((s) => s.getTranscripts(engagementId));
  const currentUserId = useStore((s) => s.currentUserId);
  const addNote = useStore((s) => s.addNote);
  const ingestTranscript = useStore((s) => s.ingestTranscript);

  const [q, setQ] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [openNote, setOpenNote] = useState<{ itemId: string } | null>(null);
  const [draft, setDraft] = useState('');

  const [openTranscript, setOpenTranscript] = useState(false);
  const [transcriptTitle, setTranscriptTitle] = useState('');
  const [transcriptBody, setTranscriptBody] = useState('');
  const [banner, setBanner] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fw = eng && FRAMEWORKS[eng.framework];

  const noteRows = useMemo(() => {
    if (!fw) return [];
    return items
      .map((ai) => {
        const it = findItem(fw, ai.itemId);
        if (!it) return null;
        return { ai, it };
      })
      .filter(Boolean) as { ai: typeof items[number]; it: NonNullable<ReturnType<typeof findItem>> }[];
  }, [items, fw]);

  const filtered = noteRows
    .filter((r) => groupFilter === 'all' || r.it.id.startsWith(groupFilter))
    .filter((r) => !q || r.it.title.toLowerCase().includes(q.toLowerCase()) || r.it.code.toLowerCase().includes(q.toLowerCase()))
    .filter((r) => r.ai.notes.length > 0 || !q);

  const totalNotes = items.reduce((a, b) => a + b.notes.length, 0);
  const aiNotes = items.reduce((a, b) => a + b.notes.filter((n) => n.provenance !== 'manual').length, 0);

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      // For audio/video, the back-end will transcribe; for now we accept text-like files.
      const isText = /\.(txt|md|vtt|srt|csv|json)$/i.test(file.name) || file.type.startsWith('text');
      if (isText) {
        setTranscriptTitle(file.name.replace(/\.[^.]+$/, ''));
        setTranscriptBody(text);
        setOpenTranscript(true);
      } else {
        // Stub for audio: still create a transcript entry, mark queued
        runIngest(file.name.replace(/\.[^.]+$/, ''), `Audio file uploaded (${(file.size / 1024 / 1024).toFixed(1)} MB). Back-end Whisper pipeline will transcribe.`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function runIngest(title: string, body: string) {
    if (!title.trim() || !body.trim()) return;
    setIngesting(true);
    setTimeout(() => {
      const result = ingestTranscript(engagementId, title.trim(), body, currentUserId);
      setBanner(`Ingested "${title.trim()}" — ${result.notesAdded} note${result.notesAdded === 1 ? '' : 's'} drafted from the transcript and mapped to relevant controls.`);
      setIngesting(false);
      setOpenTranscript(false);
      setTranscriptTitle(''); setTranscriptBody('');
      setTimeout(() => setBanner(null), 6000);
    }, 700);
  }

  if (!eng || !fw) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      {banner && (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200 flex items-center gap-2">
          <Sparkles size={14} /><span>{banner}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card elevated>
          <CardHeader icon={<ScrollText size={16} />} title="Workshop transcripts" subtitle="Upload audio/text or paste a transcript — AI extracts structured notes mapped to the right controls." />
          <div className="space-y-3">
            {transcripts.map((t) => (
              <div key={t.id} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{format(new Date(t.uploadedAt), 'd MMM HH:mm')} · {t.durationMinutes}m · {t.participants.length} participant{t.participants.length === 1 ? '' : 's'}</div>
                  </div>
                  <Badge tone={t.status === 'extracted' ? 'ok' : t.status === 'processing' ? 'info' : 'warn'} dot>
                    {t.status === 'extracted' ? `${t.derivedNoteCount} notes` : t.status}
                  </Badge>
                </div>
                {t.status === 'processing' && (
                  <div className="mt-2"><ProgressBar value={62} tone="cyan" /></div>
                )}
              </div>
            ))}
            {transcripts.length === 0 && <div className="text-xs text-slate-500">No transcripts yet — upload or paste one to begin.</div>}
            <div className="flex items-center gap-2 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.vtt,.srt,.csv,.json,.docx,.mp3,.wav,.m4a,.mp4,audio/*,text/*"
                onChange={handleFileChosen}
                className="hidden"
              />
              <Button size="sm" variant="outline" iconLeft={<FileAudio size={14} />} onClick={() => fileInputRef.current?.click()}>
                Upload file
              </Button>
              <Button size="sm" iconLeft={<Wand2 size={14} />} onClick={() => { setTranscriptTitle(''); setTranscriptBody(''); setOpenTranscript(true); }}>
                Paste transcript
              </Button>
            </div>
          </div>
        </Card>

        <Card elevated>
          <CardHeader title="Notes activity" />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Notes captured" value={totalNotes.toString()} />
            <Stat label="AI-assisted" value={aiNotes.toString()} tone="cyan" />
            <Stat label="Items with notes" value={items.filter((i) => i.notes.length > 0).length.toString()} />
            <Stat label="Items pending" value={items.filter((i) => i.notes.length === 0).length.toString()} tone="warn" />
          </div>
        </Card>

        <Card elevated>
          <CardHeader icon={<Sparkles size={16} />} title="Quick actions" />
          <div className="space-y-2">
            <Button variant="outline" className="w-full" iconLeft={<Sparkles size={14} />} onClick={() => { setTranscriptTitle('Workshop summary'); setTranscriptBody(''); setOpenTranscript(true); }}>
              Auto-generate from transcripts
            </Button>
            <Button variant="outline" className="w-full" iconLeft={<Upload size={14} />} onClick={() => fileInputRef.current?.click()}>
              Upload transcript file
            </Button>
            <Button variant="ghost" className="w-full" iconLeft={<Search size={14} />}>Find duplicate notes</Button>
          </div>
        </Card>
      </div>

      <Card elevated className="!p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Input placeholder="Search notes & controls…" value={q} onChange={(e) => setQ(e.target.value)} className="!w-72" />
          <Select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            options={[{ value: 'all', label: 'All groups' }, ...fw.groups.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }))]}
            className="!w-72"
          />
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map(({ ai, it }) => (
          <Card key={it.id} elevated>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500">{it.code}</span>
                  <span className="text-sm font-semibold text-white">{it.title}</span>
                  {it.igTier && <Badge tone="cyan">IG{it.igTier}</Badge>}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{it.description}</p>
              </div>
              <Button size="sm" variant="outline" iconLeft={<ScrollText size={13} />} onClick={() => setOpenNote({ itemId: it.id })}>
                Add note
              </Button>
            </div>
            {ai.notes.length > 0 ? (
              <div className="mt-3 space-y-2">
                {ai.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-navy-700/50 bg-navy-900/40 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={n.provenance === 'manual' ? 'muted' : 'cyan'} dot>
                          {n.provenance === 'manual' ? 'Manual' : 'AI assist'}
                        </Badge>
                        {n.sourceTranscriptId && <Badge tone="info" icon={<FileText size={10} />}>From transcript</Badge>}
                      </div>
                      <span className="text-[10px] text-slate-500">{format(new Date(n.createdAt), 'd MMM HH:mm')}</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-3">No notes yet for this control.</p>
            )}
          </Card>
        ))}
      </div>

      {/* Add manual note */}
      <Modal
        open={!!openNote}
        onClose={() => setOpenNote(null)}
        title="Add note"
        subtitle={openNote ? findItem(fw, openNote.itemId)?.title : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenNote(null)}>Cancel</Button>
            <Button onClick={() => {
              if (openNote && draft.trim()) {
                addNote(engagementId, openNote.itemId, { body: draft, author: currentUserId, provenance: 'manual' });
                setDraft(''); setOpenNote(null);
              }
            }}>Save note</Button>
          </>
        }
      >
        <Textarea rows={6} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="What was said? Who said it? What evidence was referenced?" />
      </Modal>

      {/* Transcript paste / file-imported preview + ingest */}
      <Modal
        open={openTranscript}
        onClose={() => !ingesting && setOpenTranscript(false)}
        title="Ingest transcript"
        subtitle="The AI maps content to relevant controls and writes draft notes."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenTranscript(false)} disabled={ingesting}>Cancel</Button>
            <Button onClick={() => runIngest(transcriptTitle, transcriptBody)} loading={ingesting} disabled={!transcriptBody.trim()}>
              Ingest & generate notes
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Transcript title" value={transcriptTitle} onChange={(e) => setTranscriptTitle(e.target.value)} placeholder="Workshop — Identity & Access (15 Nov)" />
          <Textarea
            label="Transcript content"
            rows={12}
            value={transcriptBody}
            onChange={(e) => setTranscriptBody(e.target.value)}
            placeholder="Paste the full transcript here. The AI will extract structured notes mapped to relevant controls."
          />
          <div className="text-[11px] text-slate-500">
            {transcriptBody.length.toLocaleString('en-GB')} characters · ~{Math.max(1, Math.round(transcriptBody.split(/\s+/).length / 150))} min read
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Stat({ label, value, tone = 'default' }: { label: string; value: string; tone?: string }) {
  const colour = tone === 'cyan' ? 'text-cyan-400' : tone === 'warn' ? 'text-amber-300' : 'text-white';
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-2xl font-bold font-mono ${colour}`}>{value}</div>
    </div>
  );
}
