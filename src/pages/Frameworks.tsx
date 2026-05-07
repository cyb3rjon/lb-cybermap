import { useState } from 'react';
import { Database, Layers } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { listFrameworks } from '@/data/frameworks';
import { Tabs } from '@/components/ui/Tabs';
import type { FrameworkId } from '@/types';

export default function Frameworks() {
  const [active, setActive] = useState<FrameworkId>('NIST_CSF_2_0');
  const fw = listFrameworks().find((f) => f.id === active)!;
  const totalItems = fw.groups.reduce((acc, g) => acc + g.categories.reduce((a, c) => a + c.items.length, 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Frameworks"
        description="Reference content for the three supported frameworks. Items shown here are the canonical control set used by every assessment."
      />
      <div className="px-6 lg:px-8 py-6 space-y-5">
        <Tabs
          value={active}
          onChange={(v) => setActive(v as FrameworkId)}
          tabs={listFrameworks().map((f) => ({ value: f.id, label: f.shortName }))}
        />

        <Card elevated>
          <CardHeader
            icon={<Database size={16} />}
            title={`${fw.name} ${fw.version}`}
            subtitle={fw.description}
            actions={<><Badge tone="accent">{fw.groups.length} groups</Badge><Badge tone="cyan">{totalItems} items</Badge></>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {fw.groups.map((g) => (
              <div key={g.id} className="rounded-lg border border-navy-700/60 bg-navy-900/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] text-slate-500">{g.code}</div>
                    <div className="text-base font-semibold text-white">{g.name}</div>
                  </div>
                  <Layers className="text-accent-400" size={18} />
                </div>
                {g.description && <p className="text-xs text-slate-400 leading-relaxed mt-2">{g.description}</p>}
                <div className="mt-3 pt-3 border-t border-navy-700/50 space-y-1 max-h-44 overflow-y-auto">
                  {g.categories.flatMap((c) => c.items).slice(0, 8).map((it) => (
                    <div key={it.id} className="flex items-start gap-2 text-[12px]">
                      <span className="font-mono text-slate-500 shrink-0">{it.code}</span>
                      <span className="text-slate-300 truncate" title={it.title}>{it.title}</span>
                      {it.igTier && <span className="ml-auto text-[10px] text-cyan-400 font-mono">IG{it.igTier}</span>}
                    </div>
                  ))}
                  {g.categories.flatMap((c) => c.items).length > 8 && (
                    <div className="text-[10px] text-slate-500 pt-1">+{g.categories.flatMap((c) => c.items).length - 8} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
