import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Toast } from '@/types';
import { uid } from '@/lib/id';

interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'> & { id?: string }) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  gold: (title: string, description?: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback<ToastContextValue['push']>(
    (toast) => {
      const id = toast.id ?? uid('toast');
      const entry: Toast = { ...toast, id };
      setToasts((prev) => [...prev.slice(-3), entry]);
      const timer = window.setTimeout(() => dismiss(id), 5200);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      push,
      dismiss,
      success: (title, description) => push({ title, description, variant: 'success' }),
      error: (title, description) => push({ title, description, variant: 'error' }),
      info: (title, description) => push({ title, description, variant: 'info' }),
      gold: (title, description) => push({ title, description, variant: 'gold' }),
    }),
    [toasts, push, dismiss],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider.');
  return ctx;
}
