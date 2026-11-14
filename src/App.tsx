import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';
import { WorkspaceProvider, useWorkspace } from '@/context/WorkspaceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TaskDialogProvider } from '@/context/TaskDialogContext';
import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyDayPage } from '@/pages/MyDayPage';
import { UpcomingPage } from '@/pages/UpcomingPage';
import { AllTasksPage } from '@/pages/AllTasksPage';
import { CompletedPage } from '@/pages/CompletedPage';
import { OverduePage } from '@/pages/OverduePage';
import { CalendarPage } from '@/pages/CalendarPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SearchPage } from '@/pages/SearchPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BillingPage } from '@/pages/BillingPage';
import { UpgradePage } from '@/pages/UpgradePage';
import { PricingPage } from '@/pages/PricingPage';
import { LandingPage } from '@/pages/LandingPage';
import type { DefaultView } from '@/types';

const DEFAULT_VIEW_PATHS: Record<DefaultView, string> = {
  dashboard: '/app',
  'my-day': '/app/my-day',
  upcoming: '/app/upcoming',
  tasks: '/app/tasks',
  calendar: '/app/calendar',
  analytics: '/app/analytics',
};

function DefaultViewRedirect() {
  const { settings, state } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.hydrated) return;
    const target = DEFAULT_VIEW_PATHS[settings.defaultView];
    if (target && target !== '/app') navigate(target, { replace: true });
  }, [state.hydrated, settings.defaultView, navigate]);

  return <DashboardPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/app" element={<AppShell />}>
        <Route index element={<DefaultViewRedirect />} />
        <Route path="my-day" element={<MyDayPage />} />
        <Route path="upcoming" element={<UpcomingPage />} />
        <Route path="tasks" element={<AllTasksPage />} />
        <Route path="completed" element={<CompletedPage />} />
        <Route path="overdue" element={<OverduePage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="upgrade" element={<UpgradePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <WorkspaceProvider>
          <ThemeProvider>
            <TaskDialogProvider>
              <AppRoutes />
              <Toaster />
            </TaskDialogProvider>
          </ThemeProvider>
        </WorkspaceProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
