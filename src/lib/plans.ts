import type { BillingCycle, Entitlements, PlanId, Subscription, SubscriptionStatus } from '@/types';

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  monthly: { NGN: number; USD: number };
  yearly: { NGN: number; USD: number };
  highlight?: boolean;
  badge?: string;
  features: string[];
  entitlements: Entitlements;
}

const FREE_ENTITLEMENTS: Entitlements = {
  maxActiveTasks: 40,
  maxCategories: 3,
  recurringTasks: false,
  advancedAnalytics: false,
  reminders: false,
  lightTheme: false,
  exportFormats: ['json'],
  bulkActions: false,
  prioritySupport: false,
  unlimitedTags: false,
  subtasks: false,
  calendarWeekMonth: false,
};

const PREMIUM_ENTITLEMENTS: Entitlements = {
  maxActiveTasks: Infinity,
  maxCategories: 20,
  recurringTasks: true,
  advancedAnalytics: true,
  reminders: true,
  lightTheme: true,
  exportFormats: ['json', 'csv', 'markdown'],
  bulkActions: true,
  prioritySupport: false,
  unlimitedTags: true,
  subtasks: true,
  calendarWeekMonth: true,
};

const ELITE_ENTITLEMENTS: Entitlements = {
  ...PREMIUM_ENTITLEMENTS,
  maxCategories: Infinity,
  prioritySupport: true,
};

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Everything you need to start organizing.',
    monthly: { NGN: 0, USD: 0 },
    yearly: { NGN: 0, USD: 0 },
    features: [
      'Up to 40 active tasks',
      '3 categories',
      'Dashboard, list and search',
      'Daily calendar view',
      'JSON data export',
      'Dark luxury theme',
    ],
    entitlements: FREE_ENTITLEMENTS,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'For people who live by their calendar.',
    monthly: { NGN: 3500, USD: 7 },
    yearly: { NGN: 33600, USD: 67 },
    highlight: true,
    badge: 'Most popular',
    features: [
      'Unlimited tasks & categories',
      'Recurring tasks & smart reminders',
      'Subtasks and bulk actions',
      'Weekly & monthly calendar',
      'Advanced analytics and insights',
      'CSV, JSON and Markdown export',
      'Light & dark themes',
    ],
    entitlements: PREMIUM_ENTITLEMENTS,
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'For power users and small teams.',
    monthly: { NGN: 7500, USD: 15 },
    yearly: { NGN: 72000, USD: 144 },
    badge: 'Best value',
    features: [
      'Everything in Premium',
      'Unlimited categories & tags',
      'Priority support channel',
      'Early access to new features',
      'Team-ready data exports',
    ],
    entitlements: ELITE_ENTITLEMENTS,
  },
];

const PLAN_MAP = new Map(PLANS.map((p) => [p.id, p]));

export function getPlan(id: PlanId): Plan {
  return PLAN_MAP.get(id) ?? PLANS[0];
}

export function entitlementsFor(id: PlanId): Entitlements {
  return getPlan(id).entitlements;
}

export function isPaidPlan(id: PlanId): boolean {
  return id === 'premium' || id === 'elite';
}

export function formatPrice(amount: number, currency: 'NGN' | 'USD'): string {
  if (amount === 0) return 'Free';
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function yearlySavingPercent(plan: Plan): number {
  if (plan.monthly.NGN === 0) return 0;
  const full = plan.monthly.NGN * 12;
  return Math.round(((full - plan.yearly.NGN) / full) * 100);
}

export const DEFAULT_SUBSCRIPTION: Subscription = {
  planId: 'free',
  status: 'active',
  billingCycle: 'monthly',
  provider: null,
  startedAt: new Date().toISOString(),
  currentPeriodEnd: null,
  trialEndsAt: null,
  cancelAtPeriodEnd: false,
  reference: null,
};

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trialing: 'Trialing',
  canceled: 'Canceled',
  past_due: 'Past due',
};

export function planLimitLabel(limit: number): string {
  return limit === Infinity ? 'Unlimited' : String(limit);
}

export function nextBillingDate(cycle: BillingCycle, from = new Date()): Date {
  const d = new Date(from);
  if (cycle === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}
