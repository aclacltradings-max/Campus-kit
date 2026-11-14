# CampusKit Private

A premium, private task workspace for everyone — built to organise daily activities,
assignments, projects and deadlines in a luxury black-and-gold interface.

CampusKit Private is a complete, working single-page application. It is not a static
prototype: every screen is wired to a real state layer, data persists in `localStorage`,
and premium capabilities are gated by a subscription-aware entitlement system.

---

## Highlights

- **Luxury design system** — deep blacks, considered gold accents, a display serif for
  headings and a full light theme. Dark, light and system modes.
- **Dashboard** — total, completed, pending and overdue counts, a productivity trend,
  a completion ring, today's focus and an overdue watch list.
- **Task manager** — create, edit, delete, complete, prioritise, star, archive and
  duplicate tasks. Titles, descriptions, categories, tags, deadlines, reminders,
  estimated time, subtasks and recurrence.
- **Organisation** — My Day, Upcoming, All Tasks, Completed, Overdue, Calendar and
  Categories, each with its own view and empty states.
- **Calendar** — day, week and month views (week and month are Premium).
- **Smart search** — instant search across titles, descriptions and tags, with filters
  for status, priority, category and deadline, plus sorting.
- **Analytics** — productivity trend, status split, category performance, priority mix
  and weekday patterns (Premium).
- **Extras** — recurring tasks, reminders (in-app and browser), bulk actions and data
  export in JSON, CSV and Markdown.
- **Settings** — profile, appearance, date and time formats, notification lead time,
  task behaviour and full data management (import, export, reset).
- **Monetisation** — Free, Premium and Elite plans, a pricing page, an upgrade flow and
  a billing dashboard, built on a provider-agnostic payment adapter.

---

## Technology

| Layer | Choice |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 with custom design tokens |
| Routing | React Router 6 |
| Icons | lucide-react |
| Charts | Recharts |
| Persistence | `localStorage` (versioned schema) |

No backend is required. The application runs entirely in the browser.

---

## Project structure

```
src/
├── components/
│   ├── charts/        Recharts wrappers (trend, donut, radar, weekday, category)
│   ├── common/        StatCard, SectionCard, PlanCard, PremiumLock, ErrorBoundary
│   ├── layout/        AppShell, Sidebar, Topbar, MobileNav, PageHeader, nav config
│   ├── tasks/         TaskCard, TaskCollection, TaskFormModal, TaskDetailDrawer,
│   │                  TagInput, TaskMeta, BulkActionBar
│   └── ui/            Button, Field, Modal, Drawer, Toaster, Toggle, Segmented,
│                      ProgressBar, Badge, EmptyState, Logo
├── context/
│   ├── store.ts             Reducer, persistence and selectors
│   ├── WorkspaceContext     Tasks, categories, settings, subscription, entitlements
│   ├── ThemeContext         Dark / light / system theme
│   ├── ToastContext         Notification queue
│   └── TaskDialogContext    Global create / edit / detail dialog orchestration
├── hooks/             useMediaQuery, useTaskSelection
├── lib/
│   ├── tasks.ts       Filtering, sorting, statistics and chart data builders
│   ├── plans.ts       Plan catalogue and entitlement resolution
│   ├── payments.ts    Payment adapter seam (Stripe / Paystack)
│   ├── storage.ts     Versioned localStorage helpers
│   ├── seed.ts        First-run sample workspace
│   ├── export.ts      JSON / CSV / Markdown export
│   ├── validation.ts  Input validation and import parsing
│   └── date.ts, priority.ts, cn.ts, id.ts
├── pages/             Landing, Dashboard, My Day, Upcoming, All Tasks, Completed,
│                      Overdue, Calendar, Analytics, Search, Categories, Settings,
│                      Billing, Upgrade, Pricing
├── types/             Shared domain types
├── App.tsx            Providers and route table
└── main.tsx           Entry point
```

---

## Getting started

Requires Node 18 or newer.

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check and produce a production build in dist/
npm run preview    # serve the production build locally
npm run typecheck  # run the TypeScript compiler without emitting
```

---

## Payments

Billing is intentionally provider-agnostic. `src/lib/payments.ts` exposes a single
`beginCheckout` seam and a `getPaymentConfig` reader. Until a public key is configured,
the upgrade flow activates entitlements locally and tells the user that no provider is
connected. No card data is ever collected or stored by the application.

To connect a provider, copy `.env.example` to `.env` and add one key:

```bash
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxx   # or
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
VITE_BILLING_CURRENCY=USD              # or NGN
```

Restart the dev server afterwards. Real charges are not implemented — the adapter hands
off to the provider once a key is present.

---

## Data and privacy

All data lives in the browser's `localStorage` under versioned keys
(`campuskit.v1.*`). Nothing is uploaded. The Settings page reports storage usage and
provides JSON import and export so a workspace can be moved between devices.

---

## Plans

| | Free | Premium | Elite |
| --- | --- | --- | --- |
| Active tasks | 40 | Unlimited | Unlimited |
| Categories | 3 | 20 | Unlimited |
| Recurring tasks | — | Yes | Yes |
| Reminders | — | Yes | Yes |
| Subtasks & bulk actions | — | Yes | Yes |
| Advanced analytics | — | Yes | Yes |
| Light theme | — | Yes | Yes |
| Priority support | — | — | Yes |
