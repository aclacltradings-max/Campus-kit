import { cn } from '@/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-[rgb(var(--ck-border)/0.1)] bg-[rgb(var(--ck-border)/0.04)] p-1',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all duration-200 ease-premium',
              size === 'sm' ? 'px-2.5 py-1 text-[0.72rem]' : 'px-3 py-1.5 text-[0.78rem]',
              active
                ? 'bg-gradient-to-b from-gold-500/22 to-gold-500/8 text-gold-200 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.28)]'
                : 'text-[rgb(var(--ck-text-muted))] hover:text-[rgb(var(--ck-text))]',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
