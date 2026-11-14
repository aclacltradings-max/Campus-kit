import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from 'lucide-react';
import type { Task } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { SectionCard } from '@/components/common/SectionCard';
import { PremiumLock } from '@/components/common/PremiumLock';
import { PriorityPill } from '@/components/tasks/TaskMeta';
import { sortTasks } from '@/lib/tasks';
import {
  addDays,
  addMonths,
  endOfWeek,
  formatDate,
  formatTime,
  isToday,
  monthMatrix,
  monthName,
  startOfDay,
  startOfWeek,
  weekdayName,
} from '@/lib/date';
import { cn } from '@/lib/cn';

type View = 'day' | 'week' | 'month';

export function CalendarPage() {
  const { tasks, settings, entitlements } = useWorkspace();
  const { createTask, openTask } = useTaskDialog();
  const [requestedView, setView] = useState<View>('month');
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  // Free members only get the day view, so fall back to it rather than showing a locked screen.
  const view: View = entitlements.calendarWeekMonth ? requestedView : 'day';

  const scheduled = useMemo(() => tasks.filter((t) => !t.archived && t.dueDate), [tasks]);

  const byDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    scheduled.forEach((task) => {
      const key = formatDate(task.dueDate as string, 'YYYY-MM-DD');
      const bucket = map.get(key) ?? [];
      bucket.push(task);
      map.set(key, bucket);
    });
    return map;
  }, [scheduled]);

  const tasksForDay = (day: Date) =>
    sortTasks(
      (byDay.get(formatDate(day, 'YYYY-MM-DD')) ?? []).slice(),
      'due-asc',
    );

  const label = useMemo(() => {
    if (view === 'day') return formatDate(cursor);
    if (view === 'week') {
      const start = startOfWeek(cursor, settings.weekStartsOn);
      const end = endOfWeek(cursor, settings.weekStartsOn);
      return formatDate(start) + ' - ' + formatDate(end);
    }
    return monthName(cursor.getMonth()) + ' ' + cursor.getFullYear();
  }, [view, cursor, settings.weekStartsOn]);

  const shift = (dir: -1 | 1) => {
    if (view === 'day') setCursor((c) => addDays(c, dir));
    else if (view === 'week') setCursor((c) => addDays(c, dir * 7));
    else setCursor((c) => addMonths(c, dir));
  };

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="See your work as time. Switch between day, week and month."
        actions={
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={() => createTask(formatDate(cursor, 'YYYY-MM-DD'))}>
            New task
          </Button>
        }
      >
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Segmented
            value={view}
            onChange={(v) => setView(v as View)}
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Previous period"
              className="ck-btn-ghost h-9 w-9 rounded-lg p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(startOfDay(new Date()))}
              className="ck-btn-ghost h-9 px-3 text-[0.78rem]"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              aria-label="Next period"
              className="ck-btn-ghost h-9 w-9 rounded-lg p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <span className="font-display text-[1rem] font-semibold text-[rgb(var(--ck-text))]">{label}</span>
        </div>
      </PageHeader>

      {!entitlements.calendarWeekMonth && (
        <div className="mb-4">
          <PremiumLock
            compact
            title="Week and month views are Premium"
            description="Zoom out to see the shape of your month, plan around busy stretches and never double-book a deadline."
          />
        </div>
      )}

      {view === 'month' && (
        <MonthView
          cursor={cursor}
          weekStartsOn={settings.weekStartsOn}
          tasksForDay={tasksForDay}
          onOpen={openTask}
          onCreate={(date) => createTask(formatDate(date, 'YYYY-MM-DD'))}
        />
      )}

      {view === 'week' && (
        <WeekView
          cursor={cursor}
          weekStartsOn={settings.weekStartsOn}
          timeFormat={settings.timeFormat}
          tasksForDay={tasksForDay}
          onOpen={openTask}
          onCreate={(date) => createTask(formatDate(date, 'YYYY-MM-DD'))}
        />
      )}

      {view === 'day' && (
        <DayView
          cursor={cursor}
          tasks={tasksForDay(cursor)}
          onOpen={openTask}
          onCreate={() => createTask(formatDate(cursor, 'YYYY-MM-DD'))}
        />
      )}
    </>
  );
}

function MonthView({
  cursor,
  weekStartsOn,
  tasksForDay,
  onOpen,
  onCreate,
}: {
  cursor: Date;
  weekStartsOn: 0 | 1;
  tasksForDay: (day: Date) => Task[];
  onOpen: (task: Task) => void;
  onCreate: (day: Date) => void;
}) {
  const matrix = useMemo(
    () => monthMatrix(cursor.getFullYear(), cursor.getMonth(), weekStartsOn),
    [cursor, weekStartsOn],
  );
  const weekdays = Array.from({ length: 7 }, (_, i) => weekdayName((weekStartsOn + i) % 7, true));

  return (
    <div className="ck-card overflow-hidden p-0 animate-fade-up">
      <div className="grid grid-cols-7 border-b border-[rgb(var(--ck-border)/0.08)]">
        {weekdays.map((day) => (
          <div key={day} className="px-2 py-2.5 text-center text-[0.66rem] font-semibold uppercase tracking-wider ck-faint">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {matrix.flat().map((day, index) => {
          const dayTasks = tasksForDay(day);
          const inMonth = day.getMonth() === cursor.getMonth();
          const today = isToday(day);
          return (
            <div
              key={index}
              className={cn(
                'group relative min-h-[5.5rem] border-b border-r border-[rgb(var(--ck-border)/0.06)] p-1.5 transition-colors',
                !inMonth && 'opacity-40',
                'hover:bg-[rgb(var(--ck-border)/0.03)]',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-lg text-[0.72rem] font-semibold',
                    today ? 'bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950' : 'text-[rgb(var(--ck-text-muted))]',
                  )}
                >
                  {day.getDate()}
                </span>
                <button
                  type="button"
                  onClick={() => onCreate(day)}
                  aria-label="Add task on this day"
                  className="ck-btn-quiet h-6 w-6 rounded-md opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1 space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onOpen(task)}
                    className={cn(
                      'flex w-full items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-left text-[0.66rem] font-medium transition-colors',
                      task.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 line-through'
                        : 'bg-gold-500/10 text-gold-200 hover:bg-gold-500/18',
                    )}
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                    <span className="truncate">{task.title}</span>
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <p className="px-1.5 text-[0.62rem] ck-faint">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  cursor,
  weekStartsOn,
  timeFormat,
  tasksForDay,
  onOpen,
  onCreate,
}: {
  cursor: Date;
  weekStartsOn: 0 | 1;
  timeFormat: '12h' | '24h';
  tasksForDay: (day: Date) => Task[];
  onOpen: (task: Task) => void;
  onCreate: (day: Date) => void;
}) {
  const start = startOfWeek(cursor, weekStartsOn);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((day, index) => {
        const dayTasks = tasksForDay(day);
        const today = isToday(day);
        return (
          <div
            key={index}
            className={cn(
              'ck-card min-h-[14rem] p-3 animate-fade-up',
              today && 'border-gold-500/45 shadow-glow',
            )}
            style={{ animationDelay: index * 40 + 'ms' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[0.66rem] font-semibold uppercase tracking-wider ck-faint">
                  {weekdayName(day.getDay(), true)}
                </p>
                <p className={cn('font-display text-[1.05rem] font-semibold', today ? 'ck-gold-text' : 'text-[rgb(var(--ck-text))]')}>
                  {day.getDate()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onCreate(day)}
                aria-label="Add task on this day"
                className="ck-btn-quiet h-7 w-7 rounded-lg"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {dayTasks.length === 0 ? (
              <p className="text-[0.72rem] ck-faint">No tasks</p>
            ) : (
              <ul className="space-y-2">
                {dayTasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(task)}
                      className={cn(
                        'w-full rounded-lg border px-2.5 py-2 text-left transition-colors',
                        task.status === 'completed'
                          ? 'border-emerald-500/25 bg-emerald-500/8'
                          : 'border-[rgb(var(--ck-border)/0.1)] hover:border-gold-500/40',
                      )}
                    >
                      <span
                        className={cn(
                          'block truncate text-[0.76rem] font-medium',
                          task.status === 'completed' ? 'ck-faint line-through' : 'text-[rgb(var(--ck-text))]',
                        )}
                      >
                        {task.title}
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[0.64rem] ck-faint">
                            <Clock className="h-2.5 w-2.5" />
                            {formatTime(task.dueDate, timeFormat)}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  cursor,
  tasks,
  onOpen,
  onCreate,
}: {
  cursor: Date;
  tasks: Task[];
  onOpen: (task: Task) => void;
  onCreate: () => void;
}) {
  const { settings } = useWorkspace();
  const timed = tasks.filter((t) => t.dueDate);
  const untimed = tasks.filter((t) => !t.dueDate);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <SectionCard
        title={formatDate(cursor, settings.dateFormat)}
        subtitle={tasks.length + ' task' + (tasks.length === 1 ? '' : 's') + ' scheduled'}
        action={
          <Button variant="ghost" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={onCreate}>
            Add
          </Button>
        }
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/25 bg-gold-500/8 text-gold-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <p className="text-[0.84rem] ck-muted">Nothing scheduled for this day.</p>
            <Button variant="gold" size="sm" onClick={onCreate}>
              Plan something
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onOpen(task)}
                  className="flex w-full items-start gap-3 rounded-xl border border-[rgb(var(--ck-border)/0.1)] px-3.5 py-3 text-left transition-colors hover:border-gold-500/40"
                >
                  <span className="mt-0.5 shrink-0 font-mono text-[0.72rem] ck-muted">
                    {formatTime(task.dueDate as string, settings.timeFormat)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block text-[0.86rem] font-semibold',
                        task.status === 'completed' ? 'ck-faint line-through' : 'text-[rgb(var(--ck-text))]',
                      )}
                    >
                      {task.title}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                      <PriorityPill task={task} />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Day summary" subtitle="At a glance">
        <dl className="space-y-3">
          <SummaryRow label="Scheduled" value={String(tasks.length)} />
          <SummaryRow label="With a time" value={String(timed.length)} />
          <SummaryRow label="No time set" value={String(untimed.length)} />
          <SummaryRow
            label="Completed"
            value={String(tasks.filter((t) => t.status === 'completed').length)}
          />
        </dl>
      </SectionCard>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[0.8rem] ck-muted">{label}</dt>
      <dd className="font-display text-[0.95rem] font-semibold text-[rgb(var(--ck-text))]">{value}</dd>
    </div>
  );
}
