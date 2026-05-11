import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileSearch, Upload, Filter, FileText, Paperclip, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select, Input, Textarea } from '@/components/ui/Input';
import { DocStatusDot, docStatusMeta } from '@/components/ui/StatusDot';
import { FRAMEWORKS, findItem } from '@/data/frameworks';
import type { DocStatus, EvidenceDoc } from '@/types';

export default function DocumentationReview() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const items = useStore((s) => s.getAssessmentItems(engagementId));
  const setDocStatus = useStore((s) => s.setDocStatus);
  const updateAssessmentItem = useStore((s) => s.updateAssessmentItem);
  const currentUserId = useStore((s) => s.currentUserId);

  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all');
  const [q, setQ] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<{ itemId: string; name: string; status: DocStatus; version: string; comments: string }>({
    itemId: '', name: '', status: 'in_place', version: 'v1.0', comments: '',
  });
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fw = eng && FRAMEWORKS[eng.framework];

  const summary = useMemo(() => {
    const out: Record<DocStatus, number> = { in_place: 0, partial: 0, out_of_date: 0, not_in_place: 0, not_applicable: 0 };
    for (const i of items) out[i.docStatus]++;
    return out;
  }, [items]);

  const rows = useMemo(() => {
    if (!fw) return [];
    const flat: { groupCode: string; groupName: string; code: string; itemId: string; title: string; description: string; igTier?: number; status: DocStatus; evidenceCount: number }[] = [];
    for (const g of fw.groups) {
      for (const c of g.categories) {
        for (const it of c.items) {
          const ai = items.find((x) => x.itemId === it.id);
          if (!ai) continue;
          flat.push({
            groupCode: g.code, groupName: g.name, code: it.code, itemId: it.id, title: it.title, description: it.description,
            igTier: it.igTier, status: ai.docStatus, evidenceCount: ai.evidence.length,
          });
        }
      }
    }
    return flat
      .filter((r) => groupFilter === 'all' || r.groupCode === groupFilter)
      .filter((r) => statusFilter === 'all' || r.status === statusFilter)
      .filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase()) || r.code.toLowerCase().includes(q.toLowerCase()));
  }, [fw, items, groupFilter, statusFilter, q]);

  function openUpload(prefillItemId?: string) {
    setUploadForm({ itemId: prefillItemId || (items[0]?.itemId ?? ''), name: '', status: 'in_place', version: 'v1.0', comments: '' });
    setStagedFile(null);
    setUploadOpen(true);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStagedFile(file);
    if (!uploadForm.name) {
      setUploadForm((f) => ({ ...f, name: file.name }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function commitUpload() {
    if (!uploadForm.itemId || !uploadForm.name.trim()) return;
    const ai = items.find((x) => x.itemId === uploadForm.itemId);
    if (!ai) return;
    const newEvidence: EvidenceDoc = {
      id: `ev-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 6)}`,
      name: uploadForm.name.trim(),
      status: uploadForm.status,
      version: uploadForm.version || undefined,
      lastReviewed: new Date().toISOString().slice(0, 10),
      uploadedBy: currentUserId,
      comments: uploadForm.comments || undefined,
    };
    updateAssessmentItem(engagementId, uploadForm.itemId, {
      evidence: [...ai.evidence, newEvidence],
      docStatus: uploadForm.status,
    });
    const linkedItem = fw ? findItem(fw, uploadForm.itemId) : undefined;
    setBanner(`Evidence "${newEvidence.name}" attached to ${linkedItem ? `${linkedItem.code} ${linkedItem.title}` : uploadForm.itemId}.`);
    setTimeout(() => setBanner(null), 5500);
    setUploadOpen(false);
    setStagedFile(null);
  }

  if (!eng || !fw) return null;

  return (
    <div className="px-6 lg:px-8 py-6 space-y-5">
      {banner && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 flex items-center gap-2">
          <CheckCircle2 size={14} /><span>{banner}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.entries(docStatusMeta) as [DocStatus, typeof docStatusMeta[DocStatus]][]).map(([k, m]) => (
          <Card key={k} elevated className="!p-4">
            <div className="flex items-center justify-between mb-2">
              <DocStatusDot status={k} />
              <span className="text-xs text-slate-400">{m.label}</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">{summary[k]}</div>
          </Card>
        ))}
      </div>

      <Card elevated className="!p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400 text-xs px-1"><Filter size={13} /> Filter</div>
          <Input placeholder="Search controls…" value={q} onChange={(e) => setQ(e.target.value)} className="!w-64" />
          <Select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            options={[{ value: 'all', label: 'All groups' }, ...fw.groups.map((g) => ({ value: g.code, label: `${g.code} — ${g.name}` }))]}
            className="!w-72"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'in_place', label: 'In place' },
              { value: 'partial', label: 'Partial' },
              { value: 'out_of_date', label: 'Out of date' },
              { value: 'not_in_place', label: 'Not in place' },
              { value: 'not_applicable', label: 'N/A' },
            ]}
            className="!w-44"
          />
          <div className="ml-auto">
            <Button variant="outline" iconLeft={<Upload size={14} />} onClick={() => openUpload()}>Upload evidence</Button>
          </div>
        </div>
      </Card>

      <Card elevated className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Control</th>
              <th className="text-left px-3 py-3 font-medium">Group</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-left px-3 py-3 font-medium">Evidence</th>
              <th className="text-left px-3 py-3 font-medium">Set status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-700/40">
            {rows.map((r) => (
              <tr key={r.itemId} className="hover:bg-navy-700/15">
                <td className="px-5 py-3">
                  <div className="flex items-start gap-3">
                    <FileText size={14} className="text-accent-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm">
                        <span className="font-mono text-[11px] text-slate-500 mr-2">{r.code}</span>
                        <span className="text-white font-medium">{r.title}</span>
                        {r.igTier && <Badge tone="cyan" className="ml-2">IG{r.igTier}</Badge>}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 max-w-2xl">{r.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-xs text-slate-300">{r.groupCode}</td>
                <td className="px-3 py-3"><DocStatusDot status={r.status} withLabel /></td>
                <td className="px-3 py-3">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-md border border-navy-700/60 px-2 py-1 text-xs text-slate-300 hover:border-accent-500/60 hover:text-white transition"
                    onClick={() => openUpload(r.itemId)}
                  >
                    <Paperclip size={12} />
                    {r.evidenceCount > 0 ? `${r.evidenceCount} file${r.evidenceCount === 1 ? '' : 's'}` : 'Attach'}
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    {(['in_place','partial','out_of_date','not_in_place','not_applicable'] as DocStatus[]).map((s) => {
                      const m = docStatusMeta[s];
                      const active = r.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setDocStatus(engagementId, r.itemId, s)}
                          title={m.label}
                          className={`h-7 w-7 rounded-md border transition flex items-center justify-center ${
                            active ? 'border-accent-500/60 bg-accent-500/15' : 'border-navy-700/60 hover:border-accent-500/40'
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full ring-2 ${m.ring} ${m.bg}`} />
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="py-14 flex flex-col items-center text-center">
            <FileSearch className="text-accent-400/70 mb-2" size={28} />
            <div className="text-sm font-semibold text-slate-200">No items match your filters.</div>
          </div>
        )}
      </Card>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload evidence"
        subtitle="Attach a document, policy or report as evidence against a control item."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={commitUpload} disabled={!uploadForm.itemId || !uploadForm.name.trim()}>Attach evidence</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Linked control"
            value={uploadForm.itemId}
            onChange={(e) => setUploadForm({ ...uploadForm, itemId: e.target.value })}
            options={items.map((ai) => {
              const it = findItem(fw, ai.itemId);
              return { value: ai.itemId, label: it ? `${it.code} ${it.title}` : ai.itemId };
            })}
          />
          <div className="rounded-lg border border-dashed border-navy-600/70 bg-navy-900/40 p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg"
              onChange={handleFile}
              className="hidden"
            />
            <Upload className="mx-auto text-accent-400 mb-2" size={22} />
            {stagedFile ? (
              <>
                <div className="text-sm font-medium text-white">{stagedFile.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{(stagedFile.size / 1024).toFixed(0)} KB · {stagedFile.type || 'file'}</div>
              </>
            ) : (
              <div className="text-sm text-slate-400">Choose a file to stage, or just enter a reference below.</div>
            )}
            <Button size="sm" variant="outline" className="mt-3" onClick={() => fileInputRef.current?.click()}>
              {stagedFile ? 'Replace file' : 'Choose file'}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input label="Document name / reference" value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} placeholder="Information Security Policy v3.2" />
            <Input label="Version" value={uploadForm.version} onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })} placeholder="v3.2" />
          </div>
          <Select
            label="Resulting documentation status"
            value={uploadForm.status}
            onChange={(e) => setUploadForm({ ...uploadForm, status: e.target.value as DocStatus })}
            options={[
              { value: 'in_place', label: 'In place' },
              { value: 'partial', label: 'Partial' },
              { value: 'out_of_date', label: 'Out of date' },
              { value: 'not_in_place', label: 'Not in place' },
              { value: 'not_applicable', label: 'N/A' },
            ]}
          />
          <Textarea label="Reviewer comments" rows={3} value={uploadForm.comments} onChange={(e) => setUploadForm({ ...uploadForm, comments: e.target.value })} placeholder="What does this evidence demonstrate? Caveats?" />
          <div className="text-[11px] text-slate-500">
            Note: this front-end stores file metadata only. The back-end (planned) will store the file content securely.
          </div>
        </div>
      </Modal>
    </div>
  );
}
