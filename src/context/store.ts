import type {
  ActivityEvent,
  Category,
  PersistedState,
  Settings,
  Subscription,
  Task,
} from '@/types';
import { DEFAULT_SUBSCRIPTION } from '@/lib/plans';
import { STORAGE_KEYS, readJSON, writeJSON } from '@/lib/storage';
import { createTask, buildRecurringFollowUp } from '@/lib/tasks';
import { seedCategories, seedTasks } from '@/lib/seed';
import { uid } from '@/lib/id';

export const STATE_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = {
  displayName: 'Guest',
  email: '',
  theme: 'dark',
  density: 'comfortable',
  weekStartsOn: 1,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  defaultView: 'dashboard',
  notificationsEnabled: true,
  reminderLeadMinutes: 15,
  dailyDigest: false,
  reduceMotion: false,
  autoArchiveCompleted: false,
  confirmBeforeDelete: true,
};

export interface AppState extends PersistedState {
  hydrated: boolean;
}

export type Action =
  | { type: 'hydrate'; payload: Partial<PersistedState> }
  | { type: 'add-task'; payload: { task: Task } }
  | { type: 'update-task'; payload: { id: string; patch: Partial<Task>; touch?: boolean } }
  | { type: 'delete-task'; payload: { id: string } }
  | { type: 'delete-tasks'; payload: { ids: string[] } }
  | { type: 'toggle-task'; payload: { id: string } }
  | { type: 'set-status'; payload: { ids: string[]; status: Task['status'] } }
  | { type: 'set-priority'; payload: { ids: string[]; priority: Task['priority'] } }
  | { type: 'set-category'; payload: { ids: string[]; categoryId: string | null } }
  | { type: 'toggle-my-day'; payload: { ids: string[] } }
  | { type: 'archive-tasks'; payload: { ids: string[]; archived: boolean } }
  | { type: 'duplicate-task'; payload: { id: string } }
  | { type: 'snooze-task'; payload: { id: string; days: number } }
  | { type: 'add-category'; payload: { category: Category } }
  | { type: 'update-category'; payload: { id: string; patch: Partial<Category> } }
  | { type: 'delete-category'; payload: { id: string } }
  | { type: 'update-settings'; payload: Partial<Settings> }
  | { type: 'set-subscription'; payload: Partial<Subscription> }
  | { type: 'import-tasks'; payload: { tasks: Task[]; categories?: Category[]; mode: 'merge' | 'replace' } }
  | { type: 'reset-demo' }
  | { type: 'clear-tasks' }
  | { type: 'reset-all' };

function activityEvent(task: Task, type: ActivityEvent['type']): ActivityEvent {
  return { id: uid('act'), taskId: task.id, taskTitle: task.title, type, at: new Date().toISOString() };
}

function withActivity(state: AppState, events: ActivityEvent[]): ActivityEvent[] {
  return [...events, ...state.activity].slice(0, 60);
}

export function createInitialState(): AppState {
  return {
    version: STATE_VERSION,
    tasks: [],
    categories: [],
    settings: DEFAULT_SETTINGS,
    subscription: DEFAULT_SUBSCRIPTION,
    activity: [],
    seeded: false,
    hydrated: false,
  };
}

function touch(task: Task, patch: Partial<Task>): Task {
  return { ...task, ...patch, updatedAt: new Date().toISOString() };
}

function maybeArchive(task: Task, autoArchive: boolean): Task {
  if (!autoArchive || task.status !== 'completed') return task;
  return { ...task, archived: true };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate': {
      return { ...state, ...action.payload, hydrated: true };
    }

    case 'add-task': {
      const task = action.payload.task;
      return {
        ...state,
        tasks: [task, ...state.tasks],
        activity: withActivity(state, [activityEvent(task, 'created')]),
      };
    }

    case 'update-task': {
      const { id, patch, touch: shouldTouch = true } = action.payload;
      const tasks = state.tasks.map((task) => {
        if (task.id !== id) return task;
        return shouldTouch ? touch(task, patch) : { ...task, ...patch };
      });
      return { ...state, tasks };
    }

    case 'delete-task': {
      const target = state.tasks.find((t) => t.id === action.payload.id);
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload.id),
        activity: target ? withActivity(state, [activityEvent(target, 'deleted')]) : state.activity,
      };
    }

    case 'delete-tasks': {
      const ids = new Set(action.payload.ids);
      return { ...state, tasks: state.tasks.filter((t) => !ids.has(t.id)) };
    }

    case 'toggle-task': {
      const { id } = action.payload;
      const target = state.tasks.find((t) => t.id === id);
      if (!target) return state;

      const completing = target.status !== 'completed';
      const now = new Date().toISOString();

      let tasks = state.tasks.map((task) =>
        task.id === id
          ? touch(task, {
              status: completing ? 'completed' : 'todo',
              completedAt: completing ? now : null,
              reminderSent: completing ? task.reminderSent : false,
            })
          : task,
      );

      let events: ActivityEvent[] = [activityEvent(target, completing ? 'completed' : 'reopened')];

      if (completing) {
        const followUp = buildRecurringFollowUp(target);
        if (followUp) {
          tasks = [followUp, ...tasks];
          events = [activityEvent(followUp, 'created'), ...events];
        }
        if (state.settings.autoArchiveCompleted) {
          tasks = tasks.map((task) => (task.id === id ? maybeArchive(task, true) : task));
        }
      }

      return { ...state, tasks, activity: withActivity(state, events) };
    }

    case 'set-status': {
      const ids = new Set(action.payload.ids);
      const status = action.payload.status;
      const now = new Date().toISOString();
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          ids.has(task.id)
            ? touch(task, {
                status,
                completedAt: status === 'completed' ? (task.completedAt ?? now) : null,
              })
            : task,
        ),
      };
    }

    case 'set-priority': {
      const ids = new Set(action.payload.ids);
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          ids.has(task.id) ? touch(task, { priority: action.payload.priority }) : task,
        ),
      };
    }

    case 'set-category': {
      const ids = new Set(action.payload.ids);
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          ids.has(task.id) ? touch(task, { categoryId: action.payload.categoryId }) : task,
        ),
      };
    }

    case 'toggle-my-day': {
      const ids = new Set(action.payload.ids);
      const allIn = state.tasks.filter((t) => ids.has(t.id)).every((t) => t.inMyDay);
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          ids.has(task.id) ? touch(task, { inMyDay: !allIn }) : task,
        ),
      };
    }

    case 'archive-tasks': {
      const ids = new Set(action.payload.ids);
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          ids.has(task.id) ? touch(task, { archived: action.payload.archived }) : task,
        ),
      };
    }

    case 'duplicate-task': {
      const source = state.tasks.find((t) => t.id === action.payload.id);
      if (!source) return state;
      const copy = createTask({
        ...source,
        id: uid('task'),
        title: `${source.title} (copy)`,
        status: 'todo',
        completedAt: null,
        reminderSent: false,
        subtasks: source.subtasks.map((s) => ({ ...s, id: uid('sub') })),
      });
      return { ...state, tasks: [copy, ...state.tasks] };
    }

    case 'snooze-task': {
      const { id, days } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== id) return task;
          const shift = (value: string | null): string | null =>
            value
              ? new Date(new Date(value).getTime() + days * 86_400_000).toISOString()
              : value;
          return touch(task, {
            dueDate: shift(task.dueDate),
            reminderAt: shift(task.reminderAt),
            reminderSent: false,
          });
        }),
      };
    }

    case 'add-category':
      return { ...state, categories: [...state.categories, action.payload.category] };

    case 'update-category':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.patch } : c,
        ),
      };

    case 'delete-category': {
      const { id } = action.payload;
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== id),
        tasks: state.tasks.map((task) =>
          task.categoryId === id ? { ...task, categoryId: null } : task,
        ),
      };
    }

    case 'update-settings':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'set-subscription':
      return { ...state, subscription: { ...state.subscription, ...action.payload } };

    case 'import-tasks': {
      const { tasks, categories, mode } = action.payload;
      if (mode === 'replace') {
        return {
          ...state,
          tasks,
          categories: categories?.length ? categories : state.categories,
        };
      }
      const existing = new Set(state.tasks.map((t) => t.id));
      const merged = [...tasks.filter((t) => !existing.has(t.id)), ...state.tasks];
      const existingCats = new Set(state.categories.map((c) => c.id));
      const mergedCats = [
        ...(categories ?? []).filter((c) => !existingCats.has(c.id)),
        ...state.categories,
      ];
      return { ...state, tasks: merged, categories: mergedCats };
    }

    case 'reset-demo': {
      const categories = seedCategories();
      return {
        ...state,
        categories,
        tasks: seedTasks(categories),
        activity: [],
        seeded: true,
      };
    }

    case 'clear-tasks':
      return { ...state, tasks: [], activity: [] };

    case 'reset-all':
      return { ...createInitialState(), hydrated: true };

    default:
      return state;
  }
}

export function loadState(): Partial<PersistedState> {
  const stored = readJSON<Partial<PersistedState> | null>(STORAGE_KEYS.state, null);
  if (!stored || typeof stored !== 'object') return {};
  return {
    version: STATE_VERSION,
    tasks: Array.isArray(stored.tasks) ? stored.tasks : [],
    categories: Array.isArray(stored.categories) ? stored.categories : [],
    settings: { ...DEFAULT_SETTINGS, ...(stored.settings ?? {}) },
    subscription: { ...DEFAULT_SUBSCRIPTION, ...(stored.subscription ?? {}) },
    activity: Array.isArray(stored.activity) ? stored.activity : [],
    seeded: Boolean(stored.seeded),
  };
}

export function persistState(state: AppState): void {
  writeJSON(STORAGE_KEYS.state, {
    version: STATE_VERSION,
    tasks: state.tasks,
    categories: state.categories,
    settings: state.settings,
    subscription: state.subscription,
    activity: state.activity,
    seeded: state.seeded,
  } satisfies PersistedState);
}
