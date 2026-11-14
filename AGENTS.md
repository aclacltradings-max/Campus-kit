# AGENTS.md — CampusKit Private

## Project

CampusKit Private is a premium, private task-management SPA. It has no backend: all
state lives in the browser under versioned `localStorage` keys (`campuskit.v1.*`).

## Commands

```bash
npm install
npm run dev        # Vite dev server
npm run build      # tsc -b && vite build  (must pass before pushing)
npm run typecheck  # tsc -b --noEmit
npm run preview    # serve dist/
```

There is no test suite. The production build is the primary correctness gate.

## Architecture

- `src/types` — single source of truth for the domain model.
- `src/lib` — pure logic. `tasks.ts` owns filtering, sorting, stats and chart data.
  `plans.ts` owns the plan catalogue and entitlement resolution. `payments.ts` is the
  payment adapter seam; it never charges and never stores card data.
- `src/context/store.ts` — reducer plus persistence. Every mutation goes through a
  typed action; never write to `localStorage` from components.
- `src/context/WorkspaceContext.tsx` — the only place components read tasks,
  categories, settings, subscription and entitlements from.
- `src/context/TaskDialogContext.tsx` — global orchestration for the create, edit and
  detail dialogs so any page can open them without prop drilling.

## Conventions

- Path alias `@/` maps to `src/`. Use it for every non-relative import.
- Tailwind tokens are defined in `tailwind.config.js` and `src/index.css`. Prefer the
  `ck-*` utility classes (`ck-card`, `ck-glass`, `ck-inset`, `ck-btn-gold`, `ck-muted`,
  `ck-faint`, `ck-eyebrow`) over ad-hoc utility strings.
- Colours are consumed as `rgb(var(--ck-*))` so light and dark themes share one palette
  definition. Add new colours as CSS variables, not hard-coded hex values.
- Premium capabilities are gated by `entitlements` from `useWorkspace()`. Never gate on
  a plan id directly; add a capability to `Entitlements` and check that.
- All interactive elements must be functional. Do not add decorative buttons.

## Gotchas

- `@apply` cannot be used with the `group` utility in Tailwind 3 — apply `group`
  directly in JSX instead.
- `tsconfig.node.json` needs `"types": ["node"]` for `vite.config.ts` to type-check.
- Calendar week and month views are Premium; the effective view is derived from
  entitlements so a free user lands on the day view instead of a locked screen.
