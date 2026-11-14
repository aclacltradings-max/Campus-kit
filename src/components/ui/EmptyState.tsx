import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[rgb(var(--ck-border)/0.14)] px-6 py-14 text-center',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 ck-grid-bg opacity-40" />
      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/8 text-gold-300 animate-float">
          {icon}
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-[rgb(var(--ck-text))]">{title}</h3>
        {description && (
          <p className="mx-auto mt-2 max-w-md text-[0.85rem] leading-relaxed ck-muted">{description}</p>
        )}
        {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
