import type { Category, Task } from '@/types';
import { downloadFile } from '@/lib/storage';
import { formatDate } from '@/lib/date';
import { priorityMeta } from '@/lib/priority';

export interface ExportPayload {
  app: string;
  version: number;
  exportedAt: string;
  tasks: Task[];
  categories: Category[];
}

export function buildExportPayload(tasks: Task[], categories: Category[]): ExportPayload {
  return {
    app: 'CampusKit Private',
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    categories,
  };
}

export function toJSON(tasks: Task[], categories: Category[]): string {
  return JSON.stringify(buildExportPayload(tasks, categories), null, 2);
}

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCSV(tasks: Task[], categories: Category[]): string {
  const categoryName = (id: string | null): string =>
    categories.find((c) => c.id === id)?.name ?? '';
  const header = [
    'Title',
    'Status',
    'Priority',
    'Category',
    'Tags',
    'Start date',
    'Deadline',
    'Reminder',
    'Recurrence',
    'Subtasks',
    'Estimate (min)',
    'In My Day',
    'Created',
    'Completed',
    'Description',
  ];
  const rows = tasks.map((t) => {
    const done = t.subtasks.filter((s) => s.done).length;
    return [
      t.title,
      t.status,
      priorityMeta(t.priority).label,
      categoryName(t.categoryId),
      t.tags.join(' | '),
      t.startDate ? formatDate(t.startDate, 'YYYY-MM-DD') : '',
      t.dueDate ? formatDate(t.dueDate, 'YYYY-MM-DD') : '',
      t.reminderAt ? formatDate(t.reminderAt, 'YYYY-MM-DD') : '',
      t.recurrence,
      t.subtasks.length ? `${done}/${t.subtasks.length}` : '',
      t.estimatedMinutes ?? '',
      t.inMyDay ? 'yes' : 'no',
      formatDate(t.createdAt, 'YYYY-MM-DD'),
      t.completedAt ? formatDate(t.completedAt, 'YYYY-MM-DD') : '',
      t.description.replace(/\s+/g, ' ').trim(),
    ].map(csvCell);
  });
  return [header.map(csvCell).join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function toMarkdown(tasks: Task[], categories: Category[], stats: { total: number; completed: number }): string {
  const categoryName = (id: string | null): string =>
    categories.find((c) => c.id === id)?.name ?? 'Uncategorised';
  const lines: string[] = [];
  lines.push('# CampusKit Private — Task Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push(`**Total tasks:** ${stats.total}  `);
  lines.push(`**Completed:** ${stats.completed}  `);
  lines.push(
    `**Completion rate:** ${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%`,
  );
  lines.push('');

  const groups = new Map<string, Task[]>();
  tasks.forEach((task) => {
    const key = task.status === 'completed' ? 'Completed' : 'Active';
    const bucket = groups.get(key) ?? [];
    bucket.push(task);
    groups.set(key, bucket);
  });

  (['Active', 'Completed'] as const).forEach((group) => {
    const list = groups.get(group);
    if (!list?.length) return;
    lines.push(`## ${group}`);
    lines.push('');
    list
      .sort((a, b) => a.title.localeCompare(b.title))
      .forEach((task) => {
        const checkbox = task.status === 'completed' ? 'x' : ' ';
        const due = task.dueDate ? ` — due ${formatDate(task.dueDate)}` : '';
        lines.push(`- [${checkbox}] **${task.title}**${due}`);
        lines.push(
          `  - ${priorityMeta(task.priority).label} priority · ${categoryName(task.categoryId)}`,
        );
        if (task.tags.length) lines.push(`  - Tags: ${task.tags.join(', ')}`);
        if (task.description.trim()) lines.push(`  - ${task.description.trim()}`);
      });
    lines.push('');
  });

  return lines.join('\n');
}

export function exportTasks(
  format: 'json' | 'csv' | 'markdown',
  tasks: Task[],
  categories: Category[],
  stats: { total: number; completed: number },
): string {
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === 'json') {
    downloadFile(`campuskit-export-${stamp}.json`, toJSON(tasks, categories), 'application/json');
    return 'JSON backup downloaded.';
  }
  if (format === 'csv') {
    downloadFile(`campuskit-export-${stamp}.csv`, toCSV(tasks, categories), 'text/csv');
    return 'CSV spreadsheet downloaded.';
  }
  downloadFile(`campuskit-report-${stamp}.md`, toMarkdown(tasks, categories, stats), 'text/markdown');
  return 'Markdown report downloaded.';
}
