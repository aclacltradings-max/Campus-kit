import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Badge({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'gold' | 'success' | 'danger' | 'warning';
}) {
  const tones = {
    neutral: 'border-[rgb(var(--ck-border)/0.14)] bg-[rgb(var(--ck-border)/0.05)] text-[rgb(var(--ck-text-muted))]',
    gold: 'border-gold-500/35 bg-gold-500/12 text-gold-300',
    success: 'border-emerald-500/35 bg-emerald-500/12 text-emerald-400',
    danger: 'border-rose-500/35 bg-rose-500/12 text-rose-400',
    warning: 'border-amber-500/35 bg-amber-500/12 text-amber-400',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ className }: { className?: string }) {
  return <span className={cn('h-1.5 w-1.5 rounded-full', className)} />;
}
