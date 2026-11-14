import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export function Card({ hover, padded = true, className, children, ...rest }: CardProps) {
  return (
    <div className={cn('ck-card', hover && 'ck-card-hover', padded && 'p-5', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10 text-gold-300">
            {icon}
          </span>
        )}
        <div>
          <h3 className="font-display text-[1.02rem] font-semibold leading-tight text-[rgb(var(--ck-text))]">
            {title}
          </h3>
          {subtitle && <p className="mt-1 text-[0.8rem] ck-muted">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
