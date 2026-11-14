import { CalendarClock, Clock, Repeat, ListChecks } from 'lucide-react';
import type { Task } from '@/types';
import { priorityMeta, STATUS_META } from '@/lib/priority';
import { formatDateTime, isToday, isTomorrow, relativeDayLabel } from '@/lib/date';
import { RECURRENCE_LABEL, isOverdue, subtaskProgress } from '@/lib/tasks';
import { cn } from '@/lib/cn';

export function PriorityPill({ task, className }: { task: Task; className?: string }) {
  const meta = priorityMeta(task.priority);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold',
        meta.bg,
        meta.border,
        meta.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function StatusPill({ status, className }: { status: Task['status']; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold',
        meta.bg,
        meta.border,
        meta.text,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function DueLabel({
  task,
  dateFormat,
  timeFormat,
  className,
}: {
  task: Task;
  dateFormat: Parameters<typeof formatDateTime>[1];
  timeFormat: Parameters<typeof formatDateTime>[2];
  className?: string;
}) {
  if (!task.dueDate) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[0.75rem] ck-faint', className)}>
        <CalendarClock className="h-3.5 w-3.5" />
        No deadline
      </span>
    );
  }
  const overdue = isOverdue(task);
  const soon = isToday(task.dueDate) || isTomorrow(task.dueDate);
  const label = isToday(task.dueDate) || isTomorrow(task.dueDate)
    ? relativeDayLabel(task.dueDate)
    : formatDateTime(task.dueDate, dateFormat, timeFormat);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[0.75rem] font-medium',
        overdue ? 'text-rose-400' : soon ? 'text-gold-300' : 'ck-muted',
        className,
      )}
    >
      <CalendarClock className="h-3.5 w-3.5" />
      {overdue ? `Overdue · ${label}` : label}
    </span>
  );
}

export function TaskMetaRow({
  task,
  dateFormat,
  timeFormat,
}: {
  task: Task;
  dateFormat: Parameters<typeof formatDateTime>[1];
  timeFormat: Parameters<typeof formatDateTime>[2];
}) {
  const progress = subtaskProgress(task);
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <DueLabel task={task} dateFormat={dateFormat} timeFormat={timeFormat} />
      {task.recurrence !== 'none' && (
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-gold-300">
          <Repeat className="h-3.5 w-3.5" />
          {RECURRENCE_LABEL[task.recurrence]}
        </span>
      )}
      {progress.total > 0 && (
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] ck-muted">
          <ListChecks className="h-3.5 w-3.5" />
          {progress.done}/{progress.total} steps
        </span>
      )}
      {task.estimatedMinutes ? (
        <span className="inline-flex items-center gap-1.5 text-[0.75rem] ck-muted">
          <Clock className="h-3.5 w-3.5" />
          {task.estimatedMinutes}m
        </span>
      ) : null}
    </div>
  );
}
