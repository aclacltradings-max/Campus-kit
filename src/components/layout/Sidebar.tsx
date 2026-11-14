import { NavLink, useNavigate } from 'react-router-dom';
import { Crown, Plus, Sparkles, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NAV_SECTIONS } from '@/components/layout/nav';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { planLimitLabel } from '@/lib/plans';
import { isOverdue, isUpcoming } from '@/lib/tasks';
import { cn } from '@/lib/cn';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { tasks, plan, entitlements, activeTaskCount, isPremium } = useWorkspace();
  const { createTask } = useTaskDialog();
  const navigate = useNavigate();

  const badges = {
    myDay: tasks.filter((t) => t.inMyDay && t.status !== 'completed' && !t.archived).length,
    overdue: tasks.filter((t) => isOverdue(t) && !t.archived).length,
    upcoming: tasks.filter((t) => isUpcoming(t) && !t.archived).length,
  };

  const usagePct =
    entitlements.maxActiveTasks === Infinity
      ? 0
      : Math.min(100, Math.round((activeTaskCount / entitlements.maxActiveTasks) * 100));

  return (
    <div className="flex h-full flex-col gap-5 px-4 py-5">
      <div className="flex items-center justify-between">
        <Logo subtitle="Task workspace" />
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="ck-btn-quiet h-8 w-8 rounded-lg lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          createTask();
          onNavigate?.();
        }}
        className="ck-btn-gold h-11 w-full px-4"
      >
        <Plus className="h-4 w-4" />
        New task
      </button>

      <nav className="flex-1 space-y-6 overflow-y-auto pb-2 no-scrollbar">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[0.62rem] font-semibold uppercase tracking-[0.2em] ck-faint">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const count = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) => cn('ck-nav-item', isActive && 'ck-nav-item-active')}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count > 0 && (
                        <span
                          className={cn(
                            'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.66rem] font-bold',
                            item.badgeKey === 'overdue'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-gold-500/18 text-gold-300',
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="rounded-2xl border border-[rgb(var(--ck-border)/0.1)] bg-[rgb(var(--ck-border)/0.03)] p-4">
        <div className="flex items-center justify-between">
          <span className="ck-eyebrow">{plan.name} plan</span>
          {isPremium ? (
            <Crown className="h-3.5 w-3.5 text-gold-400" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-gold-400" />
          )}
        </div>

        <p className="mt-2 text-[0.75rem] ck-muted">
          {entitlements.maxActiveTasks === Infinity
            ? activeTaskCount + ' active tasks - unlimited'
            : activeTaskCount + ' of ' + planLimitLabel(entitlements.maxActiveTasks) + ' tasks used'}
        </p>

        {entitlements.maxActiveTasks !== Infinity && (
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--ck-border)/0.1)]">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-premium',
                usagePct > 85
                  ? 'bg-gradient-to-r from-rose-400 to-rose-600'
                  : 'bg-gradient-to-r from-gold-300 to-gold-600',
              )}
              style={{ width: Math.max(4, usagePct) + '%' }}
            />
          </div>
        )}

        {!isPremium && (
          <button
            type="button"
            onClick={() => {
              navigate('/app/upgrade');
              onNavigate?.();
            }}
            className="ck-btn-gold mt-3.5 h-9 w-full text-[0.8rem]"
          >
            <Crown className="h-3.5 w-3.5" />
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
}
