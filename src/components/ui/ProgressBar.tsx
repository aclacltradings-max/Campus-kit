import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  tone?: 'gold' | 'success' | 'danger';
  size?: 'sm' | 'md';
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = 'gold',
  size = 'md',
  label,
}: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const tones = {
    gold: 'from-gold-300 via-gold-500 to-gold-700',
    success: 'from-emerald-400 to-emerald-600',
    danger: 'from-rose-400 to-rose-600',
  } as const;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-[0.72rem]">
          <span className="ck-muted">{label}</span>
          <span className="font-semibold text-[rgb(var(--ck-text))]">{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-[rgb(var(--ck-border)/0.08)]',
          size === 'sm' ? 'h-1.5' : 'h-2',
        )}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-premium', tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function RingProgress({
  value,
  size = 96,
  stroke = 8,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.max(0, value));
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ck-ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5DF96" />
            <stop offset="60%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8F711F" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--ck-border)/0.1)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ck-ring-g)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
