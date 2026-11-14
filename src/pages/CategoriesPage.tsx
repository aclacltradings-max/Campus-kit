import { useMemo, useState } from 'react';
import { Lock, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CATEGORY_COLORS } from '@/lib/priority';
import { cn } from '@/lib/cn';

export function CategoriesPage() {
  const { categories, tasks, addCategory, updateCategory, deleteCategory, entitlements } = useWorkspace();
  const { createTask, openTask } = useTaskDialog();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      categories.map((category) => {
        const scoped = tasks.filter((t) => t.categoryId === category.id && !t.archived);
        const completed = scoped.filter((t) => t.status === 'completed').length;
        return {
          category,
          total: scoped.length,
          completed,
          rate: scoped.length ? Math.round((completed / scoped.length) * 100) : 0,
        };
      }),
    [categories, tasks],
  );

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setColor(CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length]);
    setError(null);
    setEditorOpen(true);
  };

  const openEdit = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (!category) return;
    setEditingId(id);
    setName(category.name);
    setColor(category.color);
    setError(null);
    setEditorOpen(true);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Give the category a name of at least 2 characters.');
      return;
    }
    const duplicate = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editingId,
    );
    if (duplicate) {
      setError('A category with that name already exists.');
      return;
    }
    if (editingId) {
      updateCategory(editingId, { name: trimmed, color });
    } else {
      const created = addCategory(trimmed, color, 'Tag');
      if (!created) return;
    }
    setEditorOpen(false);
  };

  const atLimit = categories.length >= entitlements.maxCategories;

  return (
    <>
      <PageHeader
        eyebrow="Organisation"
        title="Categories"
        description="Group tasks into the areas of your life and watch how each one performs."
        actions={
          <Button
            variant="gold"
            icon={atLimit ? <Lock className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            onClick={openCreate}
          >
            {atLimit ? 'Category limit reached' : 'New category'}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCardInline label="Categories" value={String(categories.length)} />
        <StatCardInline label="Tasks categorised" value={String(rows.reduce((s, r) => s + r.total, 0))} />
        <StatCardInline
          label="Uncategorised"
          value={String(tasks.filter((t) => !t.categoryId && !t.archived).length)}
        />
      </div>

      {rows.length === 0 ? (
        <SectionCard className="mt-4" title="No categories yet" subtitle="Create your first area of focus">
          <Button variant="gold" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Create a category
          </Button>
        </SectionCard>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row, index) => (
            <div
              key={row.category.id}
              className="ck-card ck-card-hover p-4 animate-fade-up"
              style={{ animationDelay: index * 45 + 'ms' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: row.category.color + '22', color: row.category.color }}
                  >
                    <Tags className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-display text-[0.98rem] font-semibold text-[rgb(var(--ck-text))]">
                      {row.category.name}
                    </h3>
                    <p className="text-[0.72rem] ck-faint">
                      {row.total} task{row.total === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(row.category.id)}
                    aria-label={'Edit ' + row.category.name}
                    className="ck-btn-quiet h-8 w-8 rounded-lg"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmId(row.category.id)}
                    aria-label={'Delete ' + row.category.name}
                    className="ck-btn-quiet h-8 w-8 rounded-lg hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <ProgressBar value={row.completed} max={Math.max(1, row.total)} size="sm" label="Completion" />
              </div>

              <div className="mt-3 flex items-center justify-between text-[0.72rem] ck-faint">
                <span>{row.completed} completed</span>
                <span>{row.rate}%</span>
              </div>

              <div className="mt-3 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => createTask()}
                >
                  Add task
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tasks.some((t) => !t.categoryId && !t.archived) && (
        <SectionCard
          className="mt-4"
          title="Uncategorised tasks"
          subtitle={String(tasks.filter((t) => !t.categoryId && !t.archived).length) + ' waiting to be filed'}
          action={
            <Button variant="ghost" size="sm" onClick={() => openTask(tasks.find((t) => !t.categoryId && !t.archived)!)}>
              Review
            </Button>
          }
        >
          <p className="text-[0.8rem] ck-muted">
            These tasks have no category. Open one and assign it to keep your workspace tidy.
          </p>
        </SectionCard>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingId ? 'Edit category' : 'New category'}
        description="Give it a clear name and a colour that stands out."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" onClick={submit}>
              {editingId ? 'Save changes' : 'Create category'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={name}
            autoFocus
            maxLength={40}
            error={error ?? undefined}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="e.g. Academics"
          />
          <div>
            <span className="ck-label">Colour</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-label={'Use colour ' + option}
                  className={cn(
                    'h-8 w-8 rounded-xl border-2 transition-all',
                    color === option ? 'border-[rgb(var(--ck-text))] scale-110' : 'border-transparent',
                  )}
                  style={{ backgroundColor: option }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Delete this category?"
        description="Tasks in this category will become uncategorised. They will not be deleted."
        confirmLabel="Delete category"
        destructive
        onCancel={() => setConfirmId(null)}
        onConfirm={() => {
          if (confirmId) deleteCategory(confirmId);
          setConfirmId(null);
        }}
      />
    </>
  );
}

function StatCardInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="ck-card p-4 animate-fade-up">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] ck-faint">{label}</p>
      <p className="mt-2 font-display text-[1.5rem] font-semibold text-[rgb(var(--ck-text))]">{value}</p>
    </div>
  );
}
