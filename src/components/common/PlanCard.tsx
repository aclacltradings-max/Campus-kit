import { Check, Crown, Sparkles } from 'lucide-react';
import type { BillingCycle } from '@/types';
import { formatPrice, planLimitLabel, yearlySavingPercent, type Plan } from '@/lib/plans';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface PlanCardProps {
  plan: Plan;
  cycle: BillingCycle;
  currency: 'NGN' | 'USD';
  current?: boolean;
  onSelect?: (planId: Plan['id']) => void;
  ctaLabel?: string;
  disabled?: boolean;
}

export function PlanCard({
  plan,
  cycle,
  currency,
  current,
  onSelect,
  ctaLabel,
  disabled,
}: PlanCardProps) {
  const price = cycle === 'yearly' ? plan.yearly[currency] : plan.monthly[currency];
  const saving = yearlySavingPercent(plan);

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl border p-5 transition-all duration-300 ease-premium',
        plan.highlight
          ? 'border-gold-500/45 bg-gradient-to-b from-gold-500/[0.1] to-transparent shadow-glow'
          : 'border-[rgb(var(--ck-border)/0.1)] ck-card',
        'hover:-translate-y-1',
      )}
    >
      {plan.badge && (
        <span
          className={cn(
            'absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-wide',
            plan.highlight
              ? 'bg-gradient-to-r from-gold-300 to-gold-600 text-ink-950'
              : 'border border-[rgb(var(--ck-border)/0.14)] text-[rgb(var(--ck-text-muted))]',
          )}
        >
          {plan.highlight ? <Sparkles className="h-3 w-3" /> : <Crown className="h-3 w-3" />}
          {plan.badge}
        </span>
      )}

      <h3 className="font-display text-[1.35rem] font-semibold text-[rgb(var(--ck-text))]">{plan.name}</h3>
      <p className="mt-1 min-h-[2.5rem] text-[0.82rem] leading-relaxed ck-muted">{plan.tagline}</p>

      <div className="mt-4 flex items-end gap-1.5">
        <span className="font-display text-[2.2rem] font-semibold leading-none text-[rgb(var(--ck-text))]">
          {formatPrice(price, currency)}
        </span>
        {price > 0 && (
          <span className="pb-1 text-[0.76rem] ck-muted">/{cycle === 'yearly' ? 'year' : 'month'}</span>
        )}
      </div>
      {cycle === 'yearly' && saving > 0 && (
        <p className="mt-1.5 text-[0.72rem] font-semibold text-emerald-400">Save {saving}% annually</p>
      )}

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[0.8rem] text-[rgb(var(--ck-text-muted))]">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                plan.highlight ? 'bg-gold-500/20 text-gold-300' : 'bg-emerald-500/15 text-emerald-400',
              )}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        {current ? (
          <Button variant="ghost" fullWidth disabled>
            Current plan
          </Button>
        ) : (
          <Button
            variant={plan.highlight ? 'gold' : 'ghost'}
            fullWidth
            disabled={disabled}
            onClick={() => onSelect?.(plan.id)}
          >
            {ctaLabel ?? (plan.id === 'free' ? 'Start free' : 'Choose ' + plan.name)}
          </Button>
        )}
      </div>

      <p className="mt-3 text-center text-[0.68rem] ck-faint">
        {plan.entitlements.maxActiveTasks === Infinity
          ? 'Unlimited tasks'
          : planLimitLabel(plan.entitlements.maxActiveTasks) + ' active tasks'}
      </p>
    </div>
  );
}
