import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  hint?: string;
  tone?: 'gold' | 'success' | 'danger' | 'neutral' | 'warning';
  trend?: { value: string; positive?: boolean };
  delay?: number;
}

const TONES = {
  gold: 'border-gold-500/25 bg-gold-500/8 text-gold-300',
  success: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-400',
  danger: 'border-rose-500/25 bg-rose-500/8 text-rose-400',
  warning: 'border-amber-500/25 bg-amber-500/8 text-amber-400',
  neutral: 'border-[rgb(var(--ck-border)/0.14)] bg-[rgb(var(--ck-border)/0.04)] text-[rgb(var(--ck-text-muted))]',
} as const;

export function StatCard({ label, value, icon, hint, tone = 'gold', trend, delay = 0 }: StatCardProps) {
  return (
    <div
      className="ck-card ck-card-hover animate-fade-up overflow-hidden p-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] ck-faint">{label}</p>
          <p className="mt-2 font-display text-[1.7rem] font-semibold leading-none text-[rgb(var(--ck-text))]">
            {value}
          </p>
          {hint && <p className="mt-2 text-[0.72rem] ck-muted">{hint}</p>}
        </div>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border', TONES[tone])}>
          {icon}
        </span>
      </div>
      {trend && (
        <p
          className={cn(
            'mt-3 text-[0.72rem] font-medium',
            trend.positive ? 'text-emerald-400' : 'text-rose-400',
          )}
        >
          {trend.value}
        </p>
      )}
    </div>
  );
}
