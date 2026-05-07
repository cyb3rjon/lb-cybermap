import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ elevated, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(elevated ? 'panel-elevated' : 'panel', 'p-5', className)}
      {...rest}
    />
  );
}

export function CardHeader({
  title, subtitle, actions, icon, className,
}: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex items-start gap-3">
        {icon && <div className="text-accent-400 mt-0.5">{icon}</div>}
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function CardSection({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('border-t border-navy-700/60 pt-4 mt-4', className)}>{children}</div>;
}
