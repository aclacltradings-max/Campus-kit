import { createPortal } from 'react-dom';
import { CheckCircle2, Info, Sparkles, X, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/cn';

const VARIANTS = {
  success: { icon: CheckCircle2, ring: 'border-emerald-500/35', text: 'text-emerald-400' },
  error: { icon: XCircle, ring: 'border-rose-500/35', text: 'text-rose-400' },
  info: { icon: Info, ring: 'border-[rgb(var(--ck-border)/0.16)]', text: 'text-[rgb(var(--ck-text-muted))]' },
  gold: { icon: Sparkles, ring: 'border-gold-500/45', text: 'text-gold-300' },
} as const;

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex flex-col items-center gap-2 p-3 sm:inset-x-auto sm:right-5 sm:top-5 sm:bottom-auto sm:items-end sm:p-0">
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.variant];
        const Icon = variant.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 ck-glass animate-fade-up shadow-lift',
              variant.ring,
            )}
          >
            <Icon className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', variant.text)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[rgb(var(--ck-text))]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[0.76rem] leading-snug ck-muted">{toast.description}</p>
              )}
              {toast.action && (
                <button
                  type="button"
                  onClick={() => {
                    toast.action?.onClick();
                    dismiss(toast.id);
                  }}
                  className="mt-2 text-[0.75rem] font-semibold text-gold-300 hover:underline"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="ck-btn-quiet h-6 w-6 shrink-0 rounded-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
