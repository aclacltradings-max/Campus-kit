import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Task } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { onNotificationTap } from '@/lib/notifications';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';

interface TaskDialogValue {
  createTask: (defaultDate?: string | null) => void;
  editTask: (task: Task) => void;
  openTask: (task: Task) => void;
  closeAll: () => void;
}

const TaskDialogContext = createContext<TaskDialogValue | null>(null);

export function TaskDialogProvider({ children }: { children: ReactNode }) {
  const { tasks } = useWorkspace();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const createTask = useCallback((date?: string | null) => {
    setEditing(null);
    setDefaultDate(date ?? null);
    setDetailId(null);
    setFormOpen(true);
  }, []);

  const editTask = useCallback((task: Task) => {
    setEditing(task);
    setDefaultDate(null);
    setDetailId(null);
    setFormOpen(true);
  }, []);

  const openTask = useCallback((task: Task) => {
    setDetailId(task.id);
  }, []);

  // Opening a reminder should land on the task it refers to. The tap can arrive
  // before the task list has hydrated, so remember the id and apply it once the
  // task appears.
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const pendingTaskId = useRef<string | null>(null);

  useEffect(() => {
    return onNotificationTap((taskId) => {
      const task = tasksRef.current.find((t) => t.id === taskId);
      if (task) setDetailId(task.id);
      else pendingTaskId.current = taskId;
    });
  }, []);

  useEffect(() => {
    const id = pendingTaskId.current;
    if (!id) return;
    const task = tasks.find((t) => t.id === id);
    if (task) {
      pendingTaskId.current = null;
      setDetailId(task.id);
    }
  }, [tasks]);

  const closeAll = useCallback(() => {
    setFormOpen(false);
    setDetailId(null);
    setEditing(null);
  }, []);

  const value = useMemo<TaskDialogValue>(
    () => ({ createTask, editTask, openTask, closeAll }),
    [createTask, editTask, openTask, closeAll],
  );

  const detailTask = detailId ? tasks.find((t) => t.id === detailId) ?? null : null;

  return (
    <TaskDialogContext.Provider value={value}>
      {children}
      <TaskFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        task={editing}
        defaultDate={defaultDate}
      />
      <TaskDetailDrawer task={detailTask} onClose={() => setDetailId(null)} onEdit={editTask} />
    </TaskDialogContext.Provider>
  );
}

export function useTaskDialog(): TaskDialogValue {
  const ctx = useContext(TaskDialogContext);
  if (!ctx) throw new Error('useTaskDialog must be used inside a TaskDialogProvider.');
  return ctx;
}
