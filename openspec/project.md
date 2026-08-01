# Project — winthor-frontend (WTA Connect)

> SDD bootstrap context. Persisted in hybrid store: Engram (`sdd-init/winthor-frontend`,
> memory #130) + this file. Authoritative constitution: `.specify/memory/constitution.md` (v1.0.0,
> ratified 2026-02-19). Repository guide: `AGENTS.md`.

Initialized: 2026-07-31 · Persistence: both (engram + openspec) · Mode: auto ·
PR strategy: auto-forecast · Review budget: 600 lines

## Tech Stack
- **Framework**: Next.js 15 (App Router, RSC enabled) `^15.5.9` — no Pages Router.
- **Language**: TypeScript 5 (`strict: true`, `moduleResolution: bundler`). Alias `@/*` → `./*`.
- **Runtime**: React 18.
- **Styling**: Tailwind CSS 3 (`^3.4.17`, `tailwind.config.ts`) + shadcn/ui
  (`components.json`: rsc/tsx true, neutral baseColor, cssVariables true, lucide).
- **Component library**: shadcn/ui ONLY (`components/ui/`). Antd present but mandated for
  progressive removal — never coexist with shadcn in the same domain. No custom
  `<button>/<input>/<select>`.
- **Forms**: react-hook-form + `@hookform/resolvers` + Zod. No ad-hoc onChange forms.
- **Data fetching**: TanStack Query (client async state) + Server Actions (mutations).
- **Tables**: TanStack Table `^8.20.6`.
- **State**: Zustand (client global, only when context insufficient).
- **Charts**: Recharts `2.15.0`.
- **Database**: MongoDB 6 raw driver. TWO clients — do not confuse:
  - `TMongo` at `infra/mongoClient.ts` → business data.
  - `TAuthMongo` at `auth/infra/mongoClient.ts` → auth data (users).
  - Close every connection with `mongoDisconnect(client)`. Direct `MongoClient` outside the
    `TMongo` wrapper is prohibited.
- **Auth**: Custom JWT (jose HS256, httpOnly cookie `session`) + bcryptjs. `auth/util.ts`
  `AuthService`; `middleware.ts` guards routes; public: `/`, `/sign-in`, `/sign-up`. Session
  expiry ≤ 1 day.
- **Other**: date-fns (only date lib; no moment), xlsx (Excel uploads), react-to-print,
  sonner toasts (sole feedback; no alert/prompt), uuid, vaul, embla-carousel, cmdk,
  input-otp, next-themes.

## Architecture Patterns
- App Router: `app/(auth)/` public · `app/(private)/` authenticated shell (sidebar) · `app/api/`.
- Root `page.tsx` + `app/page.tsx` = public marketing passthrough (outside the authed app).
- `actions/` = Server Actions, one file per domain (`pedidoAction.tsx`, `orderAction.tsx`,
  `empresaAction.tsx`, …). Never co-locate in pages.
- **Every server action MUST** start with `getUser()` from `@/hooks/useUser`
  (`hooks/useUser.tsx` is `"use server"` — server-only despite the hooks/ path) to obtain
  `id_tenant`, and MUST return `{ success: boolean; message: string; data?: T }`. Zod-validate
  all input. Zero `any` in actions/mappers/utils.
- **Multi-tenant isolation**: every Mongo query MUST filter by `idtenant` (from `user.empresa`).
  Missing tenant filter = CRITICAL security bug. Cross-tenant needs a justification comment.
- Pages (Server Components) call actions directly OR wrap in React Query `queryFn`; never both.
- Dirs: `actions/` `app/` `auth/` `components/` `components/ui/` `hooks/` `infra/` `lib/`
  `providers/` `services/` (empty, reserved) `types/` `.specify/`.

## Constitution (authoritative — supersedes informal conventions)
Five non-negotiable principles:
I. Server-First Business Logic (`"use server"` under `/actions/`; clients only invoke).
II. Type Safety (no `any`; Zod everywhere; `as` only in external-shape mappers).
III. Multi-Tenant Data Isolation (`idtenant` filter mandatory).
IV. shadcn/ui Component Hierarchy (single component system; antd phased out).
V. Session-Guarded Routes (`isSessionValid()`; ≤1-day sessions; no sensitive data in client state).
Every PR MUST include a "Constitution Check" section (Principles I–V).

## CI / Conventions
- No CI workflows in `.github/` (only `agents/`, `prompts/` — speckit).
- No Prettier. ESLint via `next lint`. TS strict ON; type gate is `next build`
  (no separate `typecheck` script).
- Server Action body limit 25MB (`next.config.js`) — for Excel uploads.
- React Query: `refetchOnWindowFocus: false`, `staleTime: 10 min`.
- Toasts via `sonner` (`<Toaster />` root layout).
- Commands: `npm run dev` | `npm run build` | `npm run lint` | `npm run start`.

## Env vars (required)
`NEXT_AUTH_SECRET`, `MONGO_CONNECTION`, `MONGO_DATABASE`,
`NEXT_PUBLIC_KOMACHE_AFTER_SIGN_IN_URL` (default `/home`),
`NEXT_AUTH_ADMIN_EMAIL`, `NEXT_AUTH_ADMIN_PASSWORD`.

## WinThor API integration
`actions/winthorAuthAction.tsx` authenticates against the WinThor API; caches tokens
in-memory per tenant (6h TTL); credentials from the `tenant` MongoDB collection via
`getConfiguracaoTotvs()`.

## Existing Specs (`/specs`)
- `001-sticky-pagination`
- `002-xml-download-button`
- `tiny-erp-produto-consulta`

## Testing
- NO test runner detected (no vitest/jest/mocha/playwright/@testing-library in deps; no
  test files; no test config).
- **strict_tdd: false**
- test_command: null