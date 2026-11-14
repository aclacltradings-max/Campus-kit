import { useMemo, useState } from 'react';
import { BarChart3, Clock, Download, Flame, Target, TrendingUp } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { SectionCard } from '@/components/common/SectionCard';
import { PremiumLock } from '@/components/common/PremiumLock';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Segmented';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  CategoryBreakdownChart,
  PriorityRadarChart,
  ProductivityTrendChart,
  StatusDonutChart,
  WeekdayChart,
} from '@/components/charts/Charts';
import {
  buildCategoryBreakdown,
  buildPriorityBreakdown,
  buildTrend,
  computeStats,
  heatmapByWeekday,
} from '@/lib/tasks';
import { exportTasks } from '@/lib/export';

type Window = '7' | '14' | '30';

export function AnalyticsPage() {
  const { tasks, categories, entitlements } = useWorkspace();
  const toast = useToast();
  const [windowSize, setWindowSize] = useState<Window>('14');

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const trend = useMemo(() => buildTrend(tasks, Number(windowSize)), [tasks, windowSize]);
  const categoryData = useMemo(() => buildCategoryBreakdown(tasks, categories), [tasks, categories]);
  const priorityData = useMemo(() => buildPriorityBreakdown(tasks), [tasks]);
  const weekday = useMemo(() => heatmapByWeekday(tasks), [tasks]);

  const completedInWindow = trend.reduce((sum, p) => sum + p.completed, 0);
  const createdInWindow = trend.reduce((sum, p) => sum + p.created, 0);
  const bestDay = useMemo(
    () => weekday.reduce((best, day) => (day.completed > best.completed ? day : best), weekday[0]),
    [weekday],
  );

  const statusData = [
    { name: 'Completed', value: stats.completed },
    { name: 'In progress', value: stats.inProgress },
    { name: 'Pending', value: Math.max(0, stats.pending - stats.inProgress) },
    { name: 'Overdue', value: stats.overdue },
  ];

  if (!entitlements.advancedAnalytics) {
    return (
      <>
        <PageHeader
          eyebrow="Insight"
          title="Analytics"
          description="Understand your productivity with rich charts and trends."
        />
        <PremiumLock
          title="Advanced analytics is a Premium capability"
          description="Unlock trend lines, category breakdowns, weekday patterns and completion insights to understand exactly where your time goes."
        />
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Completion rate" subtitle="Available on every plan">
            <ProgressBar value={stats.completionRate} label="Overall completion" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniStat label="Total" value={String(stats.total)} />
              <MiniStat label="Completed" value={String(stats.completed)} />
            </div>
          </SectionCard>
          <SectionCard title="Status split" subtitle="Where your work sits today">
            <StatusDonutChart data={statusData} />
          </SectionCard>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Insight"
        title="Analytics"
        description="Understand your productivity with rich charts, trends and patterns."
        actions={
          <>
            <Segmented
              value={windowSize}
              onChange={(v) => setWindowSize(v as Window)}
              options={[
                { value: '7', label: '7 days' },
                { value: '14', label: '14 days' },
                { value: '30', label: '30 days' },
              ]}
            />
            <Button
              variant="ghost"
              icon={<Download className="h-4 w-4" />}
              onClick={async () => {
                const message = await exportTasks('markdown', tasks, categories, {
                  total: stats.total,
                  completed: stats.completed,
                });
                toast.success('Report ready', message);
              }}
            >
              Report
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Completed"
          value={completedInWindow}
          icon={<TrendingUp className="h-4.5 w-4.5" />}
          tone="success"
          hint={'Last ' + windowSize + ' days'}
          delay={0}
        />
        <StatCard
          label="Created"
          value={createdInWindow}
          icon={<Flame className="h-4.5 w-4.5" />}
          hint={'Last ' + windowSize + ' days'}
          delay={60}
        />
        <StatCard
          label="Completion rate"
          value={stats.completionRate + '%'}
          icon={<Target className="h-4.5 w-4.5" />}
          tone="gold"
          delay={120}
        />
        <StatCard
          label="Focus logged"
          value={Math.round(stats.focusMinutes / 60) + 'h'}
          icon={<Clock className="h-4.5 w-4.5" />}
          tone="neutral"
          hint="Estimated across completed tasks"
          delay={180}
        />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Productivity trend"
          subtitle={'Created versus completed over the last ' + windowSize + ' days'}
          action={<BarChart3 className="h-4 w-4 text-gold-400" />}
        >
          <ProductivityTrendChart data={trend} />
        </SectionCard>
        <SectionCard title="Status split" subtitle="Distribution of all tasks">
          <StatusDonutChart data={statusData} />
        </SectionCard>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-2">
        <SectionCard title="Category performance" subtitle="Total versus completed per category">
          {categoryData.length === 0 ? (
            <p className="text-[0.82rem] ck-muted">Create a category to see its performance.</p>
          ) : (
            <>
              <CategoryBreakdownChart data={categoryData} />
              <ul className="mt-4 space-y-3">
                {categoryData.map((row) => (
                  <li key={row.categoryId}>
                    <div className="mb-1.5 flex items-center justify-between text-[0.76rem]">
                      <span className="flex items-center gap-2 text-[rgb(var(--ck-text))]">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                        {row.name}
                      </span>
                      <span className="ck-muted">
                        {row.completed}/{row.total} · {row.completionRate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={row.completed}
                      max={row.total}
                      size="sm"
                      tone={row.completionRate >= 60 ? 'success' : 'gold'}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>

        <SectionCard title="Priority mix" subtitle="Volume and completion by priority">
          <PriorityRadarChart data={priorityData} />
        </SectionCard>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard title="Weekday pattern" subtitle="When you complete the most work">
          <WeekdayChart data={weekday} />
        </SectionCard>
        <SectionCard title="Highlights" subtitle="Standout numbers">
          <dl className="space-y-3">
            <Highlight label="Most productive day" value={bestDay ? bestDay.day : '—'} />
            <Highlight label="Completions on that day" value={bestDay ? String(bestDay.completed) : '0'} />
            <Highlight label="Average time to finish" value={stats.avgCompletionDays + ' days'} />
            <Highlight label="Completed this week" value={String(stats.completedThisWeek)} />
            <Highlight label="Currently in progress" value={String(stats.inProgress)} />
            <Highlight label="Overdue" value={String(stats.overdue)} tone="danger" />
          </dl>
        </SectionCard>
      </section>
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ck-inset rounded-xl px-3 py-2.5">
      <p className="text-[0.66rem] font-semibold uppercase tracking-wide ck-faint">{label}</p>
      <p className="mt-1 font-display text-[1.05rem] font-semibold text-[rgb(var(--ck-text))]">{value}</p>
    </div>
  );
}

function Highlight({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <div className="flex items-center justify-between border-b border-[rgb(var(--ck-border)/0.06)] pb-2.5 last:border-0">
      <dt className="text-[0.8rem] ck-muted">{label}</dt>
      <dd
        className={
          'font-display text-[0.95rem] font-semibold ' +
          (tone === 'danger' ? 'text-rose-400' : 'text-[rgb(var(--ck-text))]')
        }
      >
        {value}
      </dd>
    </div>
  );
}
