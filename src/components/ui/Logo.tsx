import { cn } from '@/lib/cn';

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  subtitle?: string;
}

export function LogoMark({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ck-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5DF96" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8F711F" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="12" fill="currentColor" opacity="0.06" />
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="12"
        fill="none"
        stroke="url(#ck-logo-g)"
        strokeOpacity="0.45"
      />
      <path
        d="M14 33V15h6.4c5.4 0 8.7 3.4 8.7 9s-3.3 9-8.7 9H14Zm4.6-3.9h1.6c2.8 0 4.3-1.9 4.3-5.1s-1.5-5.1-4.3-5.1h-1.6v10.2Z"
        fill="url(#ck-logo-g)"
      />
      <path
        d="M34 18.5 30.6 25h3.6l-3.4 6.2"
        fill="none"
        stroke="url(#ck-logo-g)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ size = 34, className, showWordmark = true, subtitle }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="text-gold-500">
        <LogoMark size={size} />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] font-semibold tracking-tight text-[rgb(var(--ck-text))]">
            CampusKit
            <span className="ck-gold-text"> Private</span>
          </span>
          {subtitle && (
            <span className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] ck-faint">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
