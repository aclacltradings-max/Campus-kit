import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PLANS, STATUS_LABEL, planLimitLabel } from '@/lib/plans';
import { getPaymentConfig, providerLabel } from '@/lib/payments';
import { exportTasks } from '@/lib/export';
import { computeStats } from '@/lib/tasks';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/cn';

export function BillingPage() {
  const {
    subscription,
    plan,
    entitlements,
    tasks,
    categories,
    activeTaskCount,
    isPremium,
    cancelSubscription,
    resumeSubscription,
    settings,
  } = useWorkspace();
  const toast = useToast();
  const navigate = useNavigate();
  const config = getPaymentConfig();

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const usagePct =
    entitlements.maxActiveTasks === Infinity
      ? 0
      : Math.min(100, Math.round((activeTaskCount / entitlements.maxActiveTasks) * 100));

  const statusTone =
    subscription.status === 'active' || subscription.status === 'trialing'
      ? 'success'
      : subscription.status === 'past_due'
        ? 'warning'
        : 'neutral';

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Billing & Plan"
        description="Review your plan, usage and payment settings."
        actions={
          <Button
            variant="ghost"
            icon={<Download className="h-4 w-4" />}
            onClick={async () => {
              const message = await exportTasks(
                entitlements.exportFormats.includes('json') ? 'json' : 'json',
                tasks,
                categories,
                { total: stats.total, completed: stats.completed },
              );
              toast.success('Backup ready', message);
            }}
          >
            Backup data
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SectionCard
          title={plan.name + ' plan'}
          subtitle={plan.tagline}
          action={
            isPremium ? (
              <Crown className="h-5 w-5 text-gold-400" />
            ) : (
              <Sparkles className="h-5 w-5 text-gold-400" />
            )
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone}>{STATUS_LABEL[subscription.status]}</Badge>
            {subscription.cancelAtPeriodEnd && <Badge tone="warning">Cancels at period end</Badge>}
            {subscription.billingCycle === 'yearly' && <Badge tone="gold">Yearly</Badge>}
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <InfoRow
              icon={<CalendarClock className="h-4 w-4" />}
              label="Started"
              value={formatDate(subscription.startedAt, settings.dateFormat)}
            />
            <InfoRow
              icon={<CalendarClock className="h-4 w-4" />}
              label={subscription.cancelAtPeriodEnd ? 'Access ends' : 'Renews'}
              value={
                subscription.currentPeriodEnd
                  ? formatDate(subscription.currentPeriodEnd, settings.dateFormat)
                  : 'Not scheduled'
              }
            />
            <InfoRow
              icon={<CreditCard className="h-4 w-4" />}
              label="Provider"
              value={providerLabel(subscription.provider)}
            />
            <InfoRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Reference"
              value={subscription.reference ?? '—'}
            />
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            {isPremium ? (
              <>
                {subscription.cancelAtPeriodEnd ? (
                  <Button variant="gold" onClick={resumeSubscription}>
                    Resume subscription
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={cancelSubscription}>
                    Cancel at period end
                  </Button>
                )}
                <Button variant="ghost" onClick={() => navigate('/app/upgrade')}>
                  Change plan
                </Button>
              </>
            ) : (
              <Button variant="gold" icon={<Crown className="h-4 w-4" />} onClick={() => navigate('/app/upgrade')}>
                Upgrade to Premium
              </Button>
            )}
            <Link to="/pricing" className="ck-btn-quiet h-10 px-4">
              View all plans <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!config.configured && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
              <div>
                <p className="text-[0.82rem] font-semibold text-[rgb(var(--ck-text))]">
                  Payment provider not connected
                </p>
                <p className="mt-1 text-[0.76rem] leading-relaxed ck-muted">
                  Add <code className="rounded bg-[rgb(var(--ck-border)/0.08)] px-1 py-0.5 font-mono text-[0.7rem]">VITE_PAYSTACK_PUBLIC_KEY</code> or{' '}
                  <code className="rounded bg-[rgb(var(--ck-border)/0.08)] px-1 py-0.5 font-mono text-[0.7rem]">VITE_STRIPE_PUBLIC_KEY</code> to a{' '}
                  <code className="rounded bg-[rgb(var(--ck-border)/0.08)] px-1 py-0.5 font-mono text-[0.7rem]">.env</code> file and restart to enable live checkout. Until then, upgrades activate locally.
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Usage" subtitle="What you are using right now">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-[0.76rem]">
                  <span className="ck-muted">Active tasks</span>
                  <span className="font-semibold text-[rgb(var(--ck-text))]">
                    {activeTaskCount}
                    {entitlements.maxActiveTasks === Infinity
                      ? ' / unlimited'
                      : ' / ' + planLimitLabel(entitlements.maxActiveTasks)}
                  </span>
                </div>
                {entitlements.maxActiveTasks !== Infinity && (
                  <ProgressBar
                    value={activeTaskCount}
                    max={entitlements.maxActiveTasks}
                    size="sm"
                    tone={usagePct > 85 ? 'danger' : 'gold'}
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MiniStat
                  label="Categories"
                  value={String(categories.length)}
                  hint={entitlements.maxCategories === Infinity ? 'unlimited' : 'of ' + entitlements.maxCategories}
                />
                <MiniStat label="Completed" value={String(stats.completed)} hint={stats.completionRate + '% rate'} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Included capabilities" subtitle={'Everything on the ' + plan.name + ' plan'}>
            <ul className="space-y-2.5">
              {[
                { label: 'Unlimited tasks', on: entitlements.maxActiveTasks === Infinity },
                { label: 'Recurring tasks', on: entitlements.recurringTasks },
                { label: 'Smart reminders', on: entitlements.reminders },
                { label: 'Subtasks', on: entitlements.subtasks },
                { label: 'Bulk actions', on: entitlements.bulkActions },
                { label: 'Advanced analytics', on: entitlements.advancedAnalytics },
                { label: 'Light theme', on: entitlements.lightTheme },
                { label: 'Priority support', on: entitlements.prioritySupport },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-[0.82rem]">
                  {item.on ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-[rgb(var(--ck-text-faint))]" />
                  )}
                  <span className={item.on ? 'text-[rgb(var(--ck-text))]' : 'ck-faint'}>{item.label}</span>
                </li>
              ))}
            </ul>
            {!isPremium && (
              <Button
                variant="gold"
                fullWidth
                className="mt-4"
                icon={<Crown className="h-4 w-4" />}
                onClick={() => navigate('/app/upgrade')}
              >
                Unlock everything
              </Button>
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard className="mt-4" title="Plan comparison" subtitle="A quick look at what each tier offers">
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((option) => {
            const current = option.id === subscription.planId;
            return (
              <div
                key={option.id}
                className={cn(
                  'rounded-2xl border p-4',
                  current ? 'border-gold-500/45 bg-gold-500/[0.06]' : 'border-[rgb(var(--ck-border)/0.1)]',
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-[1rem] font-semibold text-[rgb(var(--ck-text))]">
                    {option.name}
                  </h3>
                  {current && <Badge tone="gold">Current</Badge>}
                </div>
                <p className="mt-1.5 text-[0.76rem] ck-muted">{option.tagline}</p>
                <ul className="mt-3 space-y-1.5">
                  {option.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[0.74rem] ck-muted">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!current && (
                  <Button
                    variant={option.id === 'free' ? 'quiet' : 'ghost'}
                    size="sm"
                    fullWidth
                    className="mt-3"
                    onClick={() => navigate(option.id === 'free' ? '/app/settings' : '/app/upgrade?plan=' + option.id)}
                  >
                    {option.id === 'free' ? 'Downgrade options' : 'Switch to ' + option.name}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="ck-inset rounded-xl px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-wide ck-faint">
        <span className="text-gold-400">{icon}</span>
        {label}
      </div>
      <p className="mt-1.5 truncate text-[0.84rem] font-medium text-[rgb(var(--ck-text))]">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="ck-inset rounded-xl px-3 py-2.5">
      <p className="text-[0.64rem] font-semibold uppercase tracking-wide ck-faint">{label}</p>
      <p className="mt-1 font-display text-[1.05rem] font-semibold text-[rgb(var(--ck-text))]">{value}</p>
      {hint && <p className="text-[0.66rem] ck-faint">{hint}</p>}
    </div>
  );
}
