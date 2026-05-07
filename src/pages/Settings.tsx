import { useState } from 'react';
import { Settings as SettingsIcon, Users, Database, Sparkles, Server, Lock, RefreshCcw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useStore } from '@/store/useStore';

export default function Settings() {
  const users = useStore((s) => s.users);
  const reset = useStore((s) => s.resetMockData);
  const [tab, setTab] = useState('team');

  return (
    <div>
      <PageHeader eyebrow="Configuration" title="Settings" description="Manage team, frameworks, AI providers and platform configuration." />
      <div className="px-6 lg:px-8 py-6 space-y-5">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'team', label: 'Team', icon: <Users size={14} /> },
            { value: 'frameworks', label: 'Frameworks', icon: <Database size={14} /> },
            { value: 'ai', label: 'AI', icon: <Sparkles size={14} /> },
            { value: 'platform', label: 'Platform', icon: <Server size={14} /> },
            { value: 'security', label: 'Security', icon: <Lock size={14} /> },
            { value: 'data', label: 'Data', icon: <SettingsIcon size={14} /> },
          ]}
        />

        {tab === 'team' && (
          <Card elevated className="!p-0">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Team members</h3>
                <p className="text-xs text-slate-400 mt-0.5">{users.length} members across roles.</p>
              </div>
              <Button size="sm">Invite member</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-navy-900/60 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-3 py-3 font-medium">Email</th>
                  <th className="text-left px-3 py-3 font-medium">Role</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/40">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-navy-700/20">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar initials={u.initials} colour={u.avatarColour} size="sm" />
                        <span className="font-medium text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-300 font-mono text-xs">{u.email}</td>
                    <td className="px-3 py-3"><Badge tone="accent">{u.role}</Badge></td>
                    <td className="px-3 py-3"><Badge tone="ok" dot>Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {tab === 'frameworks' && (
          <Card elevated>
            <CardHeader title="Framework catalogue" subtitle="Versions of the canonical control libraries used by the platform." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: 'NIST CSF', version: '2.0', updated: '2024-02-26', source: 'NIST', items: 106 },
                { name: 'CIS Controls', version: '8.1.2', updated: '2024-08-08', source: 'CIS', items: 153 },
                { name: 'NCSC CAF', version: '4.0', updated: '2025-04-30', source: 'NCSC', items: 39 },
              ].map((f) => (
                <div key={f.name} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{f.name}</div>
                      <div className="text-[11px] text-slate-400">v{f.version} · {f.source}</div>
                    </div>
                    <Badge tone="ok" dot>Up to date</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                    <div><div className="text-slate-500">Items</div><div className="text-slate-200 font-mono">{f.items}</div></div>
                    <div><div className="text-slate-500">Updated</div><div className="text-slate-200 font-mono">{f.updated}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'ai' && (
          <Card elevated>
            <CardHeader icon={<Sparkles size={16} />} title="AI provider" subtitle="Choose model provider; for sensitive engagements, switch to local-only inference." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <Select label="Generation model" defaultValue="claude-sonnet-4-6" options={[
                { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (recommended)' },
                { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (fast / cheap)' },
                { value: 'local-llama', label: 'Local — Llama 3.3 70B (Ollama)' },
                { value: 'local-qwen', label: 'Local — Qwen 2.5 72B (Ollama)' },
              ]} />
              <Select label="Transcription" defaultValue="whisper-large" options={[
                { value: 'whisper-large', label: 'Whisper Large v3 (local)' },
                { value: 'faster-whisper', label: 'faster-whisper Medium (local)' },
              ]} />
              <Input label="API base URL" defaultValue="http://api.lb-cybermap.local:8080" />
              <Input label="Local fallback" defaultValue="http://ollama.lb-cybermap.local:11434" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm">Save settings</Button>
              <Button size="sm" variant="ghost">Test connection</Button>
            </div>
          </Card>
        )}

        {tab === 'platform' && (
          <Card elevated>
            <CardHeader icon={<Server size={16} />} title="Platform" subtitle="Local hosting configuration." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <Input label="Workspace name" defaultValue="Assessment Team — EMEA" />
              <Input label="Default region" defaultValue="EMEA" />
              <Input label="Storage path" defaultValue="/var/lb-cybermap/data" />
              <Input label="Backup schedule" defaultValue="0 2 * * *" />
            </div>
          </Card>
        )}

        {tab === 'security' && (
          <Card elevated>
            <CardHeader icon={<Lock size={16} />} title="Security" subtitle="Authentication and audit policy." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <Select label="Authentication" defaultValue="sso" options={[
                { value: 'sso', label: 'Internal SSO (preferred)' },
                { value: 'password+totp', label: 'Email + password + TOTP' },
              ]} />
              <Select label="Session timeout" defaultValue="30" options={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '60', label: '60 minutes' },
              ]} />
              <Select label="Audit log retention" defaultValue="365" options={[
                { value: '90', label: '90 days' },
                { value: '180', label: '180 days' },
                { value: '365', label: '365 days' },
                { value: '1825', label: '5 years' },
              ]} />
            </div>
          </Card>
        )}

        {tab === 'data' && (
          <Card elevated>
            <CardHeader icon={<RefreshCcw size={16} />} title="Mock data" subtitle="This front-end ships with seeded illustrative data; reset it any time." />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={reset} iconLeft={<RefreshCcw size={14} />}>Reset to seed</Button>
              <Button variant="ghost">Export workspace (.json)</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
