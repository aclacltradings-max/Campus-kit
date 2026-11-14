import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Plus, Search as SearchIcon, Sparkles, X } from 'lucide-react';
import type { Priority, SortKey, TaskFilters, TaskStatus } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCollection } from '@/components/tasks/TaskCollection';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { filterTasks, sortTasks } from '@/lib/tasks';
import { PRIORITIES } from '@/lib/priority';
import { cn } from '@/lib/cn';

const BASE: TaskFilters = {
  query: '',
  status: 'all',
  priority: 'all',
  categoryId: 'all',
  tags: [],
  dueWithin: 'any',
  includeArchived: false,
};

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { tasks, categories } = useWorkspace();
  const { createTask, openTask, editTask } = useTaskDialog();

  const [filters, setFilters] = useState<TaskFilters>({
    ...BASE,
    query: params.get('q') ?? '',
  });
  const [sort, setSort] = useState<SortKey>('due-asc');
  const [advanced, setAdvanced] = useState(false);

  useEffect(() => {
    const q = params.get('q');
    if (q !== null) setFilters((prev) => ({ ...prev, query: q }));
  }, [params]);

  const results = useMemo(() => sortTasks(filterTasks(tasks, filters), sort), [tasks, filters, sort]);

  const patch = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === 'query') {
      const next = new URLSearchParams(params);
      if (value) next.set('q', String(value));
      else next.delete('q');
      setParams(next, { replace: true });
    }
  };

  const topTags = useMemo(
    () => Object.entries(
      results.reduce<Record<string, number>>((acc, task) => {
        task.tags.forEach((tag) => {
          acc[tag] = (acc[tag] ?? 0) + 1;
        });
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
    [results],
  );

  return (
    <>
      <PageHeader
        eyebrow="Smart search"
        title="Find anything"
        description="Search across titles, descriptions and tags, then narrow with precise filters."
        actions={
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={() => createTask()}>
            New task
          </Button>
        }
      />

      <div className="ck-card mb-4 p-4">
        <Input
          autoFocus
          placeholder="Type to search your workspace..."
          value={filters.query}
          leading={<SearchIcon className="h-4 w-4" />}
          onChange={(e) => patch('query', e.target.value)}
          trailing={
            filters.query ? (
              <button
                type="button"
                onClick={() => patch('query', '')}
                aria-label="Clear search"
                className="ck-btn-quiet h-7 w-7 rounded-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Segmented
            value={filters.status}
            onChange={(v) => patch('status', v as TaskStatus | 'all')}
            size="sm"
            options={[
              { value: 'all', label: 'All' },
              { value: 'todo', label: 'To do' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-auto min-w-[9.5rem]"
            aria-label="Sort results"
          >
            <option value="due-asc">Deadline - soonest</option>
            <option value="priority-desc">Priority - high first</option>
            <option value="created-desc">Newest first</option>
            <option value="updated-desc">Recently updated</option>
            <option value="title-asc">Title A-Z</option>
          </Select>
          <Button
            variant={advanced ? 'gold' : 'ghost'}
            size="sm"
            icon={<Filter className="h-3.5 w-3.5" />}
            onClick={() => setAdvanced((v) => !v)}
          >
            Advanced
          </Button>
        </div>

        {advanced && (
          <div className="mt-4 grid gap-4 border-t border-[rgb(var(--ck-border)/0.08)] pt-4 sm:grid-cols-3 animate-fade-up">
            <Select
              label="Priority"
              value={filters.priority}
              onChange={(e) => patch('priority', e.target.value as Priority | 'all')}
            >
              <option value="all">Any priority</option>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Select
              label="Category"
              value={filters.categoryId}
              onChange={(e) => patch('categoryId', e.target.value)}
            >
              <option value="all">Any category</option>
              <option value="none">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              label="Deadline"
              value={filters.dueWithin}
              onChange={(e) => patch('dueWithin', e.target.value as TaskFilters['dueWithin'])}
            >
              <option value="any">Any time</option>
              <option value="today">Due today</option>
              <option value="week">Due this week</option>
              <option value="month">Due this month</option>
              <option value="overdue">Overdue</option>
              <option value="no-date">No deadline</option>
            </Select>
          </div>
        )}

        {topTags.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-[0.7rem] ck-faint">Top tags:</span>
            {topTags.map(([tag, count]) => {
              const active = filters.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    patch('tags', active ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag])
                  }
                  className={cn('ck-tag transition-colors', active && 'border-gold-500/45 text-gold-300')}
                >
                  {tag}
                  <span className="text-[0.62rem] ck-faint">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="mb-3 text-[0.76rem] ck-muted">
        {results.length} result{results.length === 1 ? '' : 's'}
        {filters.query ? ' for “' + filters.query + '”' : ''}
      </p>

      <TaskCollection
        tasks={results}
        onOpen={openTask}
        onEdit={editTask}
        emptyIcon={<Sparkles className="h-6 w-6" />}
        emptyTitle={filters.query ? 'No matches found' : 'Start typing to search'}
        emptyDescription={
          filters.query
            ? 'Try a different phrase, or clear the filters to widen the search.'
            : 'Search across every task title, description and tag in your workspace.'
        }
      />
    </>
  );
}
