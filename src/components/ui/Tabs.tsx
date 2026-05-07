import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Tabs({
  tabs, value, onChange, className,
}: {
  tabs: { value: string; label: ReactNode; count?: number; icon?: ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-navy-700/60', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active ? 'text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className={cn(
                'ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                active ? 'bg-accent-500/20 text-accent-300' : 'bg-navy-700/50 text-slate-400',
              )}>
                {t.count}
              </span>
            )}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-gradient" />
            )}
          </button>
        );
      })}
    </div>
  );
}
