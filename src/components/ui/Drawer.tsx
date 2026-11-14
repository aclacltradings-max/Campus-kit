import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'left';
}

export function Drawer({ open, onClose, title, subtitle, children, footer, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[95]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Panel'}
        className={cn(
          'absolute top-0 flex h-full w-full max-w-[30rem] flex-col ck-glass shadow-lift',
          side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-right',
        )}
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold-500/40 to-transparent" />
        <header className="flex items-start justify-between gap-4 border-b border-[rgb(var(--ck-border)/0.07)] px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-lg font-semibold leading-tight text-[rgb(var(--ck-text))]">
                {title}
              </h2>
            )}
            {subtitle && <div className="mt-1 text-[0.78rem] ck-muted">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="ck-btn-quiet h-8 w-8 shrink-0 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <footer className="ck-safe-bottom border-t border-[rgb(var(--ck-border)/0.07)] px-5 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body,
  );
}
