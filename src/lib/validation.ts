import type { Task } from '@/types';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface TaskDraft {
  title: string;
  description: string;
  categoryId: string | null;
  tags: string[];
  priority: Task['priority'];
  status: Task['status'];
  dueDate: string | null;
  startDate: string | null;
  reminderAt: string | null;
  recurrence: Task['recurrence'];
  estimatedMinutes: number | null;
}

export const TASK_LIMITS = {
  titleMin: 2,
  titleMax: 140,
  descriptionMax: 4000,
  tagMax: 24,
  tagsMax: 12,
};

export function validateTask(draft: TaskDraft): FieldErrors<TaskDraft> {
  const errors: FieldErrors<TaskDraft> = {};
  const title = draft.title.trim();

  if (!title) {
    errors.title = 'A title is required.';
  } else if (title.length < TASK_LIMITS.titleMin) {
    errors.title = `Title must be at least ${TASK_LIMITS.titleMin} characters.`;
  } else if (title.length > TASK_LIMITS.titleMax) {
    errors.title = `Title must be under ${TASK_LIMITS.titleMax} characters.`;
  }

  if (draft.description.length > TASK_LIMITS.descriptionMax) {
    errors.description = `Description must be under ${TASK_LIMITS.descriptionMax} characters.`;
  }

  if (draft.tags.length > TASK_LIMITS.tagsMax) {
    errors.tags = `Use at most ${TASK_LIMITS.tagsMax} tags.`;
  }

  if (draft.startDate && draft.dueDate && new Date(draft.startDate) > new Date(draft.dueDate)) {
    errors.dueDate = 'Deadline cannot be before the start date.';
  }

  if (draft.reminderAt && draft.dueDate && new Date(draft.reminderAt) > new Date(draft.dueDate)) {
    errors.reminderAt = 'Reminder must be before the deadline.';
  }

  if (draft.estimatedMinutes !== null && draft.estimatedMinutes < 0) {
    errors.estimatedMinutes = 'Estimate cannot be negative.';
  }

  return errors;
}

export function hasErrors(errors: FieldErrors<unknown>): boolean {
  return Object.values(errors).some(Boolean);
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return null;
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  return ok ? null : 'Enter a valid email address.';
}

export function validateDisplayName(name: string): string | null {
  const value = name.trim();
  if (!value) return 'Display name is required.';
  if (value.length > 60) return 'Keep the name under 60 characters.';
  return null;
}

export function sanitizeTag(raw: string): string {
  return raw
    .replace(/[#,\s]+/g, ' ')
    .trim()
    .slice(0, TASK_LIMITS.tagMax);
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  tags.forEach((tag) => {
    const clean = sanitizeTag(tag);
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      result.push(clean);
    }
  });
  return result.slice(0, TASK_LIMITS.tagsMax);
}

/** Validates an imported backup payload. Returns a normalised task list or an error message. */
export function parseImportPayload(raw: string): { tasks: Task[]; error?: string } {
  try {
    const parsed = JSON.parse(raw) as unknown;
    const container = parsed as { tasks?: unknown } | unknown[];
    const candidate = Array.isArray(container)
      ? container
      : container && typeof container === 'object' && Array.isArray(container.tasks)
        ? container.tasks
        : null;

    if (!candidate) return { tasks: [], error: 'No tasks array found in the file.' };

    const tasks: Task[] = [];
    candidate.forEach((item) => {
      const t = item as Partial<Task>;
      if (typeof t?.title !== 'string' || !t.title.trim()) return;
      const now = new Date().toISOString();
      tasks.push({
        id: typeof t.id === 'string' && t.id ? t.id : `import_${Math.random().toString(36).slice(2, 11)}`,
        title: t.title.slice(0, TASK_LIMITS.titleMax),
        description: typeof t.description === 'string' ? t.description : '',
        categoryId: typeof t.categoryId === 'string' ? t.categoryId : null,
        tags: normalizeTags(Array.isArray(t.tags) ? (t.tags as string[]) : []),
        priority:
          t.priority === 'urgent' || t.priority === 'high' || t.priority === 'low'
            ? t.priority
            : 'medium',
        status:
          t.status === 'completed' || t.status === 'in_progress' ? t.status : 'todo',
        dueDate: typeof t.dueDate === 'string' ? t.dueDate : null,
        startDate: typeof t.startDate === 'string' ? t.startDate : null,
        reminderAt: typeof t.reminderAt === 'string' ? t.reminderAt : null,
        reminderSent: Boolean(t.reminderSent),
        recurrence: (t.recurrence as Task['recurrence']) ?? 'none',
        subtasks: Array.isArray(t.subtasks)
          ? (t.subtasks as Task['subtasks']).filter((s) => s && typeof s.title === 'string')
          : [],
        inMyDay: Boolean(t.inMyDay),
        completedAt: typeof t.completedAt === 'string' ? t.completedAt : null,
        createdAt: typeof t.createdAt === 'string' ? t.createdAt : now,
        updatedAt: typeof t.updatedAt === 'string' ? t.updatedAt : now,
        archived: Boolean(t.archived),
        estimatedMinutes: typeof t.estimatedMinutes === 'number' ? t.estimatedMinutes : null,
      });
    });

    if (!tasks.length) return { tasks: [], error: 'The file contained no valid tasks.' };
    return { tasks };
  } catch {
    return { tasks: [], error: 'That file is not valid JSON.' };
  }
}
