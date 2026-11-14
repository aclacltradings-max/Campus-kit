import type { Priority, TaskStatus } from '@/types';

export interface PriorityMeta {
  value: Priority;
  label: string;
  weight: number;
  text: string;
  bg: string;
  border: string;
  dot: string;
  glow: string;
}

export const PRIORITIES: PriorityMeta[] = [
  {
    value: 'urgent',
    label: 'Urgent',
    weight: 4,
    text: 'text-rose-400',
    bg: 'bg-rose-500/12',
    border: 'border-rose-500/35',
    dot: 'bg-rose-400',
    glow: 'shadow-[0_0_18px_-6px_rgba(244,63,94,0.8)]',
  },
  {
    value: 'high',
    label: 'High',
    weight: 3,
    text: 'text-amber-400',
    bg: 'bg-amber-500/12',
    border: 'border-amber-500/35',
    dot: 'bg-amber-400',
    glow: 'shadow-[0_0_18px_-6px_rgba(245,158,11,0.75)]',
  },
  {
    value: 'medium',
    label: 'Medium',
    weight: 2,
    text: 'text-gold-300',
    bg: 'bg-gold-500/12',
    border: 'border-gold-500/32',
    dot: 'bg-gold-400',
    glow: 'shadow-[0_0_18px_-6px_rgba(212,175,55,0.7)]',
  },
  {
    value: 'low',
    label: 'Low',
    weight: 1,
    text: 'text-ink-200',
    bg: 'bg-ink-400/14',
    border: 'border-ink-400/30',
    dot: 'bg-ink-300',
    glow: '',
  },
];

const PRIORITY_MAP = new Map(PRIORITIES.map((p) => [p.value, p]));

export function priorityMeta(priority: Priority): PriorityMeta {
  return PRIORITY_MAP.get(priority) ?? PRIORITIES[2];
}

export function priorityWeight(priority: Priority): number {
  return priorityMeta(priority).weight;
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; text: string; bg: string; border: string; dot: string }
> = {
  todo: {
    label: 'To do',
    text: 'text-ink-200',
    bg: 'bg-ink-400/12',
    border: 'border-ink-400/28',
    dot: 'bg-ink-300',
  },
  in_progress: {
    label: 'In progress',
    text: 'text-gold-300',
    bg: 'bg-gold-500/12',
    border: 'border-gold-500/32',
    dot: 'bg-gold-400',
  },
  completed: {
    label: 'Completed',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/12',
    border: 'border-emerald-500/32',
    dot: 'bg-emerald-400',
  },
};

export const CATEGORY_COLORS = [
  '#D4AF37',
  '#E5BC45',
  '#F5DF96',
  '#34D399',
  '#38BDF8',
  '#A78BFA',
  '#FB7185',
  '#F59E0B',
  '#22D3EE',
  '#F472B6',
  '#84CC16',
  '#94A3B8',
];
