import { cn } from '@/lib/cn';

export function Avatar({
  initials, colour, size = 'md', className,
}: { initials: string; colour: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeMap = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-11 w-11 text-sm',
  };
  return (
    <div
      className={cn('inline-flex items-center justify-center rounded-full font-semibold text-white shadow-inner ring-2 ring-navy-900/80', sizeMap[size], className)}
      style={{ background: `linear-gradient(135deg, ${colour}, ${colour}aa)` }}
    >
      {initials}
    </div>
  );
}

export function AvatarStack({ items, max = 3 }: { items: { initials: string; colour: string; name: string }[]; max?: number }) {
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <div key={i} title={u.name}>
          <Avatar initials={u.initials} colour={u.colour} size="sm" />
        </div>
      ))}
      {overflow > 0 && (
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy-700 text-[10px] font-semibold text-slate-300 ring-2 ring-navy-900/80">
          +{overflow}
        </div>
      )}
    </div>
  );
}
