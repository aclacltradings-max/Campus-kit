import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { useNativeLifecycle } from '@/hooks/useNativeLifecycle';
import { pushOverlay } from '@/lib/overlayStack';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useNativeLifecycle();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  // Let Android's back button close the slide-out menu like any other overlay.
  useEffect(() => {
    if (!menuOpen) return;
    return pushOverlay(() => setMenuOpen(false));
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <div className="relative flex min-h-dvh bg-[rgb(var(--ck-bg))]">
      <div className="pointer-events-none fixed inset-0 ck-grid-bg opacity-[0.35]" />
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gold-500/[0.07] blur-[120px]" />

      <aside className="relative z-30 hidden w-[17.5rem] shrink-0 border-r border-[rgb(var(--ck-border)/0.07)] bg-[rgb(var(--ck-bg-elevated))]/60 backdrop-blur-xl lg:block">
        <div className="sticky top-0 h-dvh">
          <Sidebar />
        </div>
      </aside>

      {menuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-[17.5rem] max-w-[86vw] border-r border-[rgb(var(--ck-border)/0.1)] bg-[rgb(var(--ck-bg-elevated))] animate-slide-in-right">
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>,
          document.body,
        )}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pb-10 sm:pt-6">
          <div className="mx-auto w-full max-w-[82rem]">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
