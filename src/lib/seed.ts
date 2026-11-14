import type { Category, Task } from '@/types';
import { createTask } from '@/lib/tasks';
import { addDays, startOfDay } from '@/lib/date';
import { uid } from '@/lib/id';

function at(dayOffset: number, hour = 17, minute = 0): string {
  const d = startOfDay(addDays(new Date(), dayOffset));
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function seedCategories(): Category[] {
  const now = new Date().toISOString();
  return [
    { id: uid('cat'), name: 'Academics', color: '#D4AF37', icon: 'GraduationCap', createdAt: now },
    { id: uid('cat'), name: 'Projects', color: '#38BDF8', icon: 'FolderKanban', createdAt: now },
    { id: uid('cat'), name: 'Personal', color: '#34D399', icon: 'Sparkles', createdAt: now },
  ];
}

export function seedTasks(categories: Category[]): Task[] {
  const [academics, projects, personal] = categories;
  const base = {
    academics: academics?.id ?? null,
    projects: projects?.id ?? null,
    personal: personal?.id ?? null,
  };

  const tasks: Task[] = [
    createTask({
      title: 'Finalise research methodology chapter',
      description:
        'Tighten the sampling rationale, add the validity threats table and send to Dr. Adeyemi for review before the weekend.',
      categoryId: base.academics,
      tags: ['thesis', 'writing'],
      priority: 'urgent',
      status: 'in_progress',
      dueDate: at(0, 16),
      startDate: at(-4, 9),
      reminderAt: at(0, 12),
      estimatedMinutes: 180,
      inMyDay: true,
      recurrence: 'none',
      subtasks: [
        { id: uid('sub'), title: 'Rewrite sampling rationale', done: true },
        { id: uid('sub'), title: 'Add validity threats table', done: false },
        { id: uid('sub'), title: 'Proofread references', done: false },
      ],
    }),
    createTask({
      title: 'Ship the analytics dashboard sprint',
      description:
        'Close the remaining tickets, run the regression suite and prepare the release notes for the client walkthrough.',
      categoryId: base.projects,
      tags: ['sprint', 'release'],
      priority: 'high',
      status: 'in_progress',
      dueDate: at(2, 18),
      startDate: at(-2, 10),
      estimatedMinutes: 240,
      inMyDay: true,
      subtasks: [
        { id: uid('sub'), title: 'Close open tickets', done: true },
        { id: uid('sub'), title: 'Run regression suite', done: false },
      ],
    }),
    createTask({
      title: 'Weekly team stand-up notes',
      description: 'Capture blockers and decisions, then circulate to the group.',
      categoryId: base.projects,
      tags: ['meeting'],
      priority: 'medium',
      status: 'todo',
      dueDate: at(1, 9),
      recurrence: 'weekly',
      estimatedMinutes: 30,
      inMyDay: true,
    }),
    createTask({
      title: 'Renew library loans',
      description: 'Three titles are due back this week — renew online to avoid the fine.',
      categoryId: base.personal,
      tags: ['admin'],
      priority: 'medium',
      status: 'todo',
      dueDate: at(3, 20),
      estimatedMinutes: 15,
    }),
    createTask({
      title: 'Prepare slide deck for project defence',
      description: 'Twelve slides maximum: problem, method, results, limitations, next steps.',
      categoryId: base.academics,
      tags: ['presentation'],
      priority: 'high',
      status: 'todo',
      dueDate: at(6, 14),
      startDate: at(4, 9),
      estimatedMinutes: 150,
    }),
    createTask({
      title: 'Review statistics problem set 4',
      description: 'Focus on hypothesis testing and confidence intervals.',
      categoryId: base.academics,
      tags: ['study'],
      priority: 'medium',
      status: 'todo',
      dueDate: at(4, 21),
      estimatedMinutes: 90,
    }),
    createTask({
      title: 'Book accommodation for the conference',
      description: 'Compare the two venues near the campus and confirm the refundable rate.',
      categoryId: base.personal,
      tags: ['travel'],
      priority: 'low',
      status: 'todo',
      dueDate: at(11, 12),
    }),
    createTask({
      title: 'Submit tuition instalment',
      description: 'Second instalment closes at the end of the month — pay and archive the receipt.',
      categoryId: base.personal,
      tags: ['finance'],
      priority: 'high',
      status: 'todo',
      dueDate: at(-2, 16),
      estimatedMinutes: 20,
    }),
    createTask({
      title: 'Draft literature review outline',
      description: 'Group sources into themes and flag the gaps that need more reading.',
      categoryId: base.academics,
      tags: ['thesis', 'reading'],
      priority: 'medium',
      status: 'completed',
      dueDate: at(-3, 17),
      completedAt: at(-3, 15),
      estimatedMinutes: 120,
    }),
    createTask({
      title: 'Set up continuous integration pipeline',
      description: 'Lint, type-check and build on every push with a protected main branch.',
      categoryId: base.projects,
      tags: ['devops'],
      priority: 'high',
      status: 'completed',
      dueDate: at(-1, 18),
      completedAt: at(-1, 13),
      estimatedMinutes: 180,
    }),
    createTask({
      title: 'Morning routine and gym session',
      description: 'Six thirty start, forty minute session, log the progress.',
      categoryId: base.personal,
      tags: ['health'],
      priority: 'low',
      status: 'todo',
      dueDate: at(0, 7),
      recurrence: 'weekdays',
      estimatedMinutes: 45,
      inMyDay: true,
    }),
    createTask({
      title: 'Plan next month study schedule',
      description: 'Block deep-work slots around lectures and the part-time role.',
      categoryId: base.academics,
      tags: ['planning'],
      priority: 'medium',
      status: 'todo',
      dueDate: at(9, 19),
      estimatedMinutes: 60,
    }),
  ];

  return tasks;
}
