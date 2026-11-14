import { useMemo } from 'react';
import { AlarmClock, CalendarClock, TriangleAlert } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCollection } from '@/components/tasks/TaskCollection';
import { StatCard } from '@/components/common/StatCard';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/Button';
import { isOverdue, sortTasks } from '@/lib/tasks';
import { diffInDays } from '@/lib/date';

export function OverduePage() {
  const { tasks, snoozeTask } = useWorkspace();
  const { openTask, editTask, createTask } = useTaskDialog();

  const overdue = useMemo(
    () => sortTasks(tasks.filter((t) => !t.archived && isOverdue(t)), 'due-asc'),
    [tasks],
  );

  const criticallyLate = overdue.filter((t) => Math.abs(diffInDays(new Date(), t.dueDate as string)) > 3);

  return (
    <>
      <PageHeader
        eyebrow="Attention"
        title="Overdue"
        description="Deadlines that have passed. Clear these first to rebuild momentum."
        actions={
          <Button variant="gold" onClick={() => createTask()}>
            New task
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          label="Overdue"
          value={overdue.length}
          icon={<TriangleAlert className="h-4.5 w-4.5" />}
          tone={overdue.length ? 'danger' : 'success'}
          hint={overdue.length ? 'Reschedule or finish' : 'Nothing overdue'}
          delay={0}
        />
        <StatCard
          label="More than 3 days late"
          value={criticallyLate.length}
          icon={<AlarmClock className="h-4.5 w-4.5" />}
          tone="warning"
          delay={60}
        />
        <StatCard
          label="Total active"
          value={tasks.filter((t) => !t.archived && t.status !== 'completed').length}
          icon={<CalendarClock className="h-4.5 w-4.5" />}
          tone="neutral"
          delay={120}
        />
      </div>

      {overdue.length > 0 && (
        <SectionCard className="mt-4" title="Quick reschedule" subtitle="Push everything forward in one pass">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => overdue.forEach((t) => snoozeTask(t.id, 1))}>
              Snooze all by 1 day
            </Button>
            <Button variant="ghost" size="sm" onClick={() => overdue.forEach((t) => snoozeTask(t.id, 3))}>
              Snooze all by 3 days
            </Button>
          </div>
        </SectionCard>
      )}

      <div className="mt-4">
        <TaskCollection
          tasks={overdue}
          onOpen={openTask}
          onEdit={editTask}
          emptyIcon={<TriangleAlert className="h-6 w-6" />}
          emptyTitle="Nothing overdue"
          emptyDescription="You are completely on top of every deadline. Beautiful work."
          emptyAction={
            <Button variant="gold" size="sm" onClick={() => createTask()}>
              Plan something new
            </Button>
          }
        />
      </div>
    </>
  );
}
