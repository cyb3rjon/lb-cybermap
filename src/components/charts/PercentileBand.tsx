interface Datum { axis: string; current: number; benchmark: number; topQuartile: number; bottomQuartile: number }

export function PercentileBand({ data }: { data: Datum[] }) {
  return (
    <div className="space-y-3">
      {data.map((b) => {
        const gap = +(b.current - b.benchmark).toFixed(2);
        const gapPositive = gap >= 0;
        return (
          <div key={b.axis} className="grid grid-cols-[64px_1fr_120px] items-center gap-3">
            <div className="font-mono text-xs text-slate-300">{b.axis}</div>
            <div className="relative h-8 rounded-lg bg-navy-900/40 border border-navy-700/40 overflow-hidden">
              <div className="absolute top-1 bottom-1 rounded-md bg-accent-500/20 border border-accent-500/30"
                style={{ left: `${(b.bottomQuartile / 5) * 100}%`, width: `${((b.topQuartile - b.bottomQuartile) / 5) * 100}%` }} />
              <div className="absolute top-0 bottom-0 w-[2px] bg-accent-400" style={{ left: `${(b.benchmark / 5) * 100}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-cyan-400 ring-2 ring-navy-900 shadow-glow-cyan flex items-center justify-center text-[10px] font-bold text-navy-900"
                style={{ left: `calc(${(b.current / 5) * 100}% - 10px)` }}>
                {b.current.toFixed(1)}
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="text-slate-400 font-mono">avg {b.benchmark.toFixed(1)}</div>
              <div className={`font-mono ${gapPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {gapPositive ? '+' : ''}{gap.toFixed(1)} vs avg
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
