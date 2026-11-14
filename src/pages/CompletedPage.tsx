import { useMemo, useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCollection } from '@/components/tasks/TaskCollection';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/common/StatCard';
import { Segmented } from '@/components/ui/Segmented';
import { computeStats, sortTasks } from '@/lib/tasks';
import { exportTasks } from '@/lib/export';
import { startOfDay, addDays } from '@/lib/date';

type Range = 'all' | 'today' | 'week' | 'month';

export function CompletedPage() {
  const { tasks, categories, entitlements } = useWorkspace();
  const { openTask, editTask } = useTaskDialog();
  const toast = useToast();
  const [range, setRange] = useState<Range>('all');

  const stats = useMemo(() => computeStats(tasks), [tasks]);

  const completed = useMemo(() => {
    const now = new Date();
    const windowStart =
      range === 'today'
        ? startOfDay(now)
        : range === 'week'
          ? addDays(startOfDay(now), -6)
          : range === 'month'
            ? addDays(startOfDay(now), -29)
            : null;

    return sortTasks(
      tasks.filter((t) => {
        if (t.status !== 'completed') return false;
        if (!windowStart) return true;
        if (!t.completedAt) return false;
        return new Date(t.completedAt) >= windowStart;
      }),
      'updated-desc',
    );
  }, [tasks, range]);

  return (
    <>
      <PageHeader
        eyebrow="Progress"
        title="Completed"
        description="A record of everything you have finished, ready to celebrate and export."
        actions={
          <Button
            variant="ghost"
            icon={<Download className="h-4 w-4" />}
            onClick={async () => {
              const message = await exportTasks(
                entitlements.exportFormats.includes('csv') ? 'csv' : 'json',
                completed,
                categories,
                { total: stats.total, completed: stats.completed },
              );
              toast.success('Export ready', message);
            }}
          >
            Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="All time" value={stats.completed} icon={<CheckCircle2 className="h-4.5 w-4.5" />} tone="success" delay={0} />
        <StatCard label="Today" value={stats.completedToday} icon={<CheckCircle2 className="h-4.5 w-4.5" />} tone="gold" delay={60} />
        <StatCard label="This week" value={stats.completedThisWeek} icon={<CheckCircle2 className="h-4.5 w-4.5" />} tone="gold" delay={120} />
        <StatCard label="Rate" value={stats.completionRate + '%'} icon={<CheckCircle2 className="h-4.5 w-4.5" />} tone="neutral" delay={180} />
      </div>

      <div className="my-4">
        <Segmented
          value={range}
          onChange={(v) => setRange(v as Range)}
          options={[
            { value: 'all', label: 'All time' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This week' },
            { value: 'month', label: 'This month' },
          ]}
        />
      </div>

      <TaskCollection
        tasks={completed}
        onOpen={openTask}
        onEdit={editTask}
        emptyIcon={<CheckCircle2 className="h-6 w-6" />}
        emptyTitle="Nothing completed yet"
        emptyDescription="Finished tasks will collect here so you can see your momentum."
      />
    </>
  );
}
