import type { DateFormat, TimeFormat } from '@/types';

export const MS_DAY = 86_400_000;

export function startOfDay(input: Date | string | number = new Date()): Date {
  const d = new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(input: Date | string | number = new Date()): Date {
  const d = new Date(input);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(input: Date | string | number, amount: number): Date {
  const d = new Date(input);
  d.setDate(d.getDate() + amount);
  return d;
}

export function addMonths(input: Date | string | number, amount: number): Date {
  const d = new Date(input);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + amount);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

export function addYears(input: Date | string | number, amount: number): Date {
  const d = new Date(input);
  d.setFullYear(d.getFullYear() + amount);
  return d;
}

export function startOfWeek(input: Date | string | number, weekStartsOn: 0 | 1 = 1): Date {
  const d = startOfDay(input);
  const diff = (d.getDay() - weekStartsOn + 7) % 7;
  return addDays(d, -diff);
}

export function endOfWeek(input: Date | string | number, weekStartsOn: 0 | 1 = 1): Date {
  return endOfDay(addDays(startOfWeek(input, weekStartsOn), 6));
}

export function startOfMonth(input: Date | string | number = new Date()): Date {
  const d = startOfDay(input);
  d.setDate(1);
  return d;
}

export function endOfMonth(input: Date | string | number = new Date()): Date {
  const d = startOfMonth(input);
  d.setMonth(d.getMonth() + 1);
  return endOfDay(addDays(d, -1));
}

export function isSameDay(a: Date | string | number, b: Date | string | number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function isToday(input: Date | string | number): boolean {
  return isSameDay(input, new Date());
}

export function isTomorrow(input: Date | string | number): boolean {
  return isSameDay(input, addDays(new Date(), 1));
}

export function isYesterday(input: Date | string | number): boolean {
  return isSameDay(input, addDays(new Date(), -1));
}

export function isPast(input: Date | string | number): boolean {
  return new Date(input).getTime() < Date.now();
}

export function isWeekend(input: Date | string | number): boolean {
  const day = new Date(input).getDay();
  return day === 0 || day === 6;
}

export function diffInDays(a: Date | string | number, b: Date | string | number): number {
  const from = startOfDay(a).getTime();
  const to = startOfDay(b).getTime();
  return Math.round((to - from) / MS_DAY);
}

export function formatDate(
  input: Date | string | number | null | undefined,
  format: DateFormat = 'DD/MM/YYYY',
): string {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  switch (format) {
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
}

export function formatTime(
  input: Date | string | number | null | undefined,
  format: TimeFormat = '24h',
): string {
  if (!input) return '—';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '—';
  if (format === '12h') {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatDateTime(
  input: Date | string | number | null | undefined,
  dateFormat: DateFormat = 'DD/MM/YYYY',
  timeFormat: TimeFormat = '24h',
): string {
  if (!input) return '—';
  return `${formatDate(input, dateFormat)} · ${formatTime(input, timeFormat)}`;
}

/** Human relative label such as "Today", "Tomorrow", "in 3 days", "2 days ago". */
export function relativeDayLabel(input: Date | string | number): string {
  const days = diffInDays(new Date(), input);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 1 && days < 7) return `In ${days} days`;
  if (days < -1 && days > -7) return `${Math.abs(days)} days ago`;
  return formatDate(input);
}

export function relativeTimeFromNow(input: Date | string | number): string {
  const diff = new Date(input).getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60_000);
  const suffix = diff >= 0 ? '' : ' ago';
  const prefix = diff >= 0 ? 'in ' : '';
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${prefix}${minutes}m${suffix}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${prefix}${hours}h${suffix}`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${prefix}${days}d${suffix}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${prefix}${months}mo${suffix}`;
  return `${prefix}${Math.round(months / 12)}y${suffix}`;
}

export function toDateInputValue(input: Date | string | number | null | undefined): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function toTimeInputValue(input: Date | string | number | null | undefined): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function combineDateAndTime(date: string, time: string): string | null {
  if (!date) return null;
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = (time || '23:59').split(':').map(Number);
  const result = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
  if (Number.isNaN(result.getTime())) return null;
  return result.toISOString();
}

export function weekdayName(index: number, short = false): string {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const name = names[((index % 7) + 7) % 7];
  return short ? name.slice(0, 3) : name;
}

export function monthName(index: number, short = false): string {
  const names = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const name = names[((index % 12) + 12) % 12];
  return short ? name.slice(0, 3) : name;
}

export function monthMatrix(year: number, month: number, weekStartsOn: 0 | 1 = 1): Date[][] {
  const first = new Date(year, month, 1);
  const start = startOfWeek(first, weekStartsOn);
  const weeks: Date[][] = [];
  let cursor = start;
  for (let w = 0; w < 6; w += 1) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d += 1) {
      row.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }
    weeks.push(row);
  }
  return weeks;
}

export function greeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
