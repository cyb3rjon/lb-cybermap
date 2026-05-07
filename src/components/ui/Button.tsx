import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-accent-gradient text-white shadow-glow hover:shadow-glow-cyan disabled:opacity-50 disabled:shadow-none',
  secondary:
    'bg-navy-700 text-slate-100 border border-navy-600 hover:bg-navy-600',
  ghost:
    'text-slate-300 hover:text-white hover:bg-navy-700/60',
  outline:
    'border border-navy-600/70 text-slate-200 hover:border-accent-500/60 hover:text-white',
  danger:
    'bg-risk text-white hover:bg-red-500',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading, iconLeft, iconRight, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:ring-offset-0',
          'disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...rest}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  },
);
Button.displayName = 'Button';
