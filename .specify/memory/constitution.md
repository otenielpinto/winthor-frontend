<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Added sections: Core Principles, Technology Stack Constraints, Development Workflow, Governance
Removed sections: N/A (initial constitution)
Modified principles: N/A (initial constitution)
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (already has Constitution Check section)
  - .specify/templates/spec-template.md ✅ no changes needed (generic placeholders, no outdated refs)
  - .specify/templates/tasks-template.md ✅ no changes needed (generic structure, no outdated refs)
Follow-up TODOs:
  - None. All fields resolved from project context.
-->

# WTA Connect Constitution

## Core Principles

### I. Server-First Business Logic

All data access and business operations MUST be implemented as Next.js Server
Actions marked with `"use server"` and located under `/actions/`. Client
components MUST only invoke these server actions; they MUST NOT access MongoDB,
call external APIs, or contain database logic directly. Every server action MUST
retrieve the authenticated user via `getUser()` before performing any operation.

**Rationale**: Centralising business logic in Server Actions ensures security
boundaries are enforced by the framework, simplifies testing, and prevents
accidental data leaks through client bundles.

### II. Type Safety (NON-NEGOTIABLE)

Every data contract MUST be expressed as a TypeScript `interface` or `type`
and placed in `/types/`. Use of the `any` type is prohibited in all server
actions, mappers, and shared utilities. All user-submitted input MUST be
validated with a Zod schema before processing. Type assertions (`as SomeType`)
are only permitted in data-mapping functions where the source shape is
externally owned (e.g., raw MongoDB documents).

**Rationale**: The domain handles real financial and fiscal data (pedidos,
NF-e). Untyped code creates silent data corruption risks that are unacceptable
in an ERP context.

### III. Multi-Tenant Data Isolation (NON-NEGOTIABLE)

Every MongoDB query MUST include an `idtenant` filter derived from the
authenticated session (`user.empresa`). No collection access is permitted
without a verified tenant identifier. Queries that intentionally span tenants
MUST include a comment explaining the business justification.

**Rationale**: The platform is multi-company. A missing tenant filter would
expose company data across clients, representing a critical security failure.

### IV. shadcn/ui Component Hierarchy

The UI MUST be built from shadcn/ui primitives located in `/components/ui/`.
Custom low-level HTML elements (`<button>`, `<input>`, `<select>`, etc.) are
only permitted when no shadcn/ui equivalent exists. Antd (`antd`) components
MUST NOT be used in the same domain area as shadcn/ui components; their use
should be progressively replaced. No other UI component library may be
introduced without a documented amendment to this constitution.

**Rationale**: A single component system guarantees design consistency,
reduces bundle size, and simplifies maintenance across the application.

### V. Session-Guarded Routes

All routes under `app/(private)/` MUST validate the JWT session using
`isSessionValid()` from `auth/util.ts` before rendering or responding.
Session tokens MUST expire in no more than 1 day. Sensitive user data MUST
reside only in the server-side session payload and MUST NOT be persisted to
client-side state (localStorage, cookies readable by JS, Zustand) beyond
what is strictly required for UI display.

**Rationale**: The application manages business-critical ERP data. Session
expiry and server-side guard are the last line of defence against unauthorised
access.

## Technology Stack Constraints

The technology stack is fixed for the current major version. Any addition
requires a constitution amendment.

- **Framework**: Next.js 15 (App Router) with React 18 — no Pages Router
  patterns.
- **Database**: MongoDB, accessed exclusively via the `TMongo` wrapper in
  `/infra/mongoClient.ts`. Direct use of `MongoClient` outside the wrapper
  is prohibited. Connections MUST be explicitly closed with
  `TMongo.mongoDisconnect(client)` after every operation.
- **Forms**: `react-hook-form` with `@hookform/resolvers` and Zod schemas MUST
  be used for all user-facing forms. Uncontrolled or ad-hoc `onChange` state
  forms are not permitted.
- **Server state / Data fetching**: TanStack Query (`@tanstack/react-query`)
  for all async server state in client components.
- **Client global state**: Zustand for cross-component client state only when
  React context is insufficient.
- **Tables**: TanStack Table (`@tanstack/react-table`) for all tabular data
  views.
- **Date utilities**: `date-fns` exclusively. `moment.js` and raw `Date`
  arithmetic in business logic are prohibited.
- **Notifications**: `sonner` toasts MUST be the sole mechanism for user
  feedback on async operations. `alert()`, `prompt()`, and `console.error`
  as primary user feedback are prohibited.
- **Auth**: JWT signed with `jose` (`HS256`). No third-party auth providers
  may be added without an amendment.

## Development Workflow

- **Server Action files**: one file per domain module in `/actions/` (e.g.,
  `pedidoAction.tsx`, `orderAction.tsx`, `empresaAction.tsx`). Actions MUST
  NOT be co-located inside page files.
- **Types**: shared TypeScript types/interfaces live in `/types/`; they MUST
  be imported by both actions and components — never duplicated inline.
- **Page data flow**: pages (Server Components) call server actions directly
  OR wrap them in React Query `queryFn` inside Client Components. Mixing both
  patterns in the same page is prohibited.
- **Error handling**: Server Actions MUST return structured results
  (`{ success: boolean; message: string; data?: T }`) rather than throwing
  uncaught errors to the client.
- **Code language**: All user-facing strings MUST be written in Brazilian
  Portuguese (`pt-BR`). Code identifiers (variable names, function names, file
  names) MUST be in English or documented Portuguese abbreviations consistent
  with the existing codebase.

## Governance

This constitution supersedes all informal practices, verbal agreements, and
prior code conventions. It is the authoritative reference for all development
decisions on the WTA Connect project.

**Amendment procedure**: Any team member may propose an amendment by opening
a pull request that modifies this file, describing (a) the principle being
changed, (b) the rationale, and (c) a migration plan for existing code. The
amendment takes effect upon PR approval.

**Versioning policy**: Follow semantic versioning —
MAJOR for principle removals or breaking redefinitions; MINOR for new
principles or sections; PATCH for clarifications and wording fixes.

**Compliance review**: Every pull request description MUST include a
"Constitution Check" section confirming compliance with Principles I–V.
Automated linting rules (ESLint, TypeScript strict mode) serve as the
automated enforcement layer.

**Version**: 1.0.0 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
