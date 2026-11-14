import { NavLink } from 'react-router-dom';
import { MOBILE_NAV } from '@/components/layout/nav';
import { cn } from '@/lib/cn';

export function MobileNav() {
  return (
    <nav className="ck-safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[rgb(var(--ck-border)/0.08)] ck-glass lg:hidden">
      <ul className="grid grid-cols-5">
        {MOBILE_NAV.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[0.62rem] font-medium transition-colors',
                  isActive ? 'text-gold-300' : 'text-[rgb(var(--ck-text-faint))]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                      isActive && 'bg-gold-500/14 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.25)]',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
