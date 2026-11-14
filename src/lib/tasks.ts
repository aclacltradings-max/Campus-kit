import type {
  ActivityEvent,
  RecurrenceFrequency,
  SortKey,
  Task,
  TaskFilters,
} from '@/types';
import { addDays, addMonths, addYears, diffInDays, isSameDay, startOfDay } from '@/lib/date';
import { priorityWeight } from '@/lib/priority';
import { uid } from '@/lib/id';

export function createTask(partial: Partial<Task> = {}): Task {
  const now = new Date().toISOString();
  return {
    id: uid('task'),
    title: '',
    description: '',
    categoryId: null,
    tags: [],
    priority: 'medium',
    status: 'todo',
    dueDate: null,
    startDate: null,
    reminderAt: null,
    reminderSent: false,
    recurrence: 'none',
    subtasks: [],
    inMyDay: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    archived: false,
    estimatedMinutes: null,
    ...partial,
  };
}

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'completed' || !task.dueDate) return false;
  return startOfDay(task.dueDate) < startOfDay(now);
}

export function isDueToday(task: Task): boolean {
  return Boolean(task.dueDate && isSameDay(task.dueDate, new Date()));
}

export function isDueThisWeek(task: Task, weekStartsOn: 0 | 1 = 1): boolean {
  if (!task.dueDate) return false;
  void weekStartsOn;
  const days = diffInDays(new Date(), task.dueDate);
  return days >= 0 && days <= 7;
}

export function isUpcoming(task: Task): boolean {
  if (task.status === 'completed' || !task.dueDate) return false;
  return startOfDay(task.dueDate) > startOfDay(new Date());
}

export function subtaskProgress(task: Task): { done: number; total: number; ratio: number } {
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.done).length;
  return { done, total, ratio: total === 0 ? 0 : done / total };
}

export function nextOccurrence(
  from: Date | string | number,
  frequency: RecurrenceFrequency,
): Date | null {
  if (frequency === 'none') return null;
  const base = new Date(from);
  switch (frequency) {
    case 'daily':
      return addDays(base, 1);
    case 'weekdays': {
      let next = addDays(base, 1);
      while (next.getDay() === 0 || next.getDay() === 6) next = addDays(next, 1);
      return next;
    }
    case 'weekly':
      return addDays(base, 7);
    case 'biweekly':
      return addDays(base, 14);
    case 'monthly':
      return addMonths(base, 1);
    case 'yearly':
      return addYears(base, 1);
    default:
      return null;
  }
}

export const RECURRENCE_LABEL: Record<RecurrenceFrequency, string> = {
  none: 'Does not repeat',
  daily: 'Every day',
  weekdays: 'Every weekday',
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
  yearly: 'Every year',
};

/** Builds the follow-up occurrence of a recurring task, preserving relative timing. */
export function buildRecurringFollowUp(task: Task): Task | null {
  if (task.recurrence === 'none') return null;
  const anchor = task.dueDate ?? new Date().toISOString();
  const nextDue = nextOccurrence(anchor, task.recurrence);
  if (!nextDue) return null;

  const shift = (value: string | null): string | null => {
    if (!value) return null;
    const offset = new Date(value).getTime() - new Date(anchor).getTime();
    return new Date(nextDue.getTime() + offset).toISOString();
  };

  return createTask({
    ...task,
    id: uid('task'),
    status: 'todo',
    completedAt: null,
    reminderSent: false,
    dueDate: nextDue.toISOString(),
    startDate: shift(task.startDate),
    reminderAt: shift(task.reminderAt),
    subtasks: task.subtasks.map((s) => ({ ...s, id: uid('sub'), done: false })),
    inMyDay: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function matchesQuery(task: Task, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [task.title, task.description, ...task.tags].join(' ').toLowerCase();
  return haystack.includes(q);
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  now: Date = new Date(),
): Task[] {
  return tasks.filter((task) => {
    if (!filters.includeArchived && task.archived) return false;
    if (!matchesQuery(task, filters.query)) return false;

    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;

    if (filters.categoryId === 'none') {
      if (task.categoryId) return false;
    } else if (filters.categoryId !== 'all' && task.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.tags.length) {
      const lowered = task.tags.map((t) => t.toLowerCase());
      const allMatch = filters.tags.every((tag) => lowered.includes(tag.toLowerCase()));
      if (!allMatch) return false;
    }

    if (filters.dueWithin !== 'any') {
      if (!task.dueDate) {
        if (filters.dueWithin !== 'no-date') return false;
      } else {
        const days = diffInDays(now, task.dueDate);
        switch (filters.dueWithin) {
          case 'overdue':
            if (!isOverdue(task, now)) return false;
            break;
          case 'today':
            if (!isSameDay(task.dueDate, now)) return false;
            break;
          case 'week':
            if (days < 0 || days > 7) return false;
            break;
          case 'month':
            if (days < 0 || days > 31) return false;
            break;
          case 'no-date':
            return false;
          default:
            break;
        }
      }
    }

    return true;
  });
}

const PRIORITY_RANK: Record<Task['priority'], number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  const copy = [...tasks];
  const byDue = (a: Task, b: Task, dir: 1 | -1): number => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir;
  };

  switch (key) {
    case 'due-asc':
      copy.sort((a, b) => byDue(a, b, 1) || PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
      break;
    case 'due-desc':
      copy.sort((a, b) => byDue(a, b, -1));
      break;
    case 'created-desc':
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'created-asc':
      copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'priority-desc':
      copy.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority) || byDue(a, b, 1));
      break;
    case 'priority-asc':
      copy.sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority));
      break;
    case 'title-asc':
      copy.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      copy.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'updated-desc':
      copy.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    default:
      break;
  }
  return copy;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  inProgress: number;
  completionRate: number;
  completedToday: number;
  completedThisWeek: number;
  avgCompletionDays: number;
  focusMinutes: number;
}

export function computeStats(tasks: Task[], now: Date = new Date()): TaskStats {
  const active = tasks.filter((t) => !t.archived);
  const completed = active.filter((t) => t.status === 'completed');
  const pending = active.filter((t) => t.status !== 'completed');
  const overdue = active.filter((t) => isOverdue(t, now));
  const dueToday = active.filter((t) => t.status !== 'completed' && isDueToday(t));
  const inProgress = active.filter((t) => t.status === 'in_progress');

  const completedToday = completed.filter(
    (t) => t.completedAt && isSameDay(t.completedAt, now),
  ).length;

  const weekStart = addDays(startOfDay(now), -6);
  const completedThisWeek = completed.filter(
    (t) => t.completedAt && new Date(t.completedAt) >= weekStart,
  ).length;

  const durations = completed
    .filter((t) => t.completedAt)
    .map((t) => (new Date(t.completedAt as string).getTime() - new Date(t.createdAt).getTime()) / 86_400_000)
    .filter((d) => d >= 0);

  const avgCompletionDays = durations.length
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;

  const focusMinutes = completed.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0);

  return {
    total: active.length,
    completed: completed.length,
    pending: pending.length,
    overdue: overdue.length,
    dueToday: dueToday.length,
    inProgress: inProgress.length,
    completionRate: active.length ? Math.round((completed.length / active.length) * 100) : 0,
    completedToday,
    completedThisWeek,
    avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
    focusMinutes,
  };
}

export interface TrendPoint {
  label: string;
  date: string;
  created: number;
  completed: number;
}

export function buildTrend(tasks: Task[], days = 14): TrendPoint[] {
  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = startOfDay(addDays(new Date(), -i));
    const next = addDays(day, 1);
    const label = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    points.push({
      label,
      date: day.toISOString(),
      created: tasks.filter((t) => {
        const created = new Date(t.createdAt);
        return created >= day && created < next;
      }).length,
      completed: tasks.filter((t) => {
        if (!t.completedAt) return false;
        const done = new Date(t.completedAt);
        return done >= day && done < next;
      }).length,
    });
  }
  return points;
}

export interface CategoryBreakdown {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  completed: number;
  completionRate: number;
}

export function buildCategoryBreakdown(
  tasks: Task[],
  categories: Array<{ id: string; name: string; color: string }>,
): CategoryBreakdown[] {
  const rows = categories.map((category) => {
    const scoped = tasks.filter((t) => t.categoryId === category.id && !t.archived);
    const completed = scoped.filter((t) => t.status === 'completed').length;
    return {
      categoryId: category.id,
      name: category.name,
      color: category.color,
      total: scoped.length,
      completed,
      completionRate: scoped.length ? Math.round((completed / scoped.length) * 100) : 0,
    };
  });

  const uncategorised = tasks.filter((t) => !t.categoryId && !t.archived);
  if (uncategorised.length) {
    const completed = uncategorised.filter((t) => t.status === 'completed').length;
    rows.push({
      categoryId: 'none',
      name: 'Uncategorised',
      color: '#6B6B7B',
      total: uncategorised.length,
      completed,
      completionRate: Math.round((completed / uncategorised.length) * 100),
    });
  }

  return rows.filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
}

export interface PriorityBreakdown {
  priority: Task['priority'];
  label: string;
  total: number;
  completed: number;
}

export function buildPriorityBreakdown(tasks: Task[]): PriorityBreakdown[] {
  const priorities: Array<Task['priority']> = ['urgent', 'high', 'medium', 'low'];
  const labels: Record<Task['priority'], string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return priorities.map((priority) => {
    const scoped = tasks.filter((t) => t.priority === priority && !t.archived);
    return {
      priority,
      label: labels[priority],
      total: scoped.length,
      completed: scoped.filter((t) => t.status === 'completed').length,
    };
  });
}

export function heatmapByWeekday(tasks: Task[]): Array<{ day: string; completed: number }> {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = labels.map((day) => ({ day, completed: 0 }));
  tasks.forEach((task) => {
    if (!task.completedAt) return;
    const idx = new Date(task.completedAt).getDay();
    buckets[idx].completed += 1;
  });
  return buckets;
}

export function allTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  tasks.forEach((t) => t.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function activityFromTasks(tasks: Task[], limit = 12): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  tasks.forEach((task) => {
    events.push({
      id: `${task.id}-created`,
      taskId: task.id,
      taskTitle: task.title,
      type: 'created',
      at: task.createdAt,
    });
    if (task.completedAt) {
      events.push({
        id: `${task.id}-completed`,
        taskId: task.id,
        taskTitle: task.title,
        type: 'completed',
        at: task.completedAt,
      });
    }
  });
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, limit);
}
