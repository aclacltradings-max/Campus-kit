import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Crown, Menu, Moon, Plus, Search, Sun, User } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTheme } from '@/context/ThemeContext';
import { useTaskDialog } from '@/context/TaskDialogContext';
import { matchesQuery, isOverdue } from '@/lib/tasks';
import { relativeDayLabel } from '@/lib/date';
import { cn } from '@/lib/cn';

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { tasks, settings, isPremium, activeTaskCount } = useWorkspace();
  const { resolved, toggleTheme } = useTheme();
  const { createTask, openTask } = useTaskDialog();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return tasks.filter((t) => !t.archived && matchesQuery(t, query)).slice(0, 6);
  }, [tasks, query]);

  const notifications = useMemo(
    () =>
      tasks
        .filter((t) => !t.archived && t.status !== 'completed' && isOverdue(t))
        .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
        .slice(0, 5),
    [tasks],
  );

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        document.getElementById('global-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--ck-border)/0.07)] ck-glass">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="ck-btn-ghost h-9 w-9 rounded-xl p-0 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div ref={searchRef} className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--ck-text-faint))]" />
          <input
            id="global-search"
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search tasks, tags and descriptions..."
            className="ck-input h-10 pl-9 pr-16"
            aria-label="Search tasks"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-[rgb(var(--ck-border)/0.14)] px-1.5 py-0.5 text-[0.62rem] font-medium ck-faint sm:flex">
            Ctrl K
          </kbd>

          {searchOpen && query.trim() && (
            <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-[rgb(var(--ck-border)/0.12)] ck-glass shadow-lift animate-scale-in">
              {results.length === 0 ? (
                <p className="px-4 py-5 text-center text-[0.8rem] ck-muted">
                  No tasks match your search.
                </p>
              ) : (
                <ul className="py-1">
                  {results.map((task) => (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => {
                          openTask(task);
                          setSearchOpen(false);
                          setQuery('');
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[rgb(var(--ck-border)/0.05)]"
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 shrink-0 rounded-full',
                            task.status === 'completed' ? 'bg-emerald-400' : 'bg-gold-400',
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.84rem] font-medium text-[rgb(var(--ck-text))]">
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="text-[0.7rem] ck-faint">
                              {relativeDayLabel(task.dueDate)}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={() => {
                  navigate('/app/search?q=' + encodeURIComponent(query));
                  setSearchOpen(false);
                }}
                className="w-full border-t border-[rgb(var(--ck-border)/0.08)] px-4 py-2.5 text-left text-[0.76rem] font-semibold text-gold-300 transition-colors hover:bg-gold-500/8"
              >
                Open smart search
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => createTask()}
            className="ck-btn-gold hidden h-10 px-4 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            New task
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle colour theme"
            className={cn('ck-btn-ghost h-9 w-9 rounded-xl p-0', !isPremium && 'opacity-50')}
            title={isPremium ? 'Toggle theme' : 'Light theme is a Premium capability'}
          >
            {resolved === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setBellOpen((v) => !v);
                setUserOpen(false);
              }}
              aria-label="Notifications"
              className="ck-btn-ghost relative h-9 w-9 rounded-xl p-0"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            {bellOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                <div className="absolute right-0 top-12 z-20 w-80 overflow-hidden rounded-2xl border border-[rgb(var(--ck-border)/0.12)] ck-glass shadow-lift animate-scale-in">
                  <div className="flex items-center justify-between border-b border-[rgb(var(--ck-border)/0.08)] px-4 py-3">
                    <p className="text-[0.8rem] font-semibold text-[rgb(var(--ck-text))]">
                      Notifications
                    </p>
                    <span className="text-[0.68rem] ck-faint">
                      {settings.notificationsEnabled ? 'Enabled' : 'Muted'}
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        <Check className="h-4 w-4" />
                      </span>
                      <p className="text-[0.8rem] ck-muted">Nothing overdue. You are on track.</p>
                    </div>
                  ) : (
                    <ul className="max-h-72 overflow-y-auto py-1">
                      {notifications.map((task) => (
                        <li key={task.id}>
                          <button
                            type="button"
                            onClick={() => {
                              openTask(task);
                              setBellOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left transition-colors hover:bg-[rgb(var(--ck-border)/0.05)]"
                          >
                            <span className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                              <span className="truncate text-[0.82rem] font-medium text-[rgb(var(--ck-text))]">
                                {task.title}
                              </span>
                            </span>
                            <span className="mt-0.5 block pl-3.5 text-[0.7rem] text-rose-400">
                              Overdue - {relativeDayLabel(task.dueDate as string)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUserOpen((v) => !v);
                setBellOpen(false);
              }}
              className="flex h-9 items-center gap-2 rounded-xl border border-[rgb(var(--ck-border)/0.12)] px-2 transition-colors hover:border-gold-500/40"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-700 text-[0.7rem] font-bold text-ink-950">
                {(settings.displayName || 'G').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-24 truncate text-[0.78rem] font-medium text-[rgb(var(--ck-text))] sm:block">
                {settings.displayName || 'Guest'}
              </span>
            </button>
            {userOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                <div className="absolute right-0 top-12 z-20 w-64 overflow-hidden rounded-2xl border border-[rgb(var(--ck-border)/0.12)] ck-glass py-1 shadow-lift animate-scale-in">
                  <div className="border-b border-[rgb(var(--ck-border)/0.08)] px-4 py-3">
                    <p className="text-[0.84rem] font-semibold text-[rgb(var(--ck-text))]">
                      {settings.displayName || 'Guest'}
                    </p>
                    <p className="mt-0.5 text-[0.72rem] ck-muted">
                      {settings.email || 'No email set'}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[0.68rem] font-semibold text-gold-300">
                      {isPremium && <Crown className="h-3 w-3" />}
                      {isPremium ? 'Premium member' : 'Free - ' + activeTaskCount + ' tasks'}
                    </p>
                  </div>
                  {[
                    { label: 'Settings', to: '/app/settings', icon: User },
                    {
                      label: isPremium ? 'Manage plan' : 'Upgrade to Premium',
                      to: isPremium ? '/app/billing' : '/app/upgrade',
                      icon: Crown,
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        navigate(item.to);
                        setUserOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[0.8rem] text-[rgb(var(--ck-text-muted))] transition-colors hover:bg-[rgb(var(--ck-border)/0.06)] hover:text-[rgb(var(--ck-text))]"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
