import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles } from 'lucide-react';
import type { Priority, RecurrenceFrequency, Task } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { Segmented } from '@/components/ui/Segmented';
import { TagInput } from '@/components/tasks/TagInput';
import { SubtaskEditor } from '@/components/tasks/SubtaskEditor';
import { PRIORITIES } from '@/lib/priority';
import { RECURRENCE_LABEL, allTags } from '@/lib/tasks';
import { combineDateAndTime, toDateInputValue, toTimeInputValue } from '@/lib/date';
import { hasErrors, validateTask, type FieldErrors, type TaskDraft } from '@/lib/validation';
import { cn } from '@/lib/cn';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultDate?: string | null;
}

function draftFromTask(task?: Task | null, defaultDate?: string | null): TaskDraft {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    categoryId: task?.categoryId ?? null,
    tags: task?.tags ?? [],
    priority: task?.priority ?? 'medium',
    status: task?.status ?? 'todo',
    dueDate: task?.dueDate ?? defaultDate ?? null,
    startDate: task?.startDate ?? null,
    reminderAt: task?.reminderAt ?? null,
    recurrence: task?.recurrence ?? 'none',
    estimatedMinutes: task?.estimatedMinutes ?? null,
  };
}

export function TaskFormModal({ open, onClose, task, defaultDate }: TaskFormModalProps) {
  const { categories, createTaskFrom, updateTask, tasks, entitlements, isPremium } = useWorkspace();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<TaskDraft>(() => draftFromTask(task, defaultDate));
  const [subtasks, setSubtasks] = useState(task?.subtasks ?? []);
  const [inMyDay, setInMyDay] = useState(task?.inMyDay ?? false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [errors, setErrors] = useState<FieldErrors<TaskDraft>>({});

  const suggestions = useMemo(() => allTags(tasks), [tasks]);
  const editing = Boolean(task);

  useEffect(() => {
    if (!open) return;
    const next = draftFromTask(task, defaultDate);
    setDraft(next);
    setSubtasks(task?.subtasks ?? []);
    setInMyDay(task?.inMyDay ?? false);
    setDueDate(toDateInputValue(next.dueDate));
    setDueTime(next.dueDate ? toTimeInputValue(next.dueDate) || '17:00' : '17:00');
    setReminderDate(toDateInputValue(next.reminderAt));
    setReminderTime(next.reminderAt ? toTimeInputValue(next.reminderAt) || '09:00' : '09:00');
    setErrors({});
  }, [open, task, defaultDate]);

  const patch = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    const resolvedDue = combineDateAndTime(dueDate, dueTime);
    const resolvedReminder = combineDateAndTime(reminderDate, reminderTime);
    const candidate: TaskDraft = { ...draft, dueDate: resolvedDue, reminderAt: resolvedReminder };
    const validation = validateTask(candidate);
    setErrors(validation);
    if (hasErrors(validation)) return;

    if (editing && task) {
      updateTask(task.id, {
        title: candidate.title.trim(),
        description: candidate.description.trim(),
        categoryId: candidate.categoryId,
        tags: candidate.tags,
        priority: candidate.priority,
        status: candidate.status,
        dueDate: candidate.dueDate,
        startDate: candidate.startDate,
        reminderAt: candidate.reminderAt,
        recurrence: candidate.recurrence,
        estimatedMinutes: candidate.estimatedMinutes,
        subtasks,
        inMyDay,
      });
      onClose();
      return;
    }

    const created = createTaskFrom({
      title: candidate.title.trim(),
      description: candidate.description.trim(),
      categoryId: candidate.categoryId,
      tags: candidate.tags,
      priority: candidate.priority,
      status: candidate.status,
      dueDate: candidate.dueDate,
      startDate: candidate.startDate,
      reminderAt: candidate.reminderAt,
      recurrence: candidate.recurrence,
      estimatedMinutes: candidate.estimatedMinutes,
      subtasks,
      inMyDay,
    });
    if (created) onClose();
  };

  const goPremium = () => {
    onClose();
    navigate('/app/upgrade');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? 'Edit task' : 'New task'}
      description={
        editing ? 'Refine the details and keep your workspace sharp.' : 'Capture it now, organise it later.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" onClick={handleSubmit} icon={editing ? undefined : <Sparkles className="h-4 w-4" />}>
            {editing ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Task title"
          placeholder="e.g. Submit the research methodology chapter"
          value={draft.title}
          error={errors.title}
          required
          autoFocus
          maxLength={140}
          onChange={(e) => patch('title', e.target.value)}
        />

        <Textarea
          label="Description"
          placeholder="Add context, links or acceptance criteria…"
          rows={3}
          value={draft.description}
          error={errors.description}
          onChange={(e) => patch('description', e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="ck-label">Priority</span>
            <Segmented
              value={draft.priority}
              onChange={(value) => patch('priority', value as Priority)}
              options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
              className="w-full"
            />
          </div>
          <div>
            <span className="ck-label">Status</span>
            <Segmented
              value={draft.status}
              onChange={(value) => patch('status', value as Task['status'])}
              options={[
                { value: 'todo', label: 'To do' },
                { value: 'in_progress', label: 'In progress' },
                { value: 'completed', label: 'Completed' },
              ]}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            value={draft.categoryId ?? ''}
            onChange={(e) => patch('categoryId', e.target.value || null)}
          >
            <option value="">Uncategorised</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Input
            label="Estimate (minutes)"
            type="number"
            min={0}
            max={1440}
            placeholder="45"
            value={draft.estimatedMinutes ?? ''}
            error={errors.estimatedMinutes}
            onChange={(e) =>
              patch('estimatedMinutes', e.target.value === '' ? null : Number(e.target.value))
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Deadline"
            type="date"
            value={dueDate}
            error={errors.dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input
            label="Deadline time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={toDateInputValue(draft.startDate)}
            onChange={(e) =>
              patch('startDate', e.target.value ? combineDateAndTime(e.target.value, '09:00') : null)
            }
          />
          <Select
            label="Repeat"
            value={draft.recurrence}
            disabled={!entitlements.recurringTasks}
            hint={!entitlements.recurringTasks ? 'Premium feature' : undefined}
            onChange={(e) => patch('recurrence', e.target.value as RecurrenceFrequency)}
          >
            {(Object.keys(RECURRENCE_LABEL) as RecurrenceFrequency[]).map((key) => (
              <option key={key} value={key}>
                {RECURRENCE_LABEL[key]}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="ck-label mb-0">Reminder</span>
            {!entitlements.reminders && (
              <button
                type="button"
                onClick={goPremium}
                className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-gold-300 hover:underline"
              >
                <Crown className="h-3 w-3" /> Premium
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="date"
              value={reminderDate}
              disabled={!entitlements.reminders}
              error={errors.reminderAt}
              onChange={(e) => setReminderDate(e.target.value)}
            />
            <Input
              type="time"
              value={reminderTime}
              disabled={!entitlements.reminders}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
          {!entitlements.reminders && (
            <p className="mt-1.5 text-[0.72rem] ck-faint">
              Reminders are a Premium capability. Upgrade to be alerted before every deadline.
            </p>
          )}
        </div>

        <div>
          <span className="ck-label">Tags</span>
          <TagInput
            value={draft.tags}
            onChange={(tags) => patch('tags', tags)}
            suggestions={suggestions}
            error={errors.tags}
          />
        </div>

        <div>
          <span className="ck-label">Subtasks</span>
          <SubtaskEditor
            subtasks={subtasks}
            onChange={setSubtasks}
            locked={!entitlements.subtasks}
            onUpgrade={goPremium}
          />
        </div>

        <label
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors',
            inMyDay
              ? 'border-gold-500/40 bg-gold-500/8'
              : 'border-[rgb(var(--ck-border)/0.1)] hover:border-gold-500/25',
          )}
        >
          <input
            type="checkbox"
            className="ck-checkbox"
            checked={inMyDay}
            onChange={(e) => setInMyDay(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-[rgb(var(--ck-text))]">Add to My Day</span>
            <span className="mt-0.5 block text-[0.75rem] ck-muted">
              Keep this front and centre on your daily focus list.
            </span>
          </span>
        </label>

        {!isPremium && (
          <p className="rounded-xl border border-gold-500/25 bg-gold-500/6 px-3.5 py-3 text-[0.75rem] leading-relaxed ck-muted">
            You are on the Free plan. Recurring tasks, reminders, subtasks and unlimited categories are
            available on Premium.
          </p>
        )}
      </div>
    </Modal>
  );
}
