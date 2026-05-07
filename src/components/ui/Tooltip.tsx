import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Tooltip({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    <span className={cn('group relative inline-flex', className)}>
      {children}
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-9 z-50 whitespace-nowrap rounded-md border border-navy-700 bg-navy-900 px-2 py-1 text-[11px] text-slate-200 opacity-0 shadow-panel transition group-hover:opacity-100">
        {label}
      </span>
    </span>
  );
}
