import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
  Sun,
  Tags,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: 'myDay' | 'overdue' | 'upcoming';
  end?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/app/my-day', label: 'My Day', icon: Sun, badgeKey: 'myDay' },
      { to: '/app/upcoming', label: 'Upcoming', icon: CalendarRange, badgeKey: 'upcoming' },
    ],
  },
  {
    title: 'Tasks',
    items: [
      { to: '/app/tasks', label: 'All Tasks', icon: FolderKanban },
      { to: '/app/completed', label: 'Completed', icon: CheckCircle2 },
      { to: '/app/overdue', label: 'Overdue', icon: TriangleAlert, badgeKey: 'overdue' },
      { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'Insight',
    items: [
      { to: '/app/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/app/search', label: 'Smart Search', icon: Search },
      { to: '/app/categories', label: 'Categories', icon: Tags },
    ],
  },
  {
    title: 'Account',
    items: [
      { to: '/app/billing', label: 'Billing & Plan', icon: CreditCard },
      { to: '/app/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const MOBILE_NAV: NavItem[] = [
  { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/app/my-day', label: 'My Day', icon: Sun },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/analytics', label: 'Insights', icon: BarChart3 },
  { to: '/app/tasks', label: 'Tasks', icon: FolderKanban },
];
