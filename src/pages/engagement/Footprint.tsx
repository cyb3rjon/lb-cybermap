import { useParams } from 'react-router-dom';
import { Building2, Cloud, Database, MapPin, Shield, Smartphone } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function Footprint() {
  const { engagementId = '' } = useParams();
  const eng = useStore((s) => s.getEngagement(engagementId));
  const client = useStore((s) => eng && s.getClient(eng.clientId));
  if (!eng || !client) return null;

  const bf = client.businessFootprint;
  const tf = client.techFootprint;

  return (
    <div className="px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card elevated>
        <CardHeader icon={<Building2 size={16} />} title="Business footprint" subtitle="Captured during kick-off; appears in the report." />
        <Section icon={<MapPin size={13} />} label="Markets">
          <Pills items={bf.markets} tone="accent" />
        </Section>
        <Section icon={<Building2 size={13} />} label="Lines of business">
          <Pills items={bf.linesOfBusiness} tone="cyan" />
        </Section>
        <Section icon={<Shield size={13} />} label="Regulatory regimes">
          <Pills items={bf.regulatoryRegimes} tone="warn" />
        </Section>
        <Section icon={<Database size={13} />} label="Critical processes">
          <Pills items={bf.criticalProcesses} tone="info" />
        </Section>
        <Section icon={<Database size={13} />} label="Data classifications">
          <Pills items={bf.dataClassifications} tone="muted" />
        </Section>
      </Card>

      <Card elevated>
        <CardHeader icon={<Cloud size={16} />} title="Technology footprint" subtitle="Estate scale and key platforms." />
        <Section icon={<Cloud size={13} />} label="Cloud providers"><Pills items={tf.cloudProviders} tone="accent" /></Section>
        <Section icon={<Shield size={13} />} label="Identity providers"><Pills items={tf.identityProviders} tone="cyan" /></Section>
        <Section icon={<Database size={13} />} label="Key platforms"><Pills items={tf.keyPlatforms} tone="info" /></Section>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Workstations" value={tf.endpointEstate.workstations.toLocaleString('en-GB')} icon={<Smartphone size={13} />} />
          <Stat label="Servers" value={tf.endpointEstate.servers.toLocaleString('en-GB')} icon={<Database size={13} />} />
          <Stat label="Mobile" value={tf.endpointEstate.mobile.toLocaleString('en-GB')} icon={<Smartphone size={13} />} />
          <Stat label="Internet-facing" value={tf.internetFacingAssets.toString()} icon={<Cloud size={13} />} />
          <Stat label="SaaS apps" value={tf.saasApps.toString()} icon={<Cloud size={13} />} />
          <Stat label="OT in scope" value={tf.ot ? 'Yes' : 'No'} icon={<Building2 size={13} />} />
        </div>
      </Card>
    </div>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 mb-2">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

function Pills({ items, tone }: { items: string[]; tone: any }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => <Badge key={i} tone={tone}>{i}</Badge>)}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{icon}{label}</div>
      <div className="text-base font-semibold text-white font-mono">{value}</div>
    </div>
  );
}
