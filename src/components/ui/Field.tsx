import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function FieldShell({
  label,
  hint,
  error,
  required,
  className,
  children,
  htmlFor,
}: FieldShellProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="ck-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-rose-400">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[0.72rem] font-medium text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[0.72rem] ck-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leading, trailing, className, id, required, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--ck-text-faint))]">
            {leading}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cn('ck-input', error && 'ck-input-error', leading && 'pl-9', trailing && 'pr-10', className)}
          {...rest}
        />
        {trailing && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgb(var(--ck-text-faint))]">
            {trailing}
          </span>
        )}
      </div>
    </FieldShell>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, required, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        className={cn('ck-input resize-y leading-relaxed', error && 'ck-input-error', className)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, className, children, id, required, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <select
        ref={ref}
        id={inputId}
        required={required}
        className={cn('ck-input cursor-pointer appearance-none pr-9', error && 'ck-input-error', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239A9AA8' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.7rem center',
          backgroundSize: '1.05rem',
        }}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
});

export function Checkbox({
  label,
  description,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; description?: string }) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3 select-none', className)}>
      <input type="checkbox" className="ck-checkbox mt-0.5" {...rest} />
      <span>
        <span className="block text-sm font-medium text-[rgb(var(--ck-text))]">{label}</span>
        {description && <span className="mt-0.5 block text-[0.75rem] ck-muted">{description}</span>}
      </span>
    </label>
  );
}
