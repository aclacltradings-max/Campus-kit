import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full border transition-all duration-300 ease-premium disabled:opacity-45',
        checked
          ? 'border-gold-500/60 bg-gradient-to-r from-gold-500/90 to-gold-600/80 shadow-[0_0_18px_-6px_rgba(212,175,55,0.9)]'
          : 'border-[rgb(var(--ck-border)/0.16)] bg-[rgb(var(--ck-border)/0.08)]',
        className,
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all duration-300 ease-premium',
          'h-[1.15rem] w-[1.15rem]',
          checked ? 'left-[1.4rem] bg-ink-950' : 'left-0.5 bg-[rgb(var(--ck-text-muted))]',
        )}
      />
    </button>
  );

  if (!label) return control;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[rgb(var(--ck-text))]">{label}</p>
        {description && <p className="mt-0.5 text-[0.75rem] ck-muted">{description}</p>}
      </div>
      {control}
    </div>
  );
}
