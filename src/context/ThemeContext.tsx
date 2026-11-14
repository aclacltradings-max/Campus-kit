import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import type { Density, ThemeMode } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ThemeValue {
  theme: ThemeMode;
  resolved: 'dark' | 'light';
  density: Density;
  setTheme: (mode: ThemeMode) => void;
  setDensity: (density: Density) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings, entitlements } = useWorkspace();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const resolved: 'dark' | 'light' = useMemo(() => {
    if (settings.theme === 'system') return prefersDark ? 'dark' : 'light';
    return settings.theme;
  }, [settings.theme, prefersDark]);

  // Light theme is a paid capability — fall back to dark when not entitled.
  const effective: 'dark' | 'light' = resolved === 'light' && !entitlements.lightTheme ? 'dark' : resolved;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', effective === 'dark');
    root.classList.toggle('light', effective === 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effective === 'dark' ? '#08080A' : '#F8F6F1');
  }, [effective]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = settings.density;
    root.classList.toggle('ck-compact', settings.density === 'compact');
    root.classList.toggle('ck-reduce-motion', settings.reduceMotion);
  }, [settings.density, settings.reduceMotion]);

  const value = useMemo<ThemeValue>(
    () => ({
      theme: settings.theme,
      resolved: effective,
      density: settings.density,
      setTheme: (mode) => {
        if (mode === 'light' && !entitlements.lightTheme) return;
        updateSettings({ theme: mode });
      },
      setDensity: (density) => updateSettings({ density }),
      toggleTheme: () => {
        const next: ThemeMode = effective === 'dark' ? 'light' : 'dark';
        if (next === 'light' && !entitlements.lightTheme) return;
        updateSettings({ theme: next });
      },
    }),
    [settings.theme, settings.density, effective, entitlements.lightTheme, updateSettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider.');
  return ctx;
}
