import { ReactNode } from 'react';

export function PageHeader({
  title, eyebrow, description, actions, meta,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="px-6 lg:px-8 pt-6 pb-5 border-b border-navy-700/40">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          {eyebrow && <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-400 mb-1.5">{eyebrow}</div>}
          <h1 className="text-2xl lg:text-[26px] font-bold tracking-tight text-white">{title}</h1>
          {description && <p className="text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">{description}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
