import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { normalizeTags, sanitizeTag } from '@/lib/validation';
import { cn } from '@/lib/cn';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  error?: string;
}

export function TagInput({ value, onChange, suggestions = [], placeholder = 'Add a tag and press Enter', error }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const commit = (raw: string) => {
    const clean = sanitizeTag(raw);
    if (!clean) return;
    onChange(normalizeTags([...value, clean]));
    setDraft('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const unused = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).slice(0, 6);

  return (
    <div>
      <div
        className={cn(
          'ck-input flex min-h-[2.75rem] flex-wrap items-center gap-1.5 py-2',
          error && 'ck-input-error',
        )}
      >
        {value.map((tag) => (
          <span key={tag} className="ck-tag">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-[rgb(var(--ck-text-faint))] transition-colors hover:text-rose-400"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => commit(draft)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-[rgb(var(--ck-text-faint))]"
          aria-label="Add tag"
        />
      </div>
      {error && <p className="mt-1.5 text-[0.72rem] font-medium text-rose-400">{error}</p>}
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[0.7rem] ck-faint">Suggested:</span>
          {unused.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => commit(tag)}
              className="ck-tag transition-colors hover:border-gold-500/45 hover:text-gold-300"
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
