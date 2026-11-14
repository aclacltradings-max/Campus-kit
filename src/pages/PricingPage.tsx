import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Crown, Sparkles, X } from 'lucide-react';
import type { BillingCycle } from '@/types';
import { PLANS } from '@/lib/plans';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { PlanCard } from '@/components/common/PlanCard';
import { getPaymentConfig, providerLabel } from '@/lib/payments';

const COMPARISON: Array<{ feature: string; free: string | boolean; premium: string | boolean; elite: string | boolean }> = [
  { feature: 'Active tasks', free: '40', premium: 'Unlimited', elite: 'Unlimited' },
  { feature: 'Categories', free: '3', premium: '20', elite: 'Unlimited' },
  { feature: 'Dashboard & smart search', free: true, premium: true, elite: true },
  { feature: 'Calendar views', free: 'Day', premium: 'Day, week, month', elite: 'Day, week, month' },
  { feature: 'Recurring tasks', free: false, premium: true, elite: true },
  { feature: 'Smart reminders', free: false, premium: true, elite: true },
  { feature: 'Subtasks', free: false, premium: true, elite: true },
  { feature: 'Bulk actions', free: false, premium: true, elite: true },
  { feature: 'Advanced analytics', free: false, premium: true, elite: true },
  { feature: 'Light theme', free: false, premium: true, elite: true },
  { feature: 'Export formats', free: 'JSON', premium: 'JSON, CSV, Markdown', elite: 'JSON, CSV, Markdown' },
  { feature: 'Priority support', free: false, premium: false, elite: true },
];

export function PricingPage() {
  const { subscription } = useWorkspace();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const config = getPaymentConfig();

  return (
    <div className="relative min-h-dvh bg-[rgb(var(--ck-bg))]">
      <div className="pointer-events-none fixed inset-0 ck-grid-bg opacity-[0.35]" />
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-gold-500/[0.08] blur-[130px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-3">
          <Logo subtitle="Pricing" />
        </button>
        <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center animate-fade-up">
          <p className="ck-eyebrow">Premium plans</p>
          <h1 className="mt-2 font-display text-[2.2rem] font-semibold leading-tight tracking-tight text-[rgb(var(--ck-text))] sm:text-[2.8rem]">
            Choose the plan that <span className="ck-gold-text">fits your ambition</span>
          </h1>
          <p className="mt-3 text-[0.92rem] leading-relaxed ck-muted">
            Start free and stay free, or unlock recurring tasks, reminders, subtasks, advanced analytics
            and the light theme.
          </p>
          <div className="mt-6 flex justify-center">
            <Segmented
              value={cycle}
              onChange={(v) => setCycle(v as BillingCycle)}
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly · save 20%' },
              ]}
            />
          </div>
          <p className="mt-3 text-[0.72rem] ck-faint">
            {config.configured
              ? 'Checkout is ready with ' + providerLabel(config.provider) + '.'
              : 'Checkout activates once a Paystack or Stripe key is added.'}
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <div key={plan.id} className="animate-fade-up" style={{ animationDelay: index * 70 + 'ms' }}>
              <PlanCard
                plan={plan}
                cycle={cycle}
                currency={config.currency}
                current={subscription.planId === plan.id}
                onSelect={() => navigate('/app/upgrade?plan=' + plan.id + '&cycle=' + cycle)}
              />
            </div>
          ))}
        </div>

        <section className="mt-14 animate-fade-up">
          <h2 className="text-center font-display text-[1.5rem] font-semibold text-[rgb(var(--ck-text))]">
            Compare every capability
          </h2>
          <div className="ck-card mt-6 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left">
                <thead>
                  <tr className="border-b border-[rgb(var(--ck-border)/0.08)]">
                    <th className="px-4 py-3.5 text-[0.72rem] font-semibold uppercase tracking-wide ck-faint">
                      Feature
                    </th>
                    {PLANS.map((plan) => (
                      <th
                        key={plan.id}
                        className="px-4 py-3.5 text-center text-[0.78rem] font-semibold text-[rgb(var(--ck-text))]"
                      >
                        {plan.name}
                        {plan.highlight && <Crown className="ml-1.5 inline h-3.5 w-3.5 text-gold-400" />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="border-b border-[rgb(var(--ck-border)/0.05)] last:border-0">
                      <td className="px-4 py-3 text-[0.8rem] text-[rgb(var(--ck-text-muted))]">{row.feature}</td>
                      {[row.free, row.premium, row.elite].map((value, i) => (
                        <td key={i} className="px-4 py-3 text-center text-[0.8rem]">
                          {value === true ? (
                            <Check className="mx-auto h-4 w-4 text-emerald-400" />
                          ) : value === false ? (
                            <X className="mx-auto h-4 w-4 text-[rgb(var(--ck-text-faint))]" />
                          ) : (
                            <span className="text-[rgb(var(--ck-text))]">{value}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Built for everyone',
              body: 'Students, freelancers and teams all get the same clean, fast workspace with no clutter.',
            },
            {
              title: 'Your data stays yours',
              body: 'Everything is stored locally on your device. Export it any time in three formats.',
            },
            {
              title: 'Ready for payments',
              body: 'A provider-agnostic checkout layer means adding Paystack or Stripe is a configuration step.',
            },
          ].map((item, index) => (
            <div key={item.title} className="ck-card p-5 animate-fade-up" style={{ animationDelay: index * 70 + 'ms' }}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10 text-gold-300">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="mt-3 font-display text-[1rem] font-semibold text-[rgb(var(--ck-text))]">{item.title}</h3>
              <p className="mt-1.5 text-[0.8rem] leading-relaxed ck-muted">{item.body}</p>
            </div>
          ))}
        </section>

        <div className="mt-14 flex flex-col items-center gap-3 text-center">
          <p className="text-[0.8rem] ck-muted">Ready to organise everything in one elegant place?</p>
          <Button variant="gold" size="lg" onClick={() => navigate('/app')}>
            Enter the workspace
          </Button>
        </div>
      </main>
    </div>
  );
}
