import { LocalNotifications } from '@capacitor/local-notifications';
import type { Task } from '@/types';
import { isNative, attempt } from '@/lib/platform';

/**
 * Tapping a deadline reminder should open the task it is about, not just launch
 * the app. The plugin reports the tap, the workspace looks the task up and the
 * dialog context opens it.
 */
export function onNotificationTap(handler: (taskId: string) => void): () => void {
  if (!isNative) return () => {};

  let handle: { remove: () => void } | undefined;
  void LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    const taskId = action.notification.extra?.taskId;
    if (typeof taskId === 'string') handler(taskId);
  }).then((h) => {
    handle = h;
  });

  return () => handle?.remove();
}

/**
 * Android only accepts 32-bit ints as notification ids, but task ids are strings.
 * Hash to a stable int so a task always maps to the same notification, which is
 * what lets us cancel or replace one without rescheduling everything.
 *
 * The result is offset past RESERVED_NOTIFICATION_IDS so a task can never collide
 * with the fixed ids used by immediate system alerts.
 */
const RESERVED_NOTIFICATION_IDS = 1000;

export function notificationIdForTask(taskId: string): number {
  let hash = 0;
  for (let i = 0; i < taskId.length; i += 1) {
    hash = (hash * 31 + taskId.charCodeAt(i)) | 0;
  }
  // Keep it positive and inside the signed 32-bit range Android requires.
  return RESERVED_NOTIFICATION_IDS + (Math.abs(hash) % 2000000000);
}

const CHANNEL_ID = 'campuskit-deadlines';

/** Tasks that should currently have a reminder scheduled in the OS. */
export function schedulableTasks(tasks: Task[], notificationsEnabled: boolean): Task[] {
  if (!notificationsEnabled) return [];
  const now = Date.now();
  return tasks.filter(
    (task) =>
      !task.archived &&
      task.status !== 'completed' &&
      !!task.reminderAt &&
      new Date(task.reminderAt).getTime() > now,
  );
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNative) {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await attempt(() => Notification.requestPermission());
    return result === 'granted';
  }

  const status = await attempt(() => LocalNotifications.checkPermissions());
  if (status?.display === 'granted') return true;
  const requested = await attempt(() => LocalNotifications.requestPermissions());
  return requested?.display === 'granted';
}

export async function notificationPermissionGranted(): Promise<boolean> {
  if (!isNative) {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }
  const status = await attempt(() => LocalNotifications.checkPermissions());
  return status?.display === 'granted';
}

/**
 * Android 12+ gates exact alarms behind a separate user setting. Without it the
 * OS still delivers reminders, but batches them into inexact windows, so a
 * deadline can fire late. We surface the setting rather than silently accepting
 * drift: the caller decides whether to send the user to it.
 */
export async function hasExactAlarmPermission(): Promise<boolean> {
  if (!isNative) return true;
  const status = await attempt(() => LocalNotifications.checkExactNotificationSetting());
  return status?.exact_alarm === 'granted';
}

/** Opens the system screen where the user grants exact-alarm access. */
export async function requestExactAlarmPermission(): Promise<boolean> {
  if (!isNative) return true;
  const status = await attempt(() => LocalNotifications.changeExactNotificationSetting());
  return status?.exact_alarm === 'granted';
}

/** Creates the Android notification channel. No-op elsewhere. */
export async function initNotificationChannel(): Promise<void> {
  if (!isNative) return;
  await attempt(() =>
    LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Deadline reminders',
      description: 'Alerts for task and assignment deadlines.',
      importance: 4,
      visibility: 1,
      vibration: true,
    }),
  );
}

/**
 * Reconciles the OS schedule with the current task list: cancels reminders for
 * tasks that were completed, deleted or rescheduled, and schedules the rest.
 *
 * This is a full sync rather than an incremental one. Reminders are cheap and the
 * task list is small, so a full reconcile is simpler and cannot drift out of step
 * with the app state after an import or restore.
 */
export async function syncScheduledReminders(
  tasks: Task[],
  notificationsEnabled: boolean,
): Promise<void> {
  if (!isNative) return;
  if (!(await notificationPermissionGranted())) return;

  const desired = schedulableTasks(tasks, notificationsEnabled);
  const desiredIds = new Set(desired.map((task) => notificationIdForTask(task.id)));

  const pending = await attempt(() => LocalNotifications.getPending());
  const staleIds = (pending?.notifications ?? [])
    .map((n) => n.id)
    .filter((id) => !desiredIds.has(id));

  if (staleIds.length) {
    await attempt(() => LocalNotifications.cancel({ notifications: staleIds.map((id) => ({ id })) }));
  }

  if (!desired.length) return;

  await attempt(() =>
    LocalNotifications.schedule({
      notifications: desired.map((task) => ({
        id: notificationIdForTask(task.id),
        title: 'CampusKit deadline',
        body: task.title,
        largeBody: task.description?.trim() || undefined,
        schedule: { at: new Date(task.reminderAt as string), allowWhileIdle: true },
        channelId: CHANNEL_ID,
        smallIcon: 'ic_stat_campuskit',
        iconColor: '#D4AF37',
        autoCancel: true,
        extra: { taskId: task.id },
      })),
    }),
  );
}

/** Cancels every scheduled reminder — used when notifications are switched off. */
export async function cancelAllReminders(): Promise<void> {
  if (!isNative) return;
  await attempt(() => LocalNotifications.cancelAll());
}

/** Fire an immediate notification (overdue alerts, test alerts). */
export async function notifyNow(title: string, body: string, id = 1): Promise<void> {
  if (isNative) {
    if (!(await notificationPermissionGranted())) return;
    await attempt(() =>
      LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            channelId: CHANNEL_ID,
            smallIcon: 'ic_stat_campuskit',
            iconColor: '#D4AF37',
            autoCancel: true,
          },
        ],
      }),
    );
    return;
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    await attempt(async () => {
      new Notification(title, { body });
    });
  }
}
