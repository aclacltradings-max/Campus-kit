import { Check, Plus, Trash2 } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';
import type { Subtask } from '@/types';
import { uid } from '@/lib/id';
import { cn } from '@/lib/cn';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface SubtaskEditorProps {
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
  locked?: boolean;
  onUpgrade?: () => void;
}

export function SubtaskEditor({ subtasks, onChange, locked, onUpgrade }: SubtaskEditorProps) {
  const [draft, setDraft] = useState('');
  const done = subtasks.filter((s) => s.done).length;

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    onChange([...subtasks, { id: uid('sub'), title, done: false }]);
    setDraft('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="rounded-xl border border-[rgb(var(--ck-border)/0.1)] bg-[rgb(var(--ck-border)/0.02)] p-3">
      {subtasks.length > 0 && (
        <div className="mb-3">
          <ProgressBar value={done} max={subtasks.length} size="sm" />
          <p className="mt-1.5 text-[0.7rem] ck-faint">
            {done} of {subtasks.length} steps complete
          </p>
        </div>
      )}
      <ul className="space-y-1.5">
        {subtasks.map((subtask) => (
          <li key={subtask.id} className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label={subtask.done ? 'Mark step incomplete' : 'Mark step complete'}
              onClick={() =>
                onChange(subtasks.map((s) => (s.id === subtask.id ? { ...s, done: !s.done } : s)))
              }
              className={cn(
                'flex h-4.5 w-4.5 h-[1.1rem] w-[1.1rem] shrink-0 items-center justify-center rounded border transition-all',
                subtask.done
                  ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400'
                  : 'border-[rgb(var(--ck-border)/0.24)] hover:border-gold-500/60',
              )}
            >
              {subtask.done && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <input
              value={subtask.title}
              onChange={(e) =>
                onChange(subtasks.map((s) => (s.id === subtask.id ? { ...s, title: e.target.value } : s)))
              }
              className={cn(
                'flex-1 bg-transparent text-[0.85rem] outline-none',
                subtask.done ? 'ck-strike ck-faint' : 'text-[rgb(var(--ck-text))]',
              )}
              aria-label="Step title"
            />
            <button
              type="button"
              aria-label="Remove step"
              onClick={() => onChange(subtasks.filter((s) => s.id !== subtask.id))}
              className="ck-btn-quiet h-6 w-6 rounded-md hover:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {locked ? (
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold-500/35 px-3 py-2 text-[0.78rem] font-semibold text-gold-300 transition-colors hover:bg-gold-500/8"
        >
          <Plus className="h-3.5 w-3.5" />
          Unlock subtasks with Premium
        </button>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Add a step"
            className="ck-input h-9 flex-1 py-1.5 text-[0.82rem]"
            aria-label="New step"
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="ck-btn-ghost h-9 w-9 rounded-lg p-0"
            aria-label="Add step"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
