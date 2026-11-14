import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'gold' | 'ghost' | 'quiet' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const VARIANTS: Record<Variant, string> = {
  gold: 'ck-btn-gold',
  ghost: 'ck-btn-ghost',
  quiet: 'ck-btn-quiet',
  danger: 'ck-btn-danger',
  outline: 'ck-btn border border-[rgb(var(--ck-border)/0.16)] hover:border-gold-500/50 hover:text-gold-300',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[0.8rem]',
  md: 'h-10 px-4',
  lg: 'h-12 px-6 text-[0.95rem]',
  icon: 'h-9 w-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'ghost',
    size = 'md',
    loading = false,
    icon,
    iconRight,
    fullWidth,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
      {iconRight}
    </button>
  );
});
