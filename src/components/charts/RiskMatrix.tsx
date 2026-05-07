import { cn } from '@/lib/cn';

interface Risk { id: string; title: string; impact: number; likelihood: number }

export function RiskMatrix({ risks }: { risks: Risk[] }) {
  // 5x5 grid; row 5 (top) is highest impact
  const cellRisks: Record<string, Risk[]> = {};
  for (const r of risks) {
    const key = `${r.likelihood}-${r.impact}`;
    (cellRisks[key] ||= []).push(r);
  }

  const cellTone = (l: number, i: number) => {
    const score = l * i;
    if (score >= 16) return 'bg-red-500/30 border-red-500/50';
    if (score >= 9) return 'bg-orange-500/25 border-orange-500/40';
    if (score >= 4) return 'bg-amber-500/20 border-amber-500/35';
    return 'bg-emerald-500/15 border-emerald-500/30';
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-end justify-around pr-2 text-[10px] uppercase tracking-wider text-slate-500" style={{ minHeight: 240 }}>
        <div>Severe</div>
        <div>Major</div>
        <div>Moderate</div>
        <div>Minor</div>
        <div>Negligible</div>
      </div>
      <div className="flex-1">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {[5, 4, 3, 2, 1].map((impact) =>
            [1, 2, 3, 4, 5].map((likelihood) => {
              const list = cellRisks[`${likelihood}-${impact}`] || [];
              return (
                <div
                  key={`${impact}-${likelihood}`}
                  className={cn(
                    'aspect-[1.6/1] rounded-md border relative p-1.5',
                    cellTone(likelihood, impact),
                  )}
                >
                  {list.length > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-navy-900 border border-navy-700 text-[10px] font-mono text-white px-1">
                      {list.length}
                    </span>
                  )}
                  <span className="text-[9px] text-white/40 font-mono">{likelihood * impact}</span>
                </div>
              );
            }),
          )}
        </div>
        <div className="grid mt-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost certain'].map((l) => (
            <div key={l} className="text-[10px] uppercase tracking-wider text-slate-500 text-center">{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
