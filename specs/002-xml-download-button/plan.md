# Implementation Plan: XML Download Button for Notas Fiscais

**Branch**: `002-xml-download-button` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-xml-download-button/spec.md`

## Summary

Add a conditional XML download button to the Notas Fiscais table (`NfeTable`). The button appears only in rows where `status_processo === 3` (a separate numeric field in the row data), placed in a new "Ações" column as the rightmost column. On click, the component calls the existing `getInvoiceXml` server action, resolves the XML content (`xmlContent` preferred, fallback to base64-decode `invoiceXml`), and triggers a browser file download named `nfe-{orderId}.xml`. Per-row loading state prevents duplicate requests. Errors surface as `sonner` toasts; successful downloads rely on browser native feedback only. No new server actions, API endpoints, or database access are required.

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 15 (App Router) / React 18  
**Primary Dependencies**: shadcn/ui (`Button`, `Table`), TanStack Query (`@tanstack/react-query`), `sonner` (toast), `lucide-react` (icons)  
**Storage**: N/A — read-only call to existing Winthor Fiscal API via `getInvoiceXml`  
**Testing**: Manual browser testing (no automated test framework in project)  
**Target Platform**: Web browser (client component inside Next.js App Router private route)  
**Project Type**: Web — single Next.js project  
**Performance Goals**: Loading indicator visible within 300ms of click; download file delivery under 5 seconds on normal networks  
**Constraints**: Button visibility gated on `row.status_processo === 3`; no additional role check; `any` type must be eliminated from `NfeTable` props (Constitution II)  
**Scale/Scope**: Enhancement to one existing component; touches 2 source files, adds 1 type definition

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

[Gates determined based on constitution file]

## Constitution Check

_GATE: Must pass before implementation. Re-check after Phase 1 design._

| Principle                          | Status             | Notes                                                                                                                                                                                                    |
| ---------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I — Server-First Business Logic    | ✅ PASS            | `getInvoiceXml` is already a `"use server"` action in `/actions/notaFiscalAction.tsx`. The client component calls it; no client-side API fetch or DB access introduced.                                  |
| II — Type Safety                   | ⚠️ REQUIRES ACTION | `NfeTable` currently uses `data: any`. Plan defines a `NfeRow` interface in `/types/OrderTypes.ts` to replace all `any` usage in this component. Implementation is blocked from using `any` in new code. |
| III — Multi-Tenant Data Isolation  | ✅ PASS            | Tenant isolation is handled inside `getInvoiceXml` (calls `getUser()` + `getConfiguracaoTotvs()`). No direct DB access in this feature.                                                                  |
| IV — shadcn/ui Component Hierarchy | ✅ PASS            | Download button uses `<Button>` from `@/components/ui/button`. No raw `<button>` HTML.                                                                                                                   |
| V — Session-Guarded Routes         | ✅ PASS            | Route is under `app/(private)/` — already protected by middleware. No new unguarded routes introduced.                                                                                                   |

**Gate result**: PASS with one required action (Principle II — typing must be applied during implementation).

## Project Structure

### Documentation (this feature)

```text
specs/002-xml-download-button/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── getInvoiceXml.md ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
app/(private)/notas_fiscais/
└── NfeTable.tsx          ← MODIFY: add "Ações" column + XmlDownloadButton logic

types/
└── OrderTypes.ts         ← MODIFY: add NfeRow interface (replaces `any` in NfeTable)

actions/
└── notaFiscalAction.tsx  ← NO CHANGE (getInvoiceXml already implemented)
```

**Structure Decision**: Single-file enhancement. No new files in `app/` or `actions/` — the feature is a targeted modification of one existing component and one existing types file.

## Complexity Tracking

> No constitution violations requiring justification — all gates pass.

No entries needed.
