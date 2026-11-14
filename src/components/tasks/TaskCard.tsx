import { useState, type MouseEvent } from 'react';
import { Calendar, Check, Copy, Flag, MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';
import type { Task } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PriorityPill, TaskMetaRow } from '@/components/tasks/TaskMeta';
import { subtaskProgress } from '@/lib/tasks';
import { cn } from '@/lib/cn';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  compact?: boolean;
}

export function TaskCard({
  task,
  onOpen,
  onEdit,
  selectable,
  selected,
  onToggleSelect,
  compact,
}: TaskCardProps) {
  const { toggleTask, deleteTask, duplicateTask, getCategory, updateTask, settings } = useWorkspace();
  const [menuOpen, setMenuOpen] = useState(false);
  const category = getCategory(task.categoryId);
  const progress = subtaskProgress(task);
  const done = task.status === 'completed';

  const handleCheck = (e: MouseEvent) => {
    e.stopPropagation();
    toggleTask(task.id);
  };

  return (
    <article
      className={cn(
        'ck-card ck-card-hover group relative cursor-pointer overflow-hidden',
        compact ? 'p-3.5' : 'p-4',
        selected && 'border-gold-500/55 shadow-glow',
      )}
      onClick={() => onOpen(task)}
      aria-label={`Open task ${task.title}`}
    >
      <span
        className={cn('absolute inset-y-0 left-0 w-[3px] opacity-80')}
        style={{ background: category?.color ?? 'rgb(var(--ck-border)/0.25)' }}
      />

      <div className="flex items-start gap-3 pl-1.5">
        {selectable && (
          <input
            type="checkbox"
            className="ck-checkbox mt-1"
            checked={Boolean(selected)}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onToggleSelect?.(task.id)}
            aria-label={`Select ${task.title}`}
          />
        )}

        <button
          type="button"
          onClick={handleCheck}
          aria-label={done ? 'Reopen task' : 'Complete task'}
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ease-premium',
            done
              ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400'
              : 'border-[rgb(var(--ck-border)/0.24)] hover:border-gold-500/70 hover:bg-gold-500/10',
          )}
        >
          {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'min-w-0 text-[0.92rem] font-semibold leading-snug',
                done ? 'ck-strike ck-faint' : 'text-[rgb(var(--ck-text))]',
              )}
            >
              {task.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask(task.id, { inMyDay: !task.inMyDay });
                }}
                aria-label={task.inMyDay ? 'Remove from My Day' : 'Add to My Day'}
                className={cn(
                  'ck-btn-quiet h-7 w-7 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100',
                  task.inMyDay && 'opacity-100 text-gold-300',
                )}
              >
                <Star className={cn('h-3.5 w-3.5', task.inMyDay && 'fill-current')} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((v) => !v);
                  }}
                  aria-label="Task actions"
                  aria-expanded={menuOpen}
                  className="ck-btn-quiet h-7 w-7 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                      }}
                    />
                    <div
                      className="absolute right-0 top-8 z-20 w-44 overflow-hidden rounded-xl border border-[rgb(var(--ck-border)/0.12)] ck-glass py-1 shadow-lift animate-scale-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[
                        { label: 'Edit task', icon: Pencil, run: () => onEdit(task) },
                        { label: 'Duplicate', icon: Copy, run: () => duplicateTask(task.id) },
                        {
                          label: task.inMyDay ? 'Remove from My Day' : 'Add to My Day',
                          icon: Star,
                          run: () => updateTask(task.id, { inMyDay: !task.inMyDay }),
                        },
                        {
                          label: task.status === 'completed' ? 'Reopen' : 'Mark complete',
                          icon: Check,
                          run: () => toggleTask(task.id),
                        },
                        {
                          label: task.archived ? 'Restore' : 'Archive',
                          icon: Calendar,
                          run: () => updateTask(task.id, { archived: !task.archived }),
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            item.run();
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.8rem] text-[rgb(var(--ck-text-muted))] transition-colors hover:bg-[rgb(var(--ck-border)/0.06)] hover:text-[rgb(var(--ck-text))]"
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          {item.label}
                        </button>
                      ))}
                      <div className="my-1 h-px bg-[rgb(var(--ck-border)/0.08)]" />
                      <button
                        type="button"
                        onClick={() => {
                          deleteTask(task.id);
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.8rem] text-rose-400 transition-colors hover:bg-rose-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete task
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {task.description && !compact && (
            <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed ck-muted">
              {task.description}
            </p>
          )}

          {progress.total > 0 && (
            <div className="mt-2.5 max-w-xs">
              <ProgressBar value={progress.done} max={progress.total} size="sm" />
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <PriorityPill task={task} />
            {category && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold"
                style={{
                  color: category.color,
                  borderColor: `${category.color}55`,
                  backgroundColor: `${category.color}14`,
                }}
              >
                {category.name}
              </span>
            )}
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-[rgb(var(--ck-border)/0.1)] px-2 py-0.5 text-[0.68rem] ck-muted"
              >
                <Flag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-2.5">
            <TaskMetaRow task={task} dateFormat={settings.dateFormat} timeFormat={settings.timeFormat} />
          </div>
        </div>
      </div>
    </article>
  );
}
