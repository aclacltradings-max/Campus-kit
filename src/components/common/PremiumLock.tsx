import { useNavigate } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PremiumLockProps {
  title: string;
  description: string;
  className?: string;
  compact?: boolean;
}

export function PremiumLock({ title, description, className, compact }: PremiumLockProps) {
  const navigate = useNavigate();
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-gold-500/25 bg-gradient-to-br from-gold-500/[0.08] to-transparent',
        compact ? 'p-4' : 'p-6',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-500/10 blur-2xl" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/35 bg-gold-500/12 text-gold-300">
            <Lock className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="font-display text-[1rem] font-semibold text-[rgb(var(--ck-text))]">{title}</h3>
            <p className="mt-1 max-w-xl text-[0.8rem] leading-relaxed ck-muted">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/app/upgrade')}
          className="ck-btn-gold h-10 shrink-0 px-4"
        >
          <Crown className="h-4 w-4" />
          Unlock Premium
        </button>
      </div>
    </div>
  );
}
