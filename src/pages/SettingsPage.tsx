import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Crown,
  Database,
  Download,
  Moon,
  Palette,
  RefreshCw,
  RotateCcw,
  Settings as SettingsIcon,
  Sun,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Toggle } from '@/components/ui/Toggle';
import { Segmented } from '@/components/ui/Segmented';
import { ConfirmDialog } from '@/components/ui/Modal';
import { exportTasks } from '@/lib/export';
import { parseImportPayload, validateDisplayName, validateEmail } from '@/lib/validation';
import { clearAll, estimateStorageBytes, formatBytes } from '@/lib/storage';
import {
  ensureNotificationPermission,
  hasExactAlarmPermission,
  initNotificationChannel,
  requestExactAlarmPermission,
  syncScheduledReminders,
} from '@/lib/notifications';
import { isNative } from '@/lib/platform';
import { computeStats } from '@/lib/tasks';
import type { DateFormat, DefaultView, Density, TimeFormat } from '@/types';

export function SettingsPage() {
  const {
    settings,
    updateSettings,
    tasks,
    categories,
    subscription,
    entitlements,
    isPremium,
    importTasks,
    resetDemo,
    clearTasks,
    resetAll,
  } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nameDraft, setNameDraft] = useState(settings.displayName);
  const [emailDraft, setEmailDraft] = useState(settings.email);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | 'clear' | 'reset'>(null);
  const [needsExactAlarm, setNeedsExactAlarm] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const storage = useMemo(() => formatBytes(estimateStorageBytes()), [tasks, categories, settings, subscription]);

  const saveProfile = () => {
    const nameErr = validateDisplayName(nameDraft);
    const emailErr = validateEmail(emailDraft);
    setNameError(nameErr);
    setEmailError(emailErr);
    if (nameErr || emailErr) return;
    updateSettings({ displayName: nameDraft.trim(), email: emailDraft.trim() });
    toast.success('Profile updated');
  };

  // Android 12+ needs a separate grant before reminders can fire at an exact
  // time. Check it once on mount so the prompt is visible before the user relies
  // on a deadline alert.
  useEffect(() => {
    if (!isNative) return;
    void hasExactAlarmPermission().then((ok) => setNeedsExactAlarm(!ok));
  }, []);

  const enableNotifications = async () => {
    const granted = await ensureNotificationPermission();
    if (!granted) {
      toast.info('Notifications blocked', 'Enable them in your device settings to receive deadline alerts.');
      return false;
    }
    await initNotificationChannel();
    updateSettings({ notificationsEnabled: true });
    // Schedule immediately so the user gets the benefit without waiting for the
    // next background sync.
    await syncScheduledReminders(tasks, true);
    if (isNative) {
      const exact = await hasExactAlarmPermission();
      setNeedsExactAlarm(!exact);
      if (!exact) {
        toast.info(
          'One more step',
          'Allow exact alarms so reminders arrive on time rather than in a batched window.',
        );
      } else {
        toast.success('Notifications enabled', 'You will be alerted before deadlines, even when the app is closed.');
      }
    } else {
      toast.success('Notifications enabled', 'You will be alerted before deadlines.');
    }
    return true;
  };

  const handleNotificationsToggle = async (next: boolean) => {
    if (!next) {
      updateSettings({ notificationsEnabled: false });
      return;
    }
    await enableNotifications();
  };

  const grantExactAlarms = async () => {
    const granted = await requestExactAlarmPermission();
    setNeedsExactAlarm(!granted);
    if (granted) {
      toast.success('Exact alarms allowed', 'Deadline reminders will now arrive on time.');
    } else {
      toast.info('Still off', 'You can enable exact alarms later from your device settings.');
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'markdown') => {
    if (!entitlements.exportFormats.includes(format)) {
      toast.error('Upgrade required', format.toUpperCase() + ' export is a Premium capability.');
      return;
    }
    try {
      const message = await exportTasks(format, tasks, categories, {
        total: stats.total,
        completed: stats.completed,
      });
      toast.success('Export complete', message);
    } catch (error) {
      console.error('[CampusKit] Export failed.', error);
      toast.error('Export failed', 'The file could not be written. Check storage permissions.');
    }
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const { tasks: imported, error } = parseImportPayload(text);
    if (error) {
      toast.error('Import failed', error);
      return;
    }
    importTasks(imported, undefined, importMode);
  };

  return (
    <>
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Tune CampusKit to the way you work, and keep your data safe."
        actions={
          <Button variant="ghost" icon={<RotateCcw className="h-4 w-4" />} onClick={resetAll}>
            Reset everything
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Profile" subtitle="How the workspace addresses you" action={<User className="h-4 w-4 text-gold-400" />}>
          <div className="space-y-4">
            <Input
              label="Display name"
              value={nameDraft}
              error={nameError ?? undefined}
              onChange={(e) => {
                setNameDraft(e.target.value);
                setNameError(null);
              }}
            />
            <Input
              label="Email for receipts"
              type="email"
              value={emailDraft}
              error={emailError ?? undefined}
              placeholder="you@example.com"
              hint="Used on the checkout screen when a payment provider is connected."
              onChange={(e) => {
                setEmailDraft(e.target.value);
                setEmailError(null);
              }}
            />
            <Button variant="gold" onClick={saveProfile}>
              Save profile
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Appearance" subtitle="Theme and density" action={<Palette className="h-4 w-4 text-gold-400" />}>
          <div className="space-y-5">
            <div>
              <span className="ck-label">Theme</span>
              <Segmented
                value={theme}
                onChange={(v) => {
                  if (v === 'light' && !entitlements.lightTheme) {
                    toast.error('Light theme is Premium', 'Upgrade to switch to the ivory palette.');
                    return;
                  }
                  setTheme(v as typeof theme);
                }}
                options={[
                  { value: 'dark', label: 'Dark', icon: <Moon className="h-3 w-3" /> },
                  { value: 'light', label: 'Light', icon: <Sun className="h-3 w-3" /> },
                  { value: 'system', label: 'System' },
                ]}
              />
              {!entitlements.lightTheme && (
                <p className="mt-2 text-[0.72rem] ck-faint">
                  The light theme is part of Premium. Dark stays on for now.
                </p>
              )}
            </div>

            <div>
              <span className="ck-label">Density</span>
              <Segmented
                value={settings.density}
                onChange={(v) => updateSettings({ density: v as Density })}
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'compact', label: 'Compact' },
                ]}
              />
            </div>

            <Toggle
              checked={settings.reduceMotion}
              onChange={(v) => updateSettings({ reduceMotion: v })}
              label="Reduce motion"
              description="Tone down animations across the interface."
            />
          </div>
        </SectionCard>

        <SectionCard title="Dates and time" subtitle="Formatting across the workspace" action={<SettingsIcon className="h-4 w-4 text-gold-400" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Date format"
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value as DateFormat })}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
            <Select
              label="Time format"
              value={settings.timeFormat}
              onChange={(e) => updateSettings({ timeFormat: e.target.value as TimeFormat })}
            >
              <option value="24h">24 hour</option>
              <option value="12h">12 hour</option>
            </Select>
            <Select
              label="Week starts on"
              value={String(settings.weekStartsOn)}
              onChange={(e) => updateSettings({ weekStartsOn: Number(e.target.value) === 0 ? 0 : 1 })}
            >
              <option value="1">Monday</option>
              <option value="0">Sunday</option>
            </Select>
            <Select
              label="Default landing view"
              value={settings.defaultView}
              onChange={(e) => updateSettings({ defaultView: e.target.value as DefaultView })}
            >
              <option value="dashboard">Dashboard</option>
              <option value="my-day">My Day</option>
              <option value="upcoming">Upcoming</option>
              <option value="tasks">All Tasks</option>
              <option value="calendar">Calendar</option>
              <option value="analytics">Analytics</option>
            </Select>
          </div>
        </SectionCard>

        <SectionCard title="Notifications and reminders" subtitle="Stay ahead of deadlines" action={<Bell className="h-4 w-4 text-gold-400" />}>
          <div className="space-y-5">
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => void handleNotificationsToggle(v)}
              label="Notifications and reminders"
              description="Reminder and overdue alerts, delivered even when the app is closed."
            />
            <div>
              <span className="ck-label">Reminder lead time</span>
              <Segmented
                value={String(settings.reminderLeadMinutes)}
                onChange={(v) => updateSettings({ reminderLeadMinutes: Number(v) })}
                size="sm"
                options={[
                  { value: '5', label: '5 min' },
                  { value: '15', label: '15 min' },
                  { value: '30', label: '30 min' },
                  { value: '60', label: '1 hour' },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => void enableNotifications()} icon={<Bell className="h-3.5 w-3.5" />}>
                {isNative ? 'Allow notifications' : 'Enable browser notifications'}
              </Button>
              {needsExactAlarm && (
                <Button variant="gold" size="sm" onClick={() => void grantExactAlarms()} icon={<Bell className="h-3.5 w-3.5" />}>
                  Allow exact alarms
                </Button>
              )}
              {!entitlements.reminders && (
                <span className="ck-chip text-gold-300">
                  <Crown className="h-3 w-3" /> Reminders are Premium
                </span>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Task behaviour" subtitle="Automation and safety" action={<RefreshCw className="h-4 w-4 text-gold-400" />}>
          <div className="space-y-5">
            <Toggle
              checked={settings.autoArchiveCompleted}
              onChange={(v) => updateSettings({ autoArchiveCompleted: v })}
              label="Archive tasks on completion"
              description="Keep active lists clean by hiding finished tasks automatically."
            />
            <Toggle
              checked={settings.confirmBeforeDelete}
              onChange={(v) => updateSettings({ confirmBeforeDelete: v })}
              label="Confirm before deleting"
              description="Ask before a task or category is removed."
            />
            <Toggle
              checked={settings.dailyDigest}
              onChange={(v) => updateSettings({ dailyDigest: v })}
              label="Daily digest"
              description="A single summary of today's plan when the app opens."
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Data and storage"
          subtitle={storage + ' used on this device'}
          action={<Database className="h-4 w-4 text-gold-400" />}
        >
          <div className="space-y-4">
            <dl className="grid grid-cols-3 gap-3">
              <DataStat label="Tasks" value={String(tasks.length)} />
              <DataStat label="Categories" value={String(categories.length)} />
              <DataStat label="Plan" value={isPremium ? 'Premium' : 'Free'} />
            </dl>

            <div>
              <span className="ck-label">Export data</span>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => handleExport('json')}>
                  JSON
                </Button>
                <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => handleExport('csv')}>
                  CSV {!entitlements.exportFormats.includes('csv') && <Crown className="h-3 w-3 text-gold-400" />}
                </Button>
                <Button variant="ghost" size="sm" icon={<Download className="h-3.5 w-3.5" />} onClick={() => handleExport('markdown')}>
                  Markdown {!entitlements.exportFormats.includes('markdown') && <Crown className="h-3 w-3 text-gold-400" />}
                </Button>
              </div>
            </div>

            <div>
              <span className="ck-label">Import data</span>
              <Segmented
                value={importMode}
                onChange={(v) => setImportMode(v as 'merge' | 'replace')}
                size="sm"
                options={[
                  { value: 'merge', label: 'Merge' },
                  { value: 'replace', label: 'Replace all' },
                ]}
              />
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = '';
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                icon={<Upload className="h-3.5 w-3.5" />}
                onClick={() => fileRef.current?.click()}
              >
                Choose a JSON file
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[rgb(var(--ck-border)/0.08)] pt-4">
              <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={resetDemo}>
                Load sample data
              </Button>
              <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setConfirm('clear')}>
                Clear all tasks
              </Button>
            </div>
          </div>
        </SectionCard>
      </div>

      <ConfirmDialog
        open={confirm === 'clear'}
        title="Clear every task?"
        description="This removes all tasks from this device. Categories and settings stay."
        confirmLabel="Clear tasks"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          clearTasks();
          clearAll();
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={confirm === 'reset'}
        title="Reset the workspace?"
        description="Everything returns to defaults, including settings and your plan."
        confirmLabel="Reset"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          resetAll();
          setConfirm(null);
        }}
      />
    </>
  );
}

function DataStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="ck-inset rounded-xl px-3 py-2.5 text-center">
      <p className="text-[0.64rem] font-semibold uppercase tracking-wide ck-faint">{label}</p>
      <p className="mt-1 font-display text-[1rem] font-semibold text-[rgb(var(--ck-text))]">{value}</p>
    </div>
  );
}
