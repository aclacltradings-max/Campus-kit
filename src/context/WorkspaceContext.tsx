import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type {
  Category,
  Entitlements,
  Settings,
  Subscription,
  Task,
} from '@/types';
import {
  createInitialState,
  loadState,
  persistState,
  reducer,
  type Action,
  type AppState,
} from '@/context/store';
import { entitlementsFor, getPlan, isPaidPlan } from '@/lib/plans';
import { buildRecurringFollowUp, createTask, isOverdue } from '@/lib/tasks';
import {
  cancelAllReminders,
  initNotificationChannel,
  notificationPermissionGranted,
  notifyNow,
  syncScheduledReminders,
} from '@/lib/notifications';
import { isNative } from '@/lib/platform';
import { uid } from '@/lib/id';
import { useToast } from '@/context/ToastContext';
import { useInterval } from '@/hooks/useInterval';

export interface GateResult {
  allowed: boolean;
  reason?: string;
  upgradePlan?: 'premium' | 'elite';
}

export interface WorkspaceValue {
  state: AppState;
  tasks: Task[];
  categories: Category[];
  settings: Settings;
  subscription: Subscription;
  plan: ReturnType<typeof getPlan>;
  entitlements: Entitlements;
  isPremium: boolean;
  activeTaskCount: number;
  dispatch: (action: Action) => void;
  gate: (feature: keyof Entitlements) => GateResult;
  canAddTask: () => GateResult;
  canAddCategory: () => GateResult;
  getCategory: (id: string | null) => Category | undefined;
  createTaskFrom: (partial: Partial<Task>) => Task | null;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  duplicateTask: (id: string) => void;
  snoozeTask: (id: string, days: number) => void;
  bulk: {
    complete: (ids: string[]) => void;
    reopen: (ids: string[]) => void;
    prioritize: (ids: string[], priority: Task['priority']) => void;
    setCategory: (ids: string[], categoryId: string | null) => void;
    toggleMyDay: (ids: string[]) => void;
    archive: (ids: string[], archived: boolean) => void;
    remove: (ids: string[]) => void;
  };
  addCategory: (name: string, color: string, icon: string) => Category | null;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setSubscription: (patch: Partial<Subscription>) => void;
  upgradeTo: (planId: 'premium' | 'elite', cycle: Subscription['billingCycle'], provider: Subscription['provider'], reference: string | null) => void;
  cancelSubscription: () => void;
  resumeSubscription: () => void;
  importTasks: (tasks: Task[], categories: Category[] | undefined, mode: 'merge' | 'replace') => void;
  resetDemo: () => void;
  clearTasks: () => void;
  resetAll: () => void;
  exportAll: () => { tasks: Task[]; categories: Category[] };
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const toast = useToast();
  const hydratedRef = useRef(false);

  useEffect(() => {
    const loaded = loadState();
    dispatch({ type: 'hydrate', payload: loaded });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      if (!state.seeded && state.tasks.length === 0) {
        dispatch({ type: 'reset-demo' });
        return;
      }
    }
    persistState(state);
  }, [state]);

  const entitlements = useMemo(() => entitlementsFor(state.subscription.planId), [state.subscription.planId]);
  const plan = useMemo(() => getPlan(state.subscription.planId), [state.subscription.planId]);
  const isPremium = isPaidPlan(state.subscription.planId);

  const activeTaskCount = useMemo(
    () => state.tasks.filter((t) => !t.archived && t.status !== 'completed').length,
    [state.tasks],
  );

  const gate = useCallback<WorkspaceValue['gate']>(
    (feature) => {
      const value = entitlements[feature];
      if (value === false || value === 0) {
        return {
          allowed: false,
          reason: 'This is a Premium feature.',
          upgradePlan: 'premium',
        };
      }
      return { allowed: true };
    },
    [entitlements],
  );

  const canAddTask = useCallback((): GateResult => {
    if (state.tasks.filter((t) => !t.archived).length >= entitlements.maxActiveTasks) {
      return {
        allowed: false,
        reason: `The Free plan holds ${entitlements.maxActiveTasks} tasks. Upgrade for unlimited tasks.`,
        upgradePlan: 'premium',
      };
    }
    return { allowed: true };
  }, [state.tasks, entitlements.maxActiveTasks]);

  const canAddCategory = useCallback((): GateResult => {
    if (state.categories.length >= entitlements.maxCategories) {
      return {
        allowed: false,
        reason: `The Free plan includes ${entitlements.maxCategories} categories. Upgrade for more.`,
        upgradePlan: 'premium',
      };
    }
    return { allowed: true };
  }, [state.categories.length, entitlements.maxCategories]);

  const getCategory = useCallback(
    (id: string | null) => (id ? state.categories.find((c) => c.id === id) : undefined),
    [state.categories],
  );

  const createTaskFrom = useCallback(
    (partial: Partial<Task>): Task | null => {
      const check = canAddTask();
      if (!check.allowed) {
        toast.error('Task limit reached', check.reason);
        return null;
      }
      if (partial.recurrence && partial.recurrence !== 'none' && !entitlements.recurringTasks) {
        toast.error('Recurring tasks are Premium', 'Upgrade to repeat tasks automatically.');
        return null;
      }
      if (partial.reminderAt && !entitlements.reminders) {
        toast.error('Reminders are Premium', 'Upgrade to get reminded before deadlines.');
        return null;
      }
      if (partial.subtasks?.length && !entitlements.subtasks) {
        toast.error('Subtasks are Premium', 'Upgrade to break tasks into steps.');
        return null;
      }
      const task = createTask(partial);
      dispatch({ type: 'add-task', payload: { task } });
      return task;
    },
    [canAddTask, entitlements, toast],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) => {
      if (patch.recurrence && patch.recurrence !== 'none' && !entitlements.recurringTasks) {
        toast.error('Recurring tasks are Premium', 'Upgrade to repeat tasks automatically.');
        return;
      }
      if (patch.reminderAt && !entitlements.reminders) {
        toast.error('Reminders are Premium', 'Upgrade to get reminded before deadlines.');
        return;
      }
      dispatch({ type: 'update-task', payload: { id, patch } });
    },
    [entitlements, toast],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      dispatch({ type: 'toggle-task', payload: { id } });
      if (task.status !== 'completed') {
        const followUp = buildRecurringFollowUp(task);
        toast.success(
          followUp ? 'Completed — next occurrence scheduled' : 'Task completed',
          task.title,
        );
      } else {
        toast.info('Task reopened', task.title);
      }
    },
    [state.tasks, toast],
  );

  const deleteTask = useCallback(
    (id: string) => {
      const task = state.tasks.find((t) => t.id === id);
      dispatch({ type: 'delete-task', payload: { id } });
      if (task) {
        toast.push({
          title: 'Task deleted',
          description: task.title,
          variant: 'info',
        });
      }
    },
    [state.tasks, toast],
  );

  const duplicateTask = useCallback(
    (id: string) => {
      const check = canAddTask();
      if (!check.allowed) {
        toast.error('Task limit reached', check.reason);
        return;
      }
      dispatch({ type: 'duplicate-task', payload: { id } });
      toast.success('Task duplicated');
    },
    [canAddTask, toast],
  );

  const snoozeTask = useCallback(
    (id: string, days: number) => {
      dispatch({ type: 'snooze-task', payload: { id, days } });
      toast.success('Task rescheduled', `Moved forward by ${days} day${days === 1 ? '' : 's'}.`);
    },
    [toast],
  );

  const bulk = useMemo<WorkspaceValue['bulk']>(
    () => ({
      complete: (ids) => {
        dispatch({ type: 'set-status', payload: { ids, status: 'completed' } });
        toast.success(`${ids.length} task${ids.length === 1 ? '' : 's'} completed`);
      },
      reopen: (ids) => {
        dispatch({ type: 'set-status', payload: { ids, status: 'todo' } });
        toast.info(`${ids.length} task${ids.length === 1 ? '' : 's'} reopened`);
      },
      prioritize: (ids, priority) => {
        dispatch({ type: 'set-priority', payload: { ids, priority } });
        toast.success(`Priority updated for ${ids.length} task${ids.length === 1 ? '' : 's'}`);
      },
      setCategory: (ids, categoryId) => {
        dispatch({ type: 'set-category', payload: { ids, categoryId } });
        toast.success('Category updated');
      },
      toggleMyDay: (ids) => {
        dispatch({ type: 'toggle-my-day', payload: { ids } });
        toast.success('My Day updated');
      },
      archive: (ids, archived) => {
        dispatch({ type: 'archive-tasks', payload: { ids, archived } });
        toast.success(archived ? 'Tasks archived' : 'Tasks restored');
      },
      remove: (ids) => {
        dispatch({ type: 'delete-tasks', payload: { ids } });
        toast.info(`${ids.length} task${ids.length === 1 ? '' : 's'} deleted`);
      },
    }),
    [toast],
  );

  const addCategory = useCallback<WorkspaceValue['addCategory']>(
    (name, color, icon) => {
      const check = canAddCategory();
      if (!check.allowed) {
        toast.error('Category limit reached', check.reason);
        return null;
      }
      const category: Category = {
        id: uid('cat'),
        name: name.trim(),
        color,
        icon,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'add-category', payload: { category } });
      toast.success('Category created', category.name);
      return category;
    },
    [canAddCategory, toast],
  );

  const updateCategory = useCallback(
    (id: string, patch: Partial<Category>) => {
      dispatch({ type: 'update-category', payload: { id, patch } });
    },
    [],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      dispatch({ type: 'delete-category', payload: { id } });
      toast.info('Category removed', 'Its tasks are now uncategorised.');
    },
    [toast],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    dispatch({ type: 'update-settings', payload: patch });
  }, []);

  const setSubscription = useCallback((patch: Partial<Subscription>) => {
    dispatch({ type: 'set-subscription', payload: patch });
  }, []);

  const upgradeTo = useCallback<WorkspaceValue['upgradeTo']>(
    (planId, cycle, provider, reference) => {
      const now = new Date();
      const periodEnd = new Date(now);
      if (cycle === 'yearly') periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      else periodEnd.setMonth(periodEnd.getMonth() + 1);
      dispatch({
        type: 'set-subscription',
        payload: {
          planId,
          status: 'active',
          billingCycle: cycle,
          provider,
          startedAt: now.toISOString(),
          currentPeriodEnd: periodEnd.toISOString(),
          trialEndsAt: null,
          cancelAtPeriodEnd: false,
          reference,
        },
      });
      toast.gold(
        `${getPlan(planId).name} unlocked`,
        'Every premium capability is now available on this device.',
      );
    },
    [toast],
  );

  const cancelSubscription = useCallback(() => {
    dispatch({ type: 'set-subscription', payload: { cancelAtPeriodEnd: true } });
    toast.info('Subscription will end', 'You keep Premium until the end of the period.');
  }, [toast]);

  const resumeSubscription = useCallback(() => {
    dispatch({ type: 'set-subscription', payload: { cancelAtPeriodEnd: false } });
    toast.success('Subscription resumed');
  }, [toast]);

  const importTasks = useCallback<WorkspaceValue['importTasks']>(
    (tasks, categories, mode) => {
      dispatch({ type: 'import-tasks', payload: { tasks, categories, mode } });
      toast.success(
        mode === 'replace' ? 'Data replaced' : 'Import complete',
        `${tasks.length} task${tasks.length === 1 ? '' : 's'} loaded.`,
      );
    },
    [toast],
  );

  const resetDemo = useCallback(() => {
    dispatch({ type: 'reset-demo' });
    toast.success('Sample workspace loaded');
  }, [toast]);

  const clearTasks = useCallback(() => {
    dispatch({ type: 'clear-tasks' });
    toast.info('All tasks cleared');
  }, [toast]);

  const resetAll = useCallback(() => {
    dispatch({ type: 'reset-all' });
    toast.info('Workspace reset', 'Settings and data returned to defaults.');
  }, [toast]);

  const exportAll = useCallback(
    () => ({ tasks: state.tasks, categories: state.categories }),
    [state.tasks, state.categories],
  );

  // Native notification setup. The channel is created once per launch; without
  // it Android 8+ silently drops every notification posted to it.
  useEffect(() => {
    if (!state.hydrated || !isNative) return;
    void initNotificationChannel();
  }, [state.hydrated]);

  // Keep the OS schedule in step with the task list. A reminder that only fires
  // while the app happens to be open is not a reminder, so every task change
  // re-reconciles what the system has queued. Debounced because editing a task
  // dispatches several times in a row.
  useEffect(() => {
    if (!state.hydrated || !isNative) return;
    const enabled = state.settings.notificationsEnabled && entitlements.reminders;
    if (!enabled) {
      void cancelAllReminders();
      return;
    }
    const handle = window.setTimeout(() => {
      void notificationPermissionGranted().then((granted) => {
        if (granted) void syncScheduledReminders(state.tasks, true);
      });
    }, 800);
    return () => window.clearTimeout(handle);
  }, [state.hydrated, state.tasks, state.settings.notificationsEnabled, entitlements.reminders]);

  // Foreground reminder engine — raises the in-app alert the moment a reminder
  // comes due while the app is open. When the app is closed the OS-scheduled
  // notification handles it instead, so this covers only the open case.
  useInterval(() => {
    if (!state.settings.notificationsEnabled || !entitlements.reminders) return;
    const now = Date.now();
    state.tasks.forEach((task) => {
      if (task.status === 'completed' || task.reminderSent || !task.reminderAt) return;
      if (new Date(task.reminderAt).getTime() > now) return;
      dispatch({ type: 'update-task', payload: { id: task.id, patch: { reminderSent: true }, touch: false } });
      toast.gold('Reminder', task.title);
      // On native the scheduled notification has already been delivered; only
      // the browser path needs an extra push here.
      if (!isNative) void notifyNow('CampusKit Private', task.title);
    });
  }, 45_000);

  // Overdue sweep — nudges once per session for tasks that slipped past their
  // deadline, so they do not go unnoticed after a long break.
  const overdueAlerted = useRef(new Set<string>());
  useInterval(() => {
    if (!state.settings.notificationsEnabled) return;
    const overdue = state.tasks.filter((t) => isOverdue(t) && !t.archived);
    const fresh = overdue.filter((task) => !overdueAlerted.current.has(task.id));
    if (!fresh.length) return;
    fresh.forEach((task) => overdueAlerted.current.add(task.id));
    const lead = fresh[0];
    const extra = fresh.length > 1 ? ` and ${fresh.length - 1} more` : '';
    toast.gold('Overdue', `${lead.title}${extra}`);
    void notifyNow('CampusKit overdue', `${lead.title}${extra}`, 2);
  }, 120_000);

  const value = useMemo<WorkspaceValue>(
    () => ({
      state,
      tasks: state.tasks,
      categories: state.categories,
      settings: state.settings,
      subscription: state.subscription,
      plan,
      entitlements,
      isPremium,
      activeTaskCount,
      dispatch,
      gate,
      canAddTask,
      canAddCategory,
      getCategory,
      createTaskFrom,
      updateTask,
      toggleTask,
      deleteTask,
      duplicateTask,
      snoozeTask,
      bulk,
      addCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
      setSubscription,
      upgradeTo,
      cancelSubscription,
      resumeSubscription,
      importTasks,
      resetDemo,
      clearTasks,
      resetAll,
      exportAll,
    }),
    [
      state,
      plan,
      entitlements,
      isPremium,
      activeTaskCount,
      gate,
      canAddTask,
      canAddCategory,
      getCategory,
      createTaskFrom,
      updateTask,
      toggleTask,
      deleteTask,
      duplicateTask,
      snoozeTask,
      bulk,
      addCategory,
      updateCategory,
      deleteCategory,
      updateSettings,
      setSubscription,
      upgradeTo,
      cancelSubscription,
      resumeSubscription,
      importTasks,
      resetDemo,
      clearTasks,
      resetAll,
      exportAll,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used inside a WorkspaceProvider.');
  return ctx;
}
