import { useMemo, useState } from 'react';
import { CalendarRange, ChevronDown, Plus } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCollection } from '@/components/tasks/TaskCollection';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { isOverdue, sortTasks } from '@/lib/tasks';
import { formatDate, startOfDay } from '@/lib/date';

type Horizon = '7' | '30' | '90' | 'all';

export function UpcomingPage() {
  const { tasks, settings } = useWorkspace();
  const { createTask, openTask, editTask } = useTaskDialog();
  const [horizon, setHorizon] = useState<Horizon>('30');
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const upcoming = useMemo(() => {
    const now = startOfDay(new Date()).getTime();
    const limit = horizon === 'all' ? Infinity : now + Number(horizon) * 86_400_000;
    return sortTasks(
      tasks.filter((t) => {
        if (t.archived || t.status === 'completed' || !t.dueDate) return false;
        const due = startOfDay(t.dueDate).getTime();
        return due >= now && due <= limit && !isOverdue(t);
      }),
      'due-asc',
    );
  }, [tasks, horizon]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof upcoming>();
    upcoming.forEach((task) => {
      const key = formatDate(task.dueDate as string, 'YYYY-MM-DD');
      const bucket = map.get(key) ?? [];
      bucket.push(task);
      map.set(key, bucket);
    });
    return Array.from(map.entries());
  }, [upcoming]);

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="Upcoming"
        description="Everything with a deadline ahead, grouped by day so nothing slips."
        actions={
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={() => createTask()}>
            New task
          </Button>
        }
      >
        <div className="mt-4">
          <Segmented
            value={horizon}
            onChange={(v) => setHorizon(v as Horizon)}
            options={[
              { value: '7', label: 'Next 7 days' },
              { value: '30', label: 'Next 30 days' },
              { value: '90', label: 'Next 90 days' },
              { value: 'all', label: 'All' },
            ]}
          />
        </div>
      </PageHeader>

      {groups.length === 0 ? (
        <TaskCollection
          tasks={[]}
          onOpen={openTask}
          onEdit={editTask}
          emptyIcon={<CalendarRange className="h-6 w-6" />}
          emptyTitle="Nothing scheduled"
          emptyDescription="No deadlines inside this window. Try widening the horizon."
        />
      ) : (
        <div className="space-y-4">
          {groups.map(([date, list]) => {
            const isCollapsed = collapsed.includes(date);
            return (
              <SectionCard
                key={date}
                title={formatDate(date, settings.dateFormat)}
                subtitle={list.length + ' task' + (list.length === 1 ? '' : 's')}
                action={
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsed((prev) =>
                        prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
                      )
                    }
                    aria-label={isCollapsed ? 'Expand day' : 'Collapse day'}
                    className="ck-btn-quiet h-8 w-8 rounded-lg"
                  >
                    <ChevronDown
                      className={'h-4 w-4 transition-transform ' + (isCollapsed ? '-rotate-90' : '')}
                    />
                  </button>
                }
              >
                {isCollapsed ? (
                  <p className="text-[0.8rem] ck-faint">Collapsed - {list.length} hidden.</p>
                ) : (
                  <TaskCollection
                    tasks={list}
                    onOpen={openTask}
                    onEdit={editTask}
                    compact
                    emptyIcon={<CalendarRange className="h-6 w-6" />}
                    emptyTitle="Nothing here"
                  />
                )}
              </SectionCard>
            );
          })}
        </div>
      )}
    </>
  );
}
