import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn('ck-card animate-fade-up', padded && 'p-5', className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="font-display text-[1.05rem] font-semibold text-[rgb(var(--ck-text))]">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-1 text-[0.78rem] ck-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
