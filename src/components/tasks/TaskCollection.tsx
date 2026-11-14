import { CheckSquare, Square } from 'lucide-react';
import type { Task } from '@/types';
import { TaskCard } from '@/components/tasks/TaskCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { BulkActionBar } from '@/components/tasks/BulkActionBar';
import { useTaskSelection } from '@/hooks/useTaskSelection';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

interface TaskCollectionProps {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  compact?: boolean;
  selectable?: boolean;
  columns?: 1 | 2;
}

export function TaskCollection({
  tasks,
  onOpen,
  onEdit,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  compact,
  selectable = true,
  columns = 1,
}: TaskCollectionProps) {
  const selection = useTaskSelection(tasks.map((t) => t.id));

  if (!tasks.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      {selectable && tasks.length > 1 && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={selection.allSelected ? selection.clear : selection.selectAll}
            className="inline-flex items-center gap-2 text-[0.76rem] font-medium ck-muted transition-colors hover:text-gold-300"
          >
            {selection.allSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selection.allSelected ? 'Clear selection' : 'Select all'}
          </button>
          <span className="text-[0.74rem] ck-faint">
            {tasks.length} task{tasks.length === 1 ? '' : 's'}
          </span>
        </div>
      )}

      <div className={cn('grid gap-3', columns === 2 && 'md:grid-cols-2')}>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(index * 35, 280)}ms` }}
          >
            <TaskCard
              task={task}
              onOpen={onOpen}
              onEdit={onEdit}
              compact={compact}
              selectable={selectable}
              selected={selection.isSelected(task.id)}
              onToggleSelect={selection.toggle}
            />
          </div>
        ))}
      </div>

      {selectable && <BulkActionBar selectedIds={selection.selected} onClear={selection.clear} />}
    </>
  );
}
