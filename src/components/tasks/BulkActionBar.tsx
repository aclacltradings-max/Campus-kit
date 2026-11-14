import { useState } from 'react';
import { Archive, Check, FolderInput, Star, Trash2, Undo2, X } from 'lucide-react';
import type { Priority } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PRIORITIES } from '@/lib/priority';
import { cn } from '@/lib/cn';
import { ConfirmDialog } from '@/components/ui/Modal';

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function BulkActionBar({ selectedIds, onClear }: BulkActionBarProps) {
  const { bulk, categories, entitlements } = useWorkspace();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);

  if (!selectedIds.length) return null;
  const locked = !entitlements.bulkActions;

  const guard = (run: () => void) => {
    if (locked) return;
    run();
    onClear();
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-16 z-[80] flex justify-center px-3 pb-2 sm:bottom-0 sm:pb-5">
        <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-2 rounded-2xl border border-gold-500/30 ck-glass px-3 py-2.5 shadow-lift animate-fade-up">
          <span className="flex items-center gap-2 pr-2 text-[0.8rem] font-semibold text-gold-200">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-500/20 px-1.5 text-[0.72rem]">
              {selectedIds.length}
            </span>
            selected
          </span>

          {locked ? (
            <span className="text-[0.78rem] ck-muted">Bulk actions are a Premium capability.</span>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <BulkButton
                icon={<Check className="h-3.5 w-3.5" />}
                label="Complete"
                onClick={() => guard(() => bulk.complete(selectedIds))}
              />
              <BulkButton
                icon={<Undo2 className="h-3.5 w-3.5" />}
                label="Reopen"
                onClick={() => guard(() => bulk.reopen(selectedIds))}
              />
              <BulkButton
                icon={<Star className="h-3.5 w-3.5" />}
                label="My Day"
                onClick={() => guard(() => bulk.toggleMyDay(selectedIds))}
              />

              <div className="relative">
                <BulkButton
                  icon={<FolderInput className="h-3.5 w-3.5" />}
                  label="Category"
                  onClick={() => {
                    setPriorityOpen(false);
                    setCategoryOpen((v) => !v);
                  }}
                />
                {categoryOpen && (
                  <div className="absolute bottom-11 left-0 z-10 w-48 overflow-hidden rounded-xl border border-[rgb(var(--ck-border)/0.12)] ck-glass py-1 shadow-lift animate-scale-in">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.78rem] hover:bg-[rgb(var(--ck-border)/0.06)]"
                      onClick={() => guard(() => bulk.setCategory(selectedIds, null))}
                    >
                      Uncategorised
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[0.78rem] hover:bg-[rgb(var(--ck-border)/0.06)]"
                        onClick={() => guard(() => bulk.setCategory(selectedIds, category.id))}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <BulkButton
                  icon={<Star className="h-3.5 w-3.5" />}
                  label="Priority"
                  onClick={() => {
                    setCategoryOpen(false);
                    setPriorityOpen((v) => !v);
                  }}
                />
                {priorityOpen && (
                  <div className="absolute bottom-11 left-0 z-10 w-40 overflow-hidden rounded-xl border border-[rgb(var(--ck-border)/0.12)] ck-glass py-1 shadow-lift animate-scale-in">
                    {PRIORITIES.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-left text-[0.78rem] hover:bg-[rgb(var(--ck-border)/0.06)]',
                          priority.text,
                        )}
                        onClick={() => guard(() => bulk.prioritize(selectedIds, priority.value as Priority))}
                      >
                        <span className={cn('h-2 w-2 rounded-full', priority.dot)} />
                        {priority.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <BulkButton
                icon={<Archive className="h-3.5 w-3.5" />}
                label="Archive"
                onClick={() => guard(() => bulk.archive(selectedIds, true))}
              />
              <BulkButton
                icon={<Trash2 className="h-3.5 w-3.5" />}
                label="Delete"
                danger
                onClick={() => setConfirmDelete(true)}
              />
            </div>
          )}

          <button
            type="button"
            onClick={onClear}
            aria-label="Clear selection"
            className="ck-btn-quiet ml-auto h-8 w-8 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={
          'Delete ' + selectedIds.length + ' task' + (selectedIds.length === 1 ? '' : 's') + '?'
        }
        description="The selected tasks will be permanently removed from this device."
        confirmLabel="Delete tasks"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          guard(() => bulk.remove(selectedIds));
          setConfirmDelete(false);
        }}
      />
    </>
  );
}

function BulkButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.75rem] font-semibold transition-colors',
        danger
          ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/12'
          : 'border-[rgb(var(--ck-border)/0.12)] text-[rgb(var(--ck-text-muted))] hover:border-gold-500/40 hover:text-gold-300',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
