import { cmmiMeta } from '@/components/ui/StatusDot';
import type { CMMIScore } from '@/types';
import { cn } from '@/lib/cn';

interface Cell { code: string; title: string; current: CMMIScore; target?: CMMIScore }
interface Row { groupCode: string; groupName: string; cells: Cell[] }

export function MaturityHeatmap({ rows, onCellClick }: { rows: Row[]; onCellClick?: (groupCode: string, code: string) => void }) {
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.groupCode} className="flex items-start gap-3">
          <div className="w-44 shrink-0 pt-1">
            <div className="font-mono text-[10px] text-slate-500">{r.groupCode}</div>
            <div className="text-xs font-medium text-slate-200 truncate" title={r.groupName}>{r.groupName}</div>
          </div>
          <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(8, r.cells.length)}, minmax(0, 1fr))` }}>
            {r.cells.map((c) => {
              const colour = cmmiMeta[c.current].colour;
              const opacity = 0.18 + (c.current / 5) * 0.65;
              return (
                <button
                  key={c.code}
                  onClick={() => onCellClick?.(r.groupCode, c.code)}
                  title={`${c.code} — ${c.title}\nCurrent: ${c.current} ${cmmiMeta[c.current].label}${c.target !== undefined ? `\nTarget: ${c.target}` : ''}`}
                  className={cn(
                    'group relative h-9 rounded-md border border-navy-700/60 transition hover:border-accent-500/60 hover:scale-[1.04]',
                  )}
                  style={{ background: `linear-gradient(135deg, ${colour}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, ${colour}33)` }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/80 group-hover:text-white">
                    {c.code}
                  </span>
                  {c.target !== undefined && c.target > c.current && (
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 ring-1 ring-navy-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-700/40">
        <div className="flex items-center gap-3">
          {([0,1,2,3,4,5] as CMMIScore[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ background: cmmiMeta[s].colour }} />
              <span className="text-[10px] text-slate-400">{s} {cmmiMeta[s].label}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-slate-500 inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          target uplift
        </div>
      </div>
    </div>
  );
}
