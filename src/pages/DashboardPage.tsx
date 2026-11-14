import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  CheckCircle2,
  Clock,
  Flame,
  ListTodo,
  Plus,
  Sparkles,
  Sun,
  TriangleAlert,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { SectionCard } from '@/components/common/SectionCard';
import { TaskCollection } from '@/components/tasks/TaskCollection';
import { RingProgress } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ProductivityTrendChart, StatusDonutChart } from '@/components/charts/Charts';
import { computeStats, isDueToday, isOverdue, buildTrend, sortTasks } from '@/lib/tasks';
import { greeting } from '@/lib/date';
import { priorityMeta } from '@/lib/priority';
import { cn } from '@/lib/cn';

export function DashboardPage() {
  const { tasks, settings, isPremium, subscription } = useWorkspace();
  const { createTask, openTask, editTask } = useTaskDialog();

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const trend = useMemo(() => buildTrend(tasks, 14), [tasks]);

  const todayTasks = useMemo(
    () =>
      sortTasks(
        tasks.filter((t) => !t.archived && t.status !== 'completed' && (isDueToday(t) || t.inMyDay)),
        'due-asc',
      ),
    [tasks],
  );

  const overdue = useMemo(
    () => sortTasks(tasks.filter((t) => !t.archived && isOverdue(t)), 'due-asc'),
    [tasks],
  );

  const upcoming = useMemo(
    () =>
      sortTasks(
        tasks.filter(
          (t) =>
            !t.archived &&
            t.status !== 'completed' &&
            t.dueDate &&
            !isDueToday(t) &&
            !isOverdue(t),
        ),
        'due-asc',
      ).slice(0, 4),
    [tasks],
  );

  const statusData = [
    { name: 'Completed', value: stats.completed },
    { name: 'In progress', value: stats.inProgress },
    { name: 'Pending', value: Math.max(0, stats.pending - stats.inProgress) },
    { name: 'Overdue', value: stats.overdue },
  ];

  const completedThisWeek = trend.slice(-7).reduce((sum, point) => sum + point.completed, 0);
  const createdThisWeek = trend.slice(-7).reduce((sum, point) => sum + point.created, 0);
  const momentum = completedThisWeek - createdThisWeek;

  return (
    <>
      <PageHeader
        eyebrow={greeting()}
        title={settings.displayName ? 'Welcome back, ' + settings.displayName : 'Your workspace'}
        description="A calm, precise view of everything that matters today, this week and beyond."
        actions={
          <>
            <Link to="/app/calendar" className="ck-btn-ghost h-10 px-4">
              <CalendarRange className="h-4 w-4" />
              Calendar
            </Link>
            <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={() => createTask()}>
              New task
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.total}
          icon={<ListTodo className="h-4.5 w-4.5" />}
          hint={stats.total ? stats.completionRate + '% complete' : 'Start by adding a task'}
          delay={0}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          tone="success"
          hint={stats.completedToday + ' finished today'}
          delay={60}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock className="h-4.5 w-4.5" />}
          tone="warning"
          hint={stats.inProgress + ' in progress'}
          delay={120}
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={<TriangleAlert className="h-4.5 w-4.5" />}
          tone={stats.overdue > 0 ? 'danger' : 'neutral'}
          hint={stats.overdue ? 'Needs attention' : 'All clear'}
          delay={180}
        />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <SectionCard
          title="Productivity trend"
          subtitle="Tasks created and completed over the last two weeks"
          action={
            <span className="ck-chip">
              <Flame className="h-3.5 w-3.5 text-gold-400" />
              {momentum >= 0 ? '+' + momentum + ' net' : momentum + ' net'} this week
            </span>
          }
        >
          <ProductivityTrendChart data={trend} />
        </SectionCard>

        <SectionCard title="Completion rate" subtitle="Across every active task">
          <div className="flex flex-col items-center gap-5">
            <RingProgress value={stats.completionRate} size={148} stroke={11}>
              <span className="font-display text-[2rem] font-semibold leading-none text-[rgb(var(--ck-text))]">
                {stats.completionRate}%
              </span>
              <span className="mt-1 text-[0.68rem] uppercase tracking-widest ck-faint">complete</span>
            </RingProgress>
            <dl className="grid w-full grid-cols-2 gap-3">
              <Metric label="Avg. time to finish" value={stats.avgCompletionDays + ' days'} />
              <Metric label="Focus logged" value={Math.round(stats.focusMinutes / 60) + 'h'} />
              <Metric label="Completed this week" value={String(stats.completedThisWeek)} />
              <Metric label="Due today" value={String(stats.dueToday)} />
            </dl>
          </div>
        </SectionCard>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <SectionCard
          title="Today's focus"
          subtitle={todayTasks.length ? todayTasks.length + ' tasks on deck' : 'Nothing scheduled for today'}
          action={
            <Link
              to="/app/my-day"
              className="inline-flex items-center gap-1 text-[0.76rem] font-semibold text-gold-300 hover:underline"
            >
              Open My Day <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <TaskCollection
            tasks={todayTasks.slice(0, 5)}
            onOpen={openTask}
            onEdit={editTask}
            compact
            emptyIcon={<Sun className="h-6 w-6" />}
            emptyTitle="Your day is clear"
            emptyDescription="Add a task to My Day, or pick something from Upcoming."
            emptyAction={
              <Button variant="gold" size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => createTask()}>
                Add a task
              </Button>
            }
          />
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Status split" subtitle="Where your work currently sits">
            <StatusDonutChart data={statusData} />
          </SectionCard>

          <SectionCard
            title="Overdue"
            subtitle={overdue.length ? overdue.length + ' need attention' : 'Nothing overdue'}
            action={
              overdue.length > 0 ? (
                <Link
                  to="/app/overdue"
                  className="text-[0.76rem] font-semibold text-rose-400 hover:underline"
                >
                  Review all
                </Link>
              ) : null
            }
          >
            {overdue.length === 0 ? (
              <p className="flex items-center gap-2 text-[0.82rem] text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Every deadline is under control.
              </p>
            ) : (
              <ul className="space-y-2">
                {overdue.slice(0, 4).map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => openTask(task)}
                      className="flex w-full items-center gap-3 rounded-xl border border-[rgb(var(--ck-border)/0.08)] px-3 py-2.5 text-left transition-colors hover:border-rose-500/35"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      <span className="min-w-0 flex-1 truncate text-[0.82rem] font-medium text-[rgb(var(--ck-text))]">
                        {task.title}
                      </span>
                      <span className={cn('text-[0.68rem] font-semibold', priorityMeta(task.priority).text)}>
                        {priorityMeta(task.priority).label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Coming up"
          subtitle="The next deadlines on your horizon"
          action={
            <Link
              to="/app/upcoming"
              className="inline-flex items-center gap-1 text-[0.76rem] font-semibold text-gold-300 hover:underline"
            >
              View schedule <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <p className="text-[0.82rem] ck-muted">No upcoming deadlines yet.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => openTask(task)}
                    className="flex w-full items-center gap-3 rounded-xl border border-[rgb(var(--ck-border)/0.08)] px-3 py-2.5 text-left transition-colors hover:border-gold-500/35"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                    <span className="min-w-0 flex-1 truncate text-[0.82rem] font-medium text-[rgb(var(--ck-text))]">
                      {task.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {isPremium ? (
          <SectionCard
            title="Premium insights"
            subtitle="Your plan unlocks the full analytics suite"
            action={
              <Link
                to="/app/analytics"
                className="inline-flex items-center gap-1 text-[0.76rem] font-semibold text-gold-300 hover:underline"
              >
                Open analytics <BarChart3 className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="grid grid-cols-2 gap-3">
              <Metric label="Completed this week" value={String(stats.completedThisWeek)} />
              <Metric label="Net momentum" value={(momentum >= 0 ? '+' : '') + momentum} />
              <Metric label="Avg. completion" value={stats.avgCompletionDays + 'd'} />
              <Metric label="Plan" value="Premium" highlight />
            </div>
          </SectionCard>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-br from-gold-500/[0.1] to-transparent p-5 animate-fade-up">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold-500/12 blur-3xl" />
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/35 bg-gold-500/12 text-gold-300">
                <Sparkles className="h-4.5 w-4.5" />
              </span>
              <h2 className="mt-3.5 font-display text-[1.1rem] font-semibold text-[rgb(var(--ck-text))]">
                Unlock Premium insights
              </h2>
              <p className="mt-1.5 max-w-md text-[0.82rem] leading-relaxed ck-muted">
                Recurring tasks, smart reminders, subtasks, advanced analytics and the light theme are
                waiting. You are on the {subscription.planId} plan.
              </p>
              <Link to="/app/upgrade" className="ck-btn-gold mt-4 h-10 px-4">
                See plans
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="ck-inset rounded-xl px-3 py-2.5">
      <p className="text-[0.66rem] font-semibold uppercase tracking-wide ck-faint">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-[1.05rem] font-semibold',
          highlight ? 'ck-gold-text' : 'text-[rgb(var(--ck-text))]',
        )}
      >
        {value}
      </p>
    </div>
  );
}
