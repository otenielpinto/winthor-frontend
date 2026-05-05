# AGENTS.md — winthor-frontend (WTA Connect)

## Architecture (read first)

The authoritative source of truth is `.specify/memory/constitution.md` — a constitution with 5 non-negotiable principles. **Read it before writing any code.** Key rules:

- All business logic lives in `"use server"` actions under `/actions/` — clients only invoke actions, never access MongoDB directly.
- Every action MUST call `getUser()` from `@/hooks/useUser` first to get `id_tenant`.
- All MongoDB queries MUST filter by `idtenant` (multi-tenant isolation). Missing this is a critical security bug.
- Every server action returns `{ success: boolean; message: string; data?: T }`.
- Zod validation on all user input. Zero tolerance for `any` in actions.
- shadcn/ui only — no custom `<button>/<input>` elements; anti components are being phased out.
- Forms: `react-hook-form` + `@hookform/resolvers` + Zod. No ad-hoc form state.
- UI strings in pt-BR; variable/file names in English or established Portuguese abbreviations.

## Commands

```
npm run dev      # start dev server
npm run build    # production build
npm run lint     # next lint (built-in ESLint — no .eslintrc file)
npm run start    # start production server
```

No test runner is configured. There is no `typecheck` script; TypeScript is checked at build time via `next build`.

## Two MongoDB clients — do NOT confuse them

| Client | Location | Purpose |
|--------|----------|---------|
| `TMongo` | `infra/mongoClient.ts` | Business data (orders, products, tenants, etc.) |
| `TAuthMongo` | `auth/infra/mongoClient.ts` | Auth data (users collection) |

Always close connections with `mongoDisconnect(client)` after use. The `connectToDatabase()` helper returns `{ client, clientdb }`.

## Auth flow

- JWT signed with `jose` (HS256), stored in an httpOnly cookie named `"session"`.
- `auth/util.ts` exports `AuthService` with `createSessionToken`, `isSessionValid`, `getSessionUser`, `destroySession`.
- Session payload includes: `id`, `sub`, `name`, `email`, `active`, `isAdmin`, `codigo`, `emp_acesso`, `empresa`, `id_tenant`.
- Middleware (`middleware.ts`) redirects unauthenticated users to `/sign-in`. Public routes: `/sign-in`, `/sign-up`, `/`.
- `getUser()` in `hooks/useUser.tsx` is a `"use server"` function (server-only, despite being in `hooks/`).

## WinThor API integration

`actions/winthorAuthAction.tsx` manages authentication against the WinThor API. It caches tokens in-memory per tenant with a 6-hour TTL. Credentials come from the `tenant` MongoDB collection via `getConfiguracaoTotvs()`.

## Env vars (required)

| Variable | Purpose |
|----------|---------|
| `NEXT_AUTH_SECRET` | JWT signing secret |
| `MONGO_CONNECTION` | Business MongoDB URI |
| `MONGO_DATABASE` | Business MongoDB database name |
| `NEXT_PUBLIC_KOMACHE_AFTER_SIGN_IN_URL` | Post-login redirect (defaults to `/home`) |
| `NEXT_AUTH_ADMIN_EMAIL` | Auto-created admin user email |
| `NEXT_AUTH_ADMIN_PASSWORD` | Auto-created admin user password |

## Entrypoints

- **`page.tsx` (root)**: Public marketing landing page. Not part of the authenticated app.
- **`app/page.tsx`**: Synthetic passthrough — imports and renders the root `page.tsx`.
- **`app/(private)/layout.tsx`**: Authenticated app shell with sidebar. All actual app pages live here.
- **`app/(auth)/sign-in`**, **`sign-up`**, **`logout`**: Auth pages.

## Directory map

| Directory | Purpose |
|-----------|---------|
| `actions/` | Server Actions — one file per domain (pedido, order, empresa, etc.) |
| `app/(private)/` | Authenticated app routes |
| `app/(auth)/` | Sign-in, sign-up, logout |
| `auth/` | Auth module: actions, infra (TAuthMongo), types, schema, util |
| `components/ui/` | shadcn/ui primitives (50+ components) |
| `components/` | App-level components (sidebar, nav, marketing sections) |
| `hooks/` | Shared hooks — note: `useUser.tsx` is server-only |
| `infra/` | Infrastructure: `TMongo` client |
| `lib/` | Utilities: `cn()`, `lib.ts` (date/region helpers), `xmlUtils.ts` |
| `providers/` | Client providers: React Query |
| `types/` | Shared TypeScript types |
| `services/` | Empty — reserved for future use |
| `.specify/` | SDD constitution and templates |

## Important quirks

- Server Action body size limit is 25MB (`next.config.js`) — needed for Excel file uploads in `estoqueConciliacaoAction.ts`.
- `hooks/useUser.tsx` is `"use server"` — it's NOT a client hook. It reads the session cookie server-side.
- React Query is configured with `refetchOnWindowFocus: false` and `staleTime: 10 minutes`.
- Toasts use `sonner` (`<Toaster />` in root layout), not shadcn toast.
- The `.agents/skills/` directory contains project-specific OpenCode skills. Load them when relevant.
- `services/` exists but is empty — don't assume service-layer patterns exist yet.
- No `.env.example` — infer required vars from code or ask the team.
