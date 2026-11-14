import { useMemo } from 'react';
import { CalendarClock, ListPlus, Plus, Sun } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCollection } from '@/components/tasks/TaskCollection';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/Button';
import { RingProgress } from '@/components/ui/ProgressBar';
import { isDueToday, isOverdue, sortTasks } from '@/lib/tasks';
import { formatDate, isToday } from '@/lib/date';

export function MyDayPage() {
  const { tasks, settings } = useWorkspace();
  const { createTask, openTask, editTask } = useTaskDialog();

  const focus = useMemo(
    () =>
      sortTasks(
        tasks.filter((t) => !t.archived && t.inMyDay && t.status !== 'completed'),
        'due-asc',
      ),
    [tasks],
  );

  const done = useMemo(
    () =>
      sortTasks(
        tasks.filter((t) => !t.archived && t.inMyDay && t.status === 'completed'),
        'updated-desc',
      ),
    [tasks],
  );

  const suggestions = useMemo(
    () =>
      sortTasks(
        tasks.filter(
          (t) => !t.archived && !t.inMyDay && t.status !== 'completed' && (isDueToday(t) || isOverdue(t)),
        ),
        'due-asc',
      ).slice(0, 5),
    [tasks],
  );

  const completion =
    focus.length + done.length > 0 ? Math.round((done.length / (focus.length + done.length)) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Daily focus"
        title="My Day"
        description={
          'Your deliberate plan for ' +
          formatDate(new Date(), settings.dateFormat) +
          '. Keep it short and finish strong.'
        }
        actions={
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={() => createTask()}>
            Add task
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-4">
          <TaskCollection
            tasks={focus}
            onOpen={openTask}
            onEdit={editTask}
            emptyIcon={<Sun className="h-6 w-6" />}
            emptyTitle="Nothing on your day yet"
            emptyDescription="Add tasks from the suggestions on the right, or create something new."
            emptyAction={
              <Button
                variant="gold"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => createTask()}
              >
                Add a task
              </Button>
            }
          />

          {done.length > 0 && (
            <SectionCard title="Completed today" subtitle={done.length + ' finished'}>
              <TaskCollection
                tasks={done}
                onOpen={openTask}
                onEdit={editTask}
                compact
                selectable={false}
                emptyIcon={<Sun className="h-6 w-6" />}
                emptyTitle="Nothing completed yet"
              />
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Progress" subtitle="Today's completion">
            <div className="flex flex-col items-center gap-3">
              <RingProgress value={completion} size={120} stroke={9}>
                <span className="font-display text-[1.5rem] font-semibold text-[rgb(var(--ck-text))]">
                  {completion}%
                </span>
              </RingProgress>
              <p className="text-center text-[0.78rem] ck-muted">
                {done.length} of {done.length + focus.length} done
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Suggested for today"
            subtitle="Due now or overdue"
            action={<CalendarClock className="h-4 w-4 text-gold-400" />}
          >
            {suggestions.length === 0 ? (
              <p className="text-[0.8rem] ck-muted">Nothing else is pressing today.</p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => openTask(task)}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-[rgb(var(--ck-border)/0.08)] px-3 py-2.5 text-left transition-colors hover:border-gold-500/35"
                    >
                      <ListPlus className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                      <span className="min-w-0 flex-1 truncate text-[0.8rem] font-medium text-[rgb(var(--ck-text))]">
                        {task.title}
                      </span>
                      {task.dueDate && isToday(task.dueDate) && (
                        <span className="shrink-0 text-[0.66rem] font-semibold text-gold-300">Today</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
}
