import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <header className="mb-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="ck-eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="font-display text-[1.7rem] font-semibold leading-tight tracking-tight text-[rgb(var(--ck-text))] sm:text-[2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[0.86rem] leading-relaxed ck-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
