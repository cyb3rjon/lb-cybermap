import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Globe2, Users as UsersIcon, Wallet, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select, Input } from '@/components/ui/Input';

export default function Clients() {
  const clients = useStore((s) => s.clients);
  const engagements = useStore((s) => s.engagements);

  const [q, setQ] = useState('');
  const [industry, setIndustry] = useState('all');
  const [country, setCountry] = useState('all');

  const industries = Array.from(new Set(clients.map((c) => c.industry)));
  const countries = Array.from(new Set(clients.map((c) => c.country)));

  const filtered = clients.filter((c) =>
    (industry === 'all' || c.industry === industry) &&
    (country === 'all' || c.country === country) &&
    (!q || c.name.toLowerCase().includes(q.toLowerCase()) || c.industry.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Clients"
        description={`${filtered.length} of ${clients.length} clients shown.`}
        actions={
          <Link to="/clients/new">
            <Button iconLeft={<Plus size={14} />}>New client</Button>
          </Link>
        }
      />

      <div className="px-6 lg:px-8 py-6 space-y-5">
        <Card elevated className="!p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="Search by name or industry…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={industry} onChange={(e) => setIndustry(e.target.value)} options={[{ value: 'all', label: 'All industries' }, ...industries.map((i) => ({ value: i, label: i }))]} />
            <Select value={country} onChange={(e) => setCountry(e.target.value)} options={[{ value: 'all', label: 'All countries' }, ...countries.map((c) => ({ value: c, label: c }))]} />
            <div />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const clientEngagements = engagements.filter((e) => e.clientId === c.id);
            return (
              <Card key={c.id} elevated>
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-semibold text-base shadow-glow shrink-0"
                    style={{ background: `linear-gradient(135deg, ${c.logoColour}, ${c.logoColour}aa)` }}>
                    {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold text-white truncate">{c.name}</div>
                    <div className="text-[11px] text-slate-400">{c.industry}</div>
                  </div>
                  <Badge tone="muted">{c.sizeBand}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <KV icon={<Globe2 size={13} />} label="Country" value={c.country} />
                  <KV icon={<UsersIcon size={13} />} label="Employees" value={c.employees.toLocaleString('en-GB')} />
                  <KV icon={<Wallet size={13} />} label="Revenue band" value={c.revenueBand} />
                  <KV icon={<Building2 size={13} />} label="Engagements" value={clientEngagements.length.toString()} />
                </div>

                <div className="mt-4 pt-4 border-t border-navy-700/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Recent assessments</div>
                  <div className="flex flex-wrap gap-1.5">
                    {clientEngagements.slice(0, 4).map((eng) => (
                      <Badge key={eng.id} tone={eng.status === 'Signed Off' ? 'ok' : 'accent'}>
                        {eng.framework === 'NIST_CSF_2_0' ? 'NIST' : eng.framework === 'CIS_V8_1_2' ? 'CIS' : 'CAF'} · {eng.year}
                      </Badge>
                    ))}
                    {clientEngagements.length === 0 && <span className="text-[11px] text-slate-500">No engagements yet</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KV({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
        {icon} {label}
      </div>
      <div className="text-sm text-slate-100 font-medium truncate">{value}</div>
    </div>
  );
}
