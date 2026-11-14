import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useLocation, useNavigate } from 'react-router-dom';
import { isNative, attempt } from '@/lib/platform';
import { closeTopOverlay } from '@/lib/overlayStack';

/**
 * Screens that sit above the tab bar. Pressing back from one of these returns to
 * the dashboard rather than leaving the app, which is what a user expects from a
 * detail or account screen.
 */
const ROOT_PATHS = new Set(['/app', '/']);

/**
 * Paints the status bar to match the app background and keeps the icon colour in
 * step with the theme. Every call is best-effort: the setter APIs are no-ops on
 * Android 15+, which enforces edge-to-edge drawing.
 */
function applyStatusBar(): void {
  const isDark = document.documentElement.classList.contains('dark');
  void attempt(() => StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }));
  void attempt(() => StatusBar.setBackgroundColor({ color: isDark ? '#08080A' : '#F8F6F1' }));
  void attempt(() => StatusBar.setOverlaysWebView({ overlay: false }));
}

/**
 * Wires up the Android lifecycle behaviours the WebView does not provide on its
 * own: the hardware back button and the status bar.
 */
export function useNativeLifecycle(): void {
  const navigate = useNavigate();
  const location = useLocation();

  // Back button. Android fires this instead of navigating browser history, so
  // the ordering here defines the whole back behaviour of the app.
  useEffect(() => {
    if (!isNative) return;
    let handle: { remove: () => void } | undefined;

    void CapacitorApp.addListener('backButton', () => {
      // 1. An open modal or drawer always wins.
      if (closeTopOverlay()) return;

      // 2. Otherwise step back through the router, mirroring browser history.
      const isAppRoute = location.pathname.startsWith('/app');
      if (isAppRoute && !ROOT_PATHS.has(location.pathname)) {
        navigate(-1);
        return;
      }

      // 3. On a root screen there is nowhere left to go, so let the user leave.
      void CapacitorApp.exitApp();
    }).then((h) => {
      handle = h;
    });

    return () => {
      handle?.remove();
    };
  }, [navigate, location.pathname]);

  // Status bar on first paint and on every navigation.
  useEffect(() => {
    if (!isNative) return;
    applyStatusBar();
  }, [location.pathname]);

  // The theme can change without navigating, so watch the root class instead of
  // relying on the route effect to fire.
  useEffect(() => {
    if (!isNative) return;
    const observer = new MutationObserver(applyStatusBar);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);
}
