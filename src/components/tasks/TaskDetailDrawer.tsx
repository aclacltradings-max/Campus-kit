import { useEffect, useState, type ReactNode } from 'react';
import {
  AlarmClock,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Flag,
  Pencil,
  Play,
  Repeat,
  Star,
  Trash2,
  Undo2,
} from 'lucide-react';
import type { Task } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PriorityPill, StatusPill } from '@/components/tasks/TaskMeta';
import { RECURRENCE_LABEL, isOverdue, subtaskProgress } from '@/lib/tasks';
import { formatDateTime, relativeTimeFromNow } from '@/lib/date';
import { cn } from '@/lib/cn';

interface TaskDetailDrawerProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export function TaskDetailDrawer({ task, onClose, onEdit }: TaskDetailDrawerProps) {
  const { toggleTask, deleteTask, duplicateTask, updateTask, snoozeTask, getCategory, settings } =
    useWorkspace();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [task?.id]);

  if (!task) return null;

  const category = getCategory(task.categoryId);
  const progress = subtaskProgress(task);
  const done = task.status === 'completed';

  return (
    <>
      <Drawer
        open={Boolean(task)}
        onClose={onClose}
        title={task.title}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <PriorityPill task={task} />
            <StatusPill status={task.status} />
            {category && (
              <span className="inline-flex items-center gap-1.5" style={{ color: category.color }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}
          </span>
        }
        footer={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={done ? 'ghost' : 'gold'}
              onClick={() => toggleTask(task.id)}
              icon={done ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
            >
              {done ? 'Reopen task' : 'Mark complete'}
            </Button>
            <Button variant="ghost" onClick={() => onEdit(task)} icon={<Pencil className="h-4 w-4" />}>
              Edit
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="quiet"
                size="icon"
                aria-label="Duplicate task"
                onClick={() => duplicateTask(task.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="quiet"
                size="icon"
                aria-label="Delete task"
                className="hover:text-rose-400"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => updateTask(task.id, { inMyDay: !task.inMyDay })}
              className={cn(
                'ck-chip transition-colors hover:border-gold-500/45',
                task.inMyDay && 'text-gold-300',
              )}
            >
              <Star className={cn('h-3.5 w-3.5', task.inMyDay && 'fill-current')} />
              {task.inMyDay ? 'In My Day' : 'Add to My Day'}
            </button>
            {task.status !== 'in_progress' && !done && (
              <button
                type="button"
                onClick={() => updateTask(task.id, { status: 'in_progress' })}
                className="ck-chip transition-colors hover:border-gold-500/45"
              >
                <Play className="h-3.5 w-3.5" />
                Start working
              </button>
            )}
            <button
              type="button"
              onClick={() => snoozeTask(task.id, 1)}
              className="ck-chip transition-colors hover:border-gold-500/45"
            >
              <AlarmClock className="h-3.5 w-3.5" />
              Snooze 1 day
            </button>
          </div>

          <section>
            <h3 className="ck-eyebrow mb-2">Description</h3>
            {task.description ? (
              <p className="whitespace-pre-wrap text-[0.86rem] leading-relaxed text-[rgb(var(--ck-text-muted))]">
                {task.description}
              </p>
            ) : (
              <p className="text-[0.82rem] ck-faint">No description yet.</p>
            )}
          </section>

          <section className="grid grid-cols-2 gap-3">
            <DetailTile
              icon={<CalendarDays className="h-4 w-4" />}
              label="Deadline"
              value={
                task.dueDate
                  ? formatDateTime(task.dueDate, settings.dateFormat, settings.timeFormat)
                  : 'None'
              }
              tone={isOverdue(task) ? 'danger' : undefined}
              sub={task.dueDate ? relativeTimeFromNow(task.dueDate) : undefined}
            />
            <DetailTile
              icon={<AlarmClock className="h-4 w-4" />}
              label="Reminder"
              value={
                task.reminderAt
                  ? formatDateTime(task.reminderAt, settings.dateFormat, settings.timeFormat)
                  : 'None'
              }
              sub={task.reminderAt ? relativeTimeFromNow(task.reminderAt) : undefined}
            />
            <DetailTile
              icon={<Repeat className="h-4 w-4" />}
              label="Repeats"
              value={RECURRENCE_LABEL[task.recurrence]}
            />
            <DetailTile
              icon={<Clock className="h-4 w-4" />}
              label="Estimate"
              value={task.estimatedMinutes ? task.estimatedMinutes + ' minutes' : 'Not set'}
            />
          </section>

          {progress.total > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="ck-eyebrow">Subtasks</h3>
                <span className="text-[0.72rem] ck-faint">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <ProgressBar value={progress.done} max={progress.total} size="sm" className="mb-3" />
              <ul className="space-y-1.5">
                {task.subtasks.map((subtask) => (
                  <li key={subtask.id}>
                    <button
                      type="button"
                      onClick={() =>
                        updateTask(task.id, {
                          subtasks: task.subtasks.map((s) =>
                            s.id === subtask.id ? { ...s, done: !s.done } : s,
                          ),
                        })
                      }
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[rgb(var(--ck-border)/0.05)]"
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                          subtask.done
                            ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400'
                            : 'border-[rgb(var(--ck-border)/0.24)]',
                        )}
                      >
                        {subtask.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                      </span>
                      <span
                        className={cn(
                          'text-[0.84rem]',
                          subtask.done ? 'ck-strike ck-faint' : 'text-[rgb(var(--ck-text))]',
                        )}
                      >
                        {subtask.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {task.tags.length > 0 && (
            <section>
              <h3 className="ck-eyebrow mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span key={tag} className="ck-tag">
                    <Flag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="ck-eyebrow mb-2">History</h3>
            <dl className="space-y-2 text-[0.78rem]">
              <div className="flex items-center justify-between gap-4">
                <dt className="ck-faint">Created</dt>
                <dd className="ck-muted">
                  {formatDateTime(task.createdAt, settings.dateFormat, settings.timeFormat)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="ck-faint">Last updated</dt>
                <dd className="ck-muted">
                  {formatDateTime(task.updatedAt, settings.dateFormat, settings.timeFormat)}
                </dd>
              </div>
              {task.completedAt && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="ck-faint">Completed</dt>
                  <dd className="text-emerald-400">
                    {formatDateTime(task.completedAt, settings.dateFormat, settings.timeFormat)}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this task?"
        description="This task will be removed from this device. This cannot be undone."
        confirmLabel="Delete task"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteTask(task.id);
          setConfirmDelete(false);
          onClose();
        }}
      />
    </>
  );
}

function DetailTile({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: 'danger';
}) {
  return (
    <div className="ck-inset rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wide ck-faint">
        <span className={tone === 'danger' ? 'text-rose-400' : 'text-gold-400'}>{icon}</span>
        {label}
      </div>
      <p
        className={cn(
          'mt-1.5 text-[0.82rem] font-medium',
          tone === 'danger' ? 'text-rose-400' : 'text-[rgb(var(--ck-text))]',
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[0.68rem] ck-faint">{sub}</p>}
    </div>
  );
}
