import { useMemo, useState } from 'react';
import { Filter, FolderKanban, Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Priority, SortKey, TaskFilters, TaskStatus } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaskCollection } from '@/components/tasks/TaskCollection';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Toggle } from '@/components/ui/Toggle';
import { filterTasks, sortTasks, allTags } from '@/lib/tasks';
import { PRIORITIES } from '@/lib/priority';
import { cn } from '@/lib/cn';

const EMPTY_FILTERS: TaskFilters = {
  query: '',
  status: 'all',
  priority: 'all',
  categoryId: 'all',
  tags: [],
  dueWithin: 'any',
  includeArchived: false,
};

export function AllTasksPage() {
  const { tasks, categories } = useWorkspace();
  const { createTask, openTask, editTask } = useTaskDialog();
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>('due-asc');
  const [showFilters, setShowFilters] = useState(false);

  const tagOptions = useMemo(() => allTags(tasks), [tasks]);
  const visible = useMemo(() => sortTasks(filterTasks(tasks, filters), sort), [tasks, filters, sort]);

  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.categoryId !== 'all' ? 1 : 0) +
    filters.tags.length +
    (filters.dueWithin !== 'any' ? 1 : 0) +
    (filters.includeArchived ? 1 : 0);

  const patch = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="All Tasks"
        description="Every task you own, with precise filters, sorting and bulk actions."
        actions={
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={() => createTask()}>
            New task
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search titles, descriptions and tags..."
          value={filters.query}
          leading={<Search className="h-4 w-4" />}
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
          className="sm:max-w-md"
        />
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button
            variant={showFilters ? 'gold' : 'ghost'}
            icon={<SlidersHorizontal className="h-4 w-4" />}
            onClick={() => setShowFilters((v) => !v)}
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-950/20 px-1 text-[0.66rem] font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-auto min-w-[10rem]"
            aria-label="Sort tasks"
          >
            <option value="due-asc">Deadline - soonest</option>
            <option value="due-desc">Deadline - latest</option>
            <option value="priority-desc">Priority - high first</option>
            <option value="priority-asc">Priority - low first</option>
            <option value="created-desc">Newest created</option>
            <option value="created-asc">Oldest created</option>
            <option value="updated-desc">Recently updated</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </Select>
        </div>
      </div>

      {showFilters && (
        <div className="ck-card mb-4 p-4 animate-fade-up">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => patch('status', e.target.value as TaskStatus | 'all')}
            >
              <option value="all">Any status</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </Select>
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

          {tagOptions.length > 0 && (
            <div className="mt-4">
              <span className="ck-label">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {tagOptions.map((tag) => {
                  const active = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        patch(
                          'tags',
                          active ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag],
                        )
                      }
                      className={cn(
                        'ck-tag transition-colors',
                        active && 'border-gold-500/45 bg-gold-500/10 text-gold-300',
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Toggle
              checked={filters.includeArchived}
              onChange={(v) => patch('includeArchived', v)}
              label="Include archived tasks"
            />
            <Button
              variant="quiet"
              size="sm"
              icon={<X className="h-3.5 w-3.5" />}
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Reset filters
            </Button>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-center gap-2 text-[0.76rem] ck-muted">
        <Filter className="h-3.5 w-3.5" />
        Showing {visible.length} of {tasks.length} tasks
      </div>

      <TaskCollection
        tasks={visible}
        onOpen={openTask}
        onEdit={editTask}
        emptyIcon={<FolderKanban className="h-6 w-6" />}
        emptyTitle="No tasks match"
        emptyDescription="Adjust the filters or create a new task to get moving."
        emptyAction={
          <Button
            variant="gold"
            size="sm"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => createTask()}
          >
            New task
          </Button>
        }
      />
    </>
  );
}
