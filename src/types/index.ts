export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type RecurrenceFrequency =
  | 'none'
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  tags: string[];
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  startDate: string | null;
  reminderAt: string | null;
  reminderSent: boolean;
  recurrence: RecurrenceFrequency;
  subtasks: Subtask[];
  inMyDay: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  estimatedMinutes: number | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export type Density = 'comfortable' | 'compact';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export type TimeFormat = '12h' | '24h';

export type DefaultView =
  | 'dashboard'
  | 'my-day'
  | 'upcoming'
  | 'tasks'
  | 'calendar'
  | 'analytics';

export interface Settings {
  displayName: string;
  email: string;
  theme: ThemeMode;
  density: Density;
  weekStartsOn: 0 | 1;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  defaultView: DefaultView;
  notificationsEnabled: boolean;
  reminderLeadMinutes: number;
  dailyDigest: boolean;
  reduceMotion: boolean;
  autoArchiveCompleted: boolean;
  confirmBeforeDelete: boolean;
}

export type PlanId = 'free' | 'premium' | 'elite';

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export type BillingCycle = 'monthly' | 'yearly';

export type PaymentProvider = 'paystack' | 'stripe' | null;

export interface Subscription {
  planId: PlanId;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  provider: PaymentProvider;
  startedAt: string;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  reference: string | null;
}

export interface Entitlements {
  maxActiveTasks: number;
  maxCategories: number;
  recurringTasks: boolean;
  advancedAnalytics: boolean;
  reminders: boolean;
  lightTheme: boolean;
  exportFormats: Array<'json' | 'csv' | 'markdown'>;
  bulkActions: boolean;
  prioritySupport: boolean;
  unlimitedTags: boolean;
  subtasks: boolean;
  calendarWeekMonth: boolean;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info' | 'gold';
  action?: { label: string; onClick: () => void };
}

export interface TaskFilters {
  query: string;
  status: TaskStatus | 'all';
  priority: Priority | 'all';
  categoryId: string | 'all' | 'none';
  tags: string[];
  dueWithin: 'any' | 'today' | 'week' | 'month' | 'overdue' | 'no-date';
  includeArchived: boolean;
}

export type SortKey =
  | 'due-asc'
  | 'due-desc'
  | 'created-desc'
  | 'created-asc'
  | 'priority-desc'
  | 'priority-asc'
  | 'title-asc'
  | 'title-desc'
  | 'updated-desc';

export interface ActivityEvent {
  id: string;
  taskId: string;
  taskTitle: string;
  type: 'created' | 'completed' | 'reopened' | 'deleted' | 'updated';
  at: string;
}

export interface PersistedState {
  version: number;
  tasks: Task[];
  categories: Category[];
  settings: Settings;
  subscription: Subscription;
  activity: ActivityEvent[];
  seeded: boolean;
}
