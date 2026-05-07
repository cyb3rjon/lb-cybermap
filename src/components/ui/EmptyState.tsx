import { ReactNode } from 'react';

export function EmptyState({
  icon, title, body, action,
}: { icon?: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      {icon && <div className="text-accent-400/70 mb-3">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      {body && <p className="text-sm text-slate-400 mt-1.5 max-w-sm">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
