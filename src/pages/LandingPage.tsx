import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  Crown,
  LayoutDashboard,
  Repeat,
  Search,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { PLANS, formatPrice } from '@/lib/plans';
import { useWorkspace } from '@/context/WorkspaceContext';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'One dashboard',
    body: 'Total, completed, pending and overdue counts with a live productivity trend and completion ring.',
  },
  {
    icon: CalendarDays,
    title: 'Calendar that reads your week',
    body: 'Daily, weekly and monthly views with per-day task chips and one-tap scheduling.',
  },
  {
    icon: Search,
    title: 'Smart search',
    body: 'Search titles, descriptions and tags, then narrow by status, priority, category and deadline.',
  },
  {
    icon: Repeat,
    title: 'Recurring tasks',
    body: 'Daily, weekday, weekly, monthly or yearly rhythms that reschedule themselves on completion.',
  },
  {
    icon: Bell,
    title: 'Reminders that land',
    body: 'In-app and browser reminders, plus an overdue sweep so nothing quietly slips.',
  },
  {
    icon: BarChart3,
    title: 'Analytics worth reading',
    body: 'Trend lines, category performance, priority mix and the weekday you actually get things done.',
  },
];

export function LandingPage() {
  const { isPremium } = useWorkspace();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[rgb(var(--ck-bg))]">
      <div className="pointer-events-none fixed inset-0 ck-grid-bg opacity-40" />
      <div className="pointer-events-none fixed -top-48 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gold-500/[0.09] blur-[140px]" />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo subtitle="Premium task workspace" />
        <nav className="flex items-center gap-2">
          <Link to="/pricing" className="ck-btn-quiet hidden h-10 px-4 sm:inline-flex">
            Pricing
          </Link>
          <Link to="/app" className="ck-btn-gold h-10 px-4">
            Open workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <section className="pt-10 text-center sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/[0.08] px-3.5 py-1.5 text-[0.72rem] font-semibold text-gold-200 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5" />
            Premium, private and built for everyone
          </span>

          <h1 className="mx-auto mt-6 max-w-3xl text-balance font-display text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-[rgb(var(--ck-text))] animate-fade-up sm:text-[3.6rem]">
            Organise everything.
            <br />
            <span className="ck-gold-text">Finish what matters.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-balance text-[0.98rem] leading-relaxed ck-muted animate-fade-up">
            CampusKit Private is a calm, precise workspace for daily activities, assignments, projects
            and deadlines. A luxury black and gold interface, serious productivity underneath.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up">
            <Link to="/app" className="ck-btn-gold h-12 px-6 text-[0.95rem]">
              Enter the workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing" className="ck-btn-ghost h-12 px-6 text-[0.95rem]">
              See plans
            </Link>
          </div>

          <p className="mt-4 text-[0.76rem] ck-faint">
            No sign-up needed. Your data is stored on this device and never uploaded.
          </p>
        </section>

        <section className="mt-16 animate-fade-up">
          <div className="ck-card ck-noise relative overflow-hidden p-0">
            <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total tasks', value: '12', hint: '+3 today' },
                { label: 'Completed', value: '8', hint: '67% rate' },
                { label: 'Pending', value: '4', hint: '2 in progress' },
                { label: 'Overdue', value: '1', hint: 'needs attention' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-[rgb(var(--ck-border)/0.08)] bg-[rgb(var(--ck-border)/0.02)] p-4">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] ck-faint">{stat.label}</p>
                  <p className="mt-2 font-display text-[2rem] font-semibold leading-none ck-gold-text">{stat.value}</p>
                  <p className="mt-2 text-[0.72rem] ck-muted">{stat.hint}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[rgb(var(--ck-border)/0.06)] px-5 py-3">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.72rem] ck-faint">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> Productivity trend
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Completion ring
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" /> Category split
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <div className="text-center">
            <p className="ck-eyebrow">Core features</p>
            <h2 className="mt-2 font-display text-[1.9rem] font-semibold tracking-tight text-[rgb(var(--ck-text))] sm:text-[2.4rem]">
              Everything a serious workspace needs
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="ck-card ck-card-hover p-5 animate-fade-up"
                style={{ animationDelay: index * 55 + 'ms' }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10 text-gold-300">
                  <feature.icon className="h-4.5 w-4.5" />
                </span>
                <h3 className="mt-3.5 font-display text-[1.05rem] font-semibold text-[rgb(var(--ck-text))]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[0.82rem] leading-relaxed ck-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="animate-fade-up">
            <p className="ck-eyebrow">Designed with intent</p>
            <h2 className="mt-2 font-display text-[1.9rem] font-semibold leading-tight tracking-tight text-[rgb(var(--ck-text))]">
              A workspace that feels like a <span className="ck-gold-text">private club</span>
            </h2>
            <p className="mt-4 text-[0.9rem] leading-relaxed ck-muted">
              Deep blacks, considered gold accents and a display serif give CampusKit a distinct
              identity. Every animation is tuned, every surface has weight, and the mobile experience
              is treated as a first-class citizen.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Black, gold and dark grey with a full light theme for Premium members.',
                'Keyboard-friendly search with instant results across your workspace.',
                'Responsive layouts from a 360 pixel phone to an ultrawide monitor.',
                'Reduced-motion support and accessible focus states throughout.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[0.84rem] text-[rgb(var(--ck-text-muted))]">
                  <span className="mt-0.5 flex h-4.5 w-4.5 h-[1.1rem] w-[1.1rem] shrink-0 items-center justify-center rounded-full bg-gold-500/18 text-gold-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 animate-fade-up">
            {[
              { icon: Shield, title: 'Private by default', body: 'Data lives in your browser, not on a server.' },
              { icon: Zap, title: 'Instant', body: 'No network round trips. Everything is immediate.' },
              { icon: Star, title: 'Refined', body: 'A design system, not a template.' },
              { icon: Crown, title: 'Monetisation ready', body: 'Free, Premium and Elite tiers with a checkout seam.' },
            ].map((item) => (
              <div key={item.title} className="ck-card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/25 bg-gold-500/10 text-gold-300">
                  <item.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-3 text-[0.92rem] font-semibold text-[rgb(var(--ck-text))]">{item.title}</h3>
                <p className="mt-1 text-[0.78rem] ck-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="text-center">
            <p className="ck-eyebrow">Pricing</p>
            <h2 className="mt-2 font-display text-[1.9rem] font-semibold tracking-tight text-[rgb(var(--ck-text))] sm:text-[2.4rem]">
              Start free. Upgrade when it pays off.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PLANS.map((plan, index) => (
              <div
                key={plan.id}
                className={
                  'relative flex flex-col rounded-3xl border p-5 animate-fade-up ' +
                  (plan.highlight
                    ? 'border-gold-500/45 bg-gradient-to-b from-gold-500/[0.1] to-transparent shadow-glow'
                    : 'border-[rgb(var(--ck-border)/0.1)] ck-card')
                }
                style={{ animationDelay: index * 70 + 'ms' }}
              >
                {plan.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-gold-300 to-gold-600 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wide text-ink-950">
                    {plan.badge}
                  </span>
                )}
                <h3 className="font-display text-[1.3rem] font-semibold text-[rgb(var(--ck-text))]">{plan.name}</h3>
                <p className="mt-1 text-[0.8rem] ck-muted">{plan.tagline}</p>
                <p className="mt-4 font-display text-[2rem] font-semibold leading-none text-[rgb(var(--ck-text))]">
                  {formatPrice(plan.monthly.USD, 'USD')}
                  {plan.monthly.USD > 0 && <span className="text-[0.76rem] font-normal ck-muted">/month</span>}
                </p>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[0.78rem] text-[rgb(var(--ck-text-muted))]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.id === 'free' ? '/app' : '/pricing'}
                  className={plan.highlight ? 'ck-btn-gold mt-5 h-11' : 'ck-btn-ghost mt-5 h-11'}
                >
                  {plan.id === 'free' ? 'Start free' : 'Choose ' + plan.name}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/30 bg-gradient-to-br from-gold-500/[0.12] via-transparent to-transparent p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-500/12 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-[1.9rem] font-semibold tracking-tight text-[rgb(var(--ck-text))] sm:text-[2.4rem]">
                {isPremium ? 'Your Premium workspace is ready' : 'Ready to get organised?'}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[0.9rem] leading-relaxed ck-muted">
                Open the workspace and everything is already waiting: a sample plan, live charts and a
                search that finds anything in milliseconds.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link to="/app" className="ck-btn-gold h-12 px-6">
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/pricing" className="ck-btn-ghost h-12 px-6">
                  Compare plans
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[rgb(var(--ck-border)/0.07)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo subtitle="Premium task workspace" size={30} />
          <p className="text-center text-[0.74rem] ck-faint">
            CampusKit Private. Built as a premium, private workspace. Your data stays on your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
