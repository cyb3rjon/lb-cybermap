import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';

const PALETTE = ['#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#22D3EE'];

export default function NewClient() {
  const nav = useNavigate();
  const createClient = useStore((s) => s.createClient);

  const [form, setForm] = useState({
    name: '',
    industry: 'Financial Services',
    country: 'United Kingdom',
    region: 'EMEA',
    sizeBand: 'Mid-market' as 'Small' | 'Mid-market' | 'Large' | 'Enterprise',
    revenueBand: '£100–250m',
    employees: 1000,
    logoColour: '#3B82F6',
    markets: '',
    linesOfBusiness: '',
    regulatoryRegimes: '',
    criticalProcesses: '',
    dataClassifications: 'Public, Internal, Confidential',
    businessNotes: '',
    cloudProviders: 'AWS',
    identityProviders: 'Microsoft Entra ID',
    keyPlatforms: '',
    workstations: 1000,
    servers: 100,
    mobile: 500,
    internetFacingAssets: 25,
    saasApps: 50,
    ot: false,
    techNotes: '',
  });

  const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  function submit() {
    if (!form.name.trim()) return;
    const id = createClient({
      name: form.name,
      industry: form.industry,
      country: form.country,
      region: form.region,
      sizeBand: form.sizeBand,
      revenueBand: form.revenueBand,
      employees: form.employees,
      logoColour: form.logoColour,
      businessFootprint: {
        markets: list(form.markets),
        linesOfBusiness: list(form.linesOfBusiness),
        regulatoryRegimes: list(form.regulatoryRegimes),
        criticalProcesses: list(form.criticalProcesses),
        dataClassifications: list(form.dataClassifications),
        notes: form.businessNotes.trim() || undefined,
      },
      techFootprint: {
        cloudProviders: list(form.cloudProviders),
        identityProviders: list(form.identityProviders),
        keyPlatforms: list(form.keyPlatforms),
        endpointEstate: { workstations: form.workstations, servers: form.servers, mobile: form.mobile },
        internetFacingAssets: form.internetFacingAssets,
        saasApps: form.saasApps,
        ot: form.ot,
        notes: form.techNotes.trim() || undefined,
      },
    });
    nav('/clients', { state: { created: id } });
  }

  return (
    <div>
      <PageHeader
        eyebrow="New client"
        title="Add a new client to the workspace"
        description="Capture the client profile here so any future engagement inherits an accurate business and technology footprint."
        actions={
          <>
            <Button variant="ghost" iconLeft={<ArrowLeft size={14} />} onClick={() => nav('/clients')}>Back</Button>
            <Button onClick={submit} iconLeft={<Save size={14} />}>Save client</Button>
          </>
        }
      />

      <div className="px-6 lg:px-8 py-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 max-w-7xl">
        <div className="space-y-5">
          <Card elevated>
            <CardHeader icon={<Building2 size={16} />} title="Profile" subtitle="Identity, industry, scale" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Client name" placeholder="e.g. Northwind Industries plc" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Select label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
                options={['Financial Services','Energy & Utilities','Healthcare','Retail','Transport & Logistics','Manufacturing','Technology','Public Sector','Telecommunications','Defence','Pharmaceuticals','Education','Insurance'].map((x) => ({ value: x, label: x }))} />
              <Select label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                options={['United Kingdom','Republic of Ireland','Germany','France','Netherlands','Spain','Italy','United States','Singapore','Other'].map((x) => ({ value: x, label: x }))} />
              <Select label="Region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                options={['EMEA','Americas','APAC','LatAm'].map((x) => ({ value: x, label: x }))} />
              <Select label="Size band" value={form.sizeBand} onChange={(e) => setForm({ ...form, sizeBand: e.target.value as any })}
                options={['Small','Mid-market','Large','Enterprise'].map((x) => ({ value: x, label: x }))} />
              <Input label="Revenue band" value={form.revenueBand} onChange={(e) => setForm({ ...form, revenueBand: e.target.value })} placeholder="£100–250m" />
              <Input label="Employees" type="number" value={form.employees} onChange={(e) => setForm({ ...form, employees: Number(e.target.value) })} />
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">Logo colour</label>
                <div className="flex items-center gap-1.5">
                  {PALETTE.map((c) => (
                    <button key={c} onClick={() => setForm({ ...form, logoColour: c })}
                      className={`h-8 w-8 rounded-md ring-2 transition ${form.logoColour === c ? 'ring-white' : 'ring-transparent'}`}
                      style={{ background: `linear-gradient(135deg, ${c}, ${c}aa)` }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card elevated>
            <CardHeader title="Business footprint" subtitle="Comma-separated lists" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Markets" value={form.markets} onChange={(e) => setForm({ ...form, markets: e.target.value })} placeholder="United Kingdom, Ireland, Germany" />
              <Input label="Lines of business" value={form.linesOfBusiness} onChange={(e) => setForm({ ...form, linesOfBusiness: e.target.value })} placeholder="Retail, Wholesale, Investment" />
              <Input label="Regulatory regimes" value={form.regulatoryRegimes} onChange={(e) => setForm({ ...form, regulatoryRegimes: e.target.value })} placeholder="FCA, GDPR, PCI DSS" />
              <Input label="Critical processes" value={form.criticalProcesses} onChange={(e) => setForm({ ...form, criticalProcesses: e.target.value })} placeholder="Payments, Onboarding, Settlement" />
              <Input label="Data classifications" value={form.dataClassifications} onChange={(e) => setForm({ ...form, dataClassifications: e.target.value })} className="md:col-span-2" />
              <div className="md:col-span-2">
                <Textarea
                  label="Business footprint notes"
                  rows={4}
                  value={form.businessNotes}
                  onChange={(e) => setForm({ ...form, businessNotes: e.target.value })}
                  placeholder="Free text — anything else that helps describe the business: M&A activity, joint ventures, recent organisational change, sensitivities, internal terminology, etc."
                />
              </div>
            </div>
          </Card>

          <Card elevated>
            <CardHeader title="Technology footprint" subtitle="Cloud, identity, scale" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Cloud providers" value={form.cloudProviders} onChange={(e) => setForm({ ...form, cloudProviders: e.target.value })} />
              <Input label="Identity providers" value={form.identityProviders} onChange={(e) => setForm({ ...form, identityProviders: e.target.value })} />
              <Input label="Key platforms" value={form.keyPlatforms} onChange={(e) => setForm({ ...form, keyPlatforms: e.target.value })} placeholder="ServiceNow, Splunk, CrowdStrike" className="md:col-span-2" />
              <Input label="Workstations" type="number" value={form.workstations} onChange={(e) => setForm({ ...form, workstations: Number(e.target.value) })} />
              <Input label="Servers" type="number" value={form.servers} onChange={(e) => setForm({ ...form, servers: Number(e.target.value) })} />
              <Input label="Mobile devices" type="number" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: Number(e.target.value) })} />
              <Input label="Internet-facing assets" type="number" value={form.internetFacingAssets} onChange={(e) => setForm({ ...form, internetFacingAssets: Number(e.target.value) })} />
              <Input label="SaaS applications" type="number" value={form.saasApps} onChange={(e) => setForm({ ...form, saasApps: Number(e.target.value) })} />
              <Select label="Operational technology in scope" value={form.ot ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, ot: e.target.value === 'yes' })}
                options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
              <div className="md:col-span-2">
                <Textarea
                  label="Technology footprint notes"
                  rows={4}
                  value={form.techNotes}
                  onChange={(e) => setForm({ ...form, techNotes: e.target.value })}
                  placeholder="Free text — additional context on the estate: legacy platforms, planned migrations, segmentation patterns, known constraints, regulatory accreditations of the stack, etc."
                />
              </div>
            </div>
          </Card>
        </div>

        <Card elevated className="h-fit sticky top-4">
          <CardHeader title="Live preview" subtitle="How this client appears in the directory" />
          <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-semibold text-base shadow-glow shrink-0"
                style={{ background: `linear-gradient(135deg, ${form.logoColour}, ${form.logoColour}aa)` }}>
                {(form.name || 'NC').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-white truncate">{form.name || 'New client'}</div>
                <div className="text-[11px] text-slate-400">{form.industry} · {form.country}</div>
              </div>
              <Badge tone="muted">{form.sizeBand}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <KV label="Employees">{form.employees.toLocaleString('en-GB')}</KV>
              <KV label="Revenue">{form.revenueBand}</KV>
              <KV label="OT">{form.ot ? 'Yes' : 'No'}</KV>
              <KV label="SaaS apps">{form.saasApps}</KV>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={submit} iconLeft={<Save size={14} />}>Save client</Button>
            <Button variant="ghost" onClick={() => nav('/clients')}>Cancel</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-slate-100 font-medium">{children}</div>
    </div>
  );
}
