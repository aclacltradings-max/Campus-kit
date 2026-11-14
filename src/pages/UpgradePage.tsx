import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Crown,
  Info,
  Lock,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { BillingCycle, PlanId } from '@/types';

type PaidPlanId = 'premium' | 'elite';
import { PLANS, formatPrice, getPlan, yearlySavingPercent } from '@/lib/plans';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { SectionCard } from '@/components/common/SectionCard';
import { beginCheckout, getPaymentConfig, providerLabel } from '@/lib/payments';
import { cn } from '@/lib/cn';

export function UpgradePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { subscription, upgradeTo, settings } = useWorkspace();
  const config = getPaymentConfig();

  const initialPlan = (params.get('plan') as PlanId | null) ?? (subscription.planId === 'free' ? 'premium' : subscription.planId);
  const [selected, setSelected] = useState<PaidPlanId>(initialPlan === 'elite' ? 'elite' : 'premium');
  const [cycle, setCycle] = useState<BillingCycle>((params.get('cycle') as BillingCycle | null) ?? 'monthly');
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState(settings.email);

  useEffect(() => {
    const planParam = params.get('plan') as PlanId | null;
    if (planParam === 'premium' || planParam === 'elite') setSelected(planParam);
  }, [params]);

  const plan = getPlan(selected);
  const price = cycle === 'yearly' ? plan.yearly : plan.monthly;
  const saving = yearlySavingPercent(plan);

  const handleUpgrade = async () => {
    if (!email.trim()) {
      toast.error('Email required', 'Add an email so a receipt can be issued.');
      return;
    }
    setProcessing(true);
    try {
      const result = await beginCheckout({
        planId: selected,
        billingCycle: cycle,
        amount: price[config.currency],
        email: email.trim(),
      });

      if (!result.ok) {
        toast.info('Payment provider not connected', result.message);
        // Activate locally so the entitlement architecture can be exercised.
        upgradeTo(selected, cycle, null, null);
        return;
      }

      toast.success('Checkout prepared', result.message);
      upgradeTo(selected, cycle, config.provider, result.reference);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-[0.8rem] font-medium ck-muted transition-colors hover:text-gold-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="animate-fade-up">
          <p className="ck-eyebrow">Upgrade</p>
          <h1 className="mt-2 font-display text-[2rem] font-semibold leading-tight tracking-tight text-[rgb(var(--ck-text))]">
            Unlock the full <span className="ck-gold-text">CampusKit</span> experience
          </h1>
          <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed ck-muted">
            Recurring tasks, reminders, subtasks, bulk actions, advanced analytics and the light theme.
            Upgrade in a moment and keep everything on this device.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { icon: Zap, title: 'Unlimited tasks', body: 'No ceilings on what you can plan.' },
              { icon: Sparkles, title: 'Smart reminders', body: 'Alerts before every deadline.' },
              { icon: ShieldCheck, title: 'Recurring tasks', body: 'Daily, weekly and monthly rhythms.' },
              { icon: Crown, title: 'Advanced analytics', body: 'Trends, categories and patterns.' },
            ].map((item, index) => (
              <div key={item.title} className="ck-card p-4 animate-fade-up" style={{ animationDelay: index * 60 + 'ms' }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10 text-gold-300">
                  <item.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-[0.9rem] font-semibold text-[rgb(var(--ck-text))]">{item.title}</h3>
                <p className="mt-1 text-[0.76rem] ck-muted">{item.body}</p>
              </div>
            ))}
          </div>

          <SectionCard className="mt-5" title="What you keep" subtitle="Your data never leaves this device">
            <ul className="space-y-2.5">
              {[
                'All existing tasks, categories and settings stay exactly as they are.',
                'Nothing is uploaded. Exports are generated in your browser.',
                'Cancel any time. You keep access until the end of the period.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[0.82rem] text-[rgb(var(--ck-text-muted))]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {line}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="animate-fade-up">
          <div className="sticky top-24">
            <div className="ck-card overflow-hidden p-0">
              <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
              <div className="p-5">
                <h2 className="font-display text-[1.15rem] font-semibold text-[rgb(var(--ck-text))]">
                  Select your plan
                </h2>

                <div className="mt-4 flex justify-center">
                  <Segmented
                    value={cycle}
                    onChange={(v) => setCycle(v as BillingCycle)}
                    options={[
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                    ]}
                  />
                </div>

                <div className="mt-4 space-y-2.5">
                  {PLANS.filter((p) => p.id !== 'free').map((option) => {
                    const optionPrice = cycle === 'yearly' ? option.yearly[config.currency] : option.monthly[config.currency];
                    const active = selected === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelected(option.id === 'elite' ? 'elite' : 'premium')}
                        className={cn(
                          'flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all',
                          active
                            ? 'border-gold-500/55 bg-gold-500/8 shadow-glow'
                            : 'border-[rgb(var(--ck-border)/0.12)] hover:border-gold-500/35',
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border-2',
                              active ? 'border-gold-500 bg-gold-500' : 'border-[rgb(var(--ck-border)/0.3)]',
                            )}
                          >
                            {active && <Check className="h-3 w-3 text-ink-950" strokeWidth={3.5} />}
                          </span>
                          <span>
                            <span className="flex items-center gap-2 text-[0.9rem] font-semibold text-[rgb(var(--ck-text))]">
                              {option.name}
                              {option.badge && (
                                <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-gold-300">
                                  {option.badge}
                                </span>
                              )}
                            </span>
                            <span className="text-[0.72rem] ck-muted">{option.tagline}</span>
                          </span>
                        </span>
                        <span className="text-right">
                          <span className="block font-display text-[1rem] font-semibold text-[rgb(var(--ck-text))]">
                            {formatPrice(optionPrice, config.currency)}
                          </span>
                          {cycle === 'yearly' && yearlySavingPercent(option) > 0 && (
                            <span className="text-[0.66rem] font-semibold text-emerald-400">
                              save {yearlySavingPercent(option)}%
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-2xl border border-[rgb(var(--ck-border)/0.1)] bg-[rgb(var(--ck-border)/0.03)] p-4">
                  <div className="flex items-center justify-between text-[0.82rem]">
                    <span className="ck-muted">Total today</span>
                    <span className="font-display text-[1.3rem] font-semibold text-[rgb(var(--ck-text))]">
                      {formatPrice(price[config.currency], config.currency)}
                    </span>
                  </div>
                  {cycle === 'yearly' && saving > 0 && (
                    <p className="mt-1 text-right text-[0.7rem] font-semibold text-emerald-400">
                      You save {saving}% versus monthly
                    </p>
                  )}

                  <label className="mt-4 block">
                    <span className="ck-label">Receipt email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="ck-input"
                    />
                  </label>

                  <Button
                    variant="gold"
                    fullWidth
                    className="mt-4"
                    loading={processing}
                    icon={processing ? undefined : <Crown className="h-4 w-4" />}
                    onClick={handleUpgrade}
                  >
                    {processing ? 'Preparing checkout' : 'Upgrade to ' + plan.name}
                  </Button>

                  <div className="mt-3 flex items-start gap-2 text-[0.7rem] ck-faint">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {config.configured
                        ? 'Secure checkout through ' + providerLabel(config.provider) + '.'
                        : 'No payment provider is connected yet. A key for Paystack or Stripe activates live checkout.'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-[0.7rem] ck-faint">
                  <Lock className="h-3.5 w-3.5" />
                  No card details are stored by CampusKit.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="mt-3 w-full text-center text-[0.76rem] font-medium text-gold-300 hover:underline"
            >
              Compare all plans in detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
