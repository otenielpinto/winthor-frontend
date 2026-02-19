# Tasks: XML Download Button for Notas Fiscais

**Input**: Design documents from `/specs/002-xml-download-button/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅  
**Tests**: Not requested — no test tasks generated.  
**Total tasks**: 11 | **Source files changed**: 2 | **New dependencies**: None

---

## Phase 1: Setup

**Purpose**: Confirm environment and pre-conditions before touching source files.

- [x] T001 Confirm active branch is `002-xml-download-button` and no new npm packages are required (all dependencies — `sonner`, `lucide-react`, `@/components/ui/button` — are already installed in the project)

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Add the `NfeRow` TypeScript interface that all subsequent UI tasks depend on. Must be complete before any `NfeTable.tsx` changes.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Add `NfeRow` interface to `types/OrderTypes.ts` — fields: `id`, `slug?`, `numero`, `nome_ecommerce`, `numero_ecommerce`, `orderId`, `date`, `nome`, `status`, `status_processo: number`, `value`, `region` (see data-model.md for full definition)

**Checkpoint**: `NfeRow` is importable across the codebase — US1 implementation can begin.

---

## Phase 3: User Story 1 — Download XML for Completed Invoice (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can click a download button on any fase-3 row in the Notas Fiscais table and receive a valid `.xml` file in their browser.

**Independent Test**: Navigate to `/notas_fiscais`, find a row with `status_processo = 3`, click the "XML" button, and verify a `nfe-{orderId}.xml` file is saved with valid XML content. The full download flow works end-to-end.

### Implementation

- [x] T003 [US1] Add imports to `app/(private)/notas_fiscais/NfeTable.tsx`: `useState` from `"react"`, `toast` from `"sonner"`, `{ Download, Loader2 }` from `"lucide-react"`, `{ Button }` from `"@/components/ui/button"`, `{ getInvoiceXml }` from `"@/actions/notaFiscalAction"`, `{ NfeRow }` from `"@/types/OrderTypes"`

- [x] T004 [US1] Replace `{ data }: any` component prop with `{ data }: { data: NfeRow[] }` in `app/(private)/notas_fiscais/NfeTable.tsx` (Constitution II — eliminate `any`)

- [x] T005 [US1] Implement `handleDownload` async function inside `NfeTable` in `app/(private)/notas_fiscais/NfeTable.tsx`: call `getInvoiceXml(orderId)`, resolve XML via `result.data?.xmlContent || atob(result.data?.invoiceXml)`, then trigger Blob download as `nfe-{orderId}.xml` using `URL.createObjectURL` + programmatic anchor click + `URL.revokeObjectURL` (see research.md §1 and quickstart.md §2c for full pattern)

- [x] T006 [US1] Add `<TableHead>Ações</TableHead>` as the last `<TableHead>` in the `<TableHeader>` row in `app/(private)/notas_fiscais/NfeTable.tsx`

- [x] T007 [US1] Add `<TableCell>` as the last cell in the row map in `app/(private)/notas_fiscais/NfeTable.tsx`, rendering a `<Button variant="outline" size="sm">` with `<Download className="h-3 w-3 mr-1" /> XML` label, conditionally: only when `order.status_processo === 3 && order.orderId`; call `handleDownload(order.orderId)` on click

**Checkpoint**: User Story 1 is fully functional. A fase-3 row shows the XML button; clicking it downloads the file. All other rows show an empty Ações cell.

---

## Phase 4: User Story 2 — Button Hidden for Non-Eligible Rows (Priority: P2)

**Goal**: The "Ações" column renders nothing (not even a disabled button) for rows where `status_processo !== 3`.

**Independent Test**: Filter the table to show rows with mixed fase values; confirm zero download buttons appear on non-fase-3 rows and no visual artifact is left in those cells.

### Implementation

- [x] T008 [US2] Verify the `order.status_processo === 3 && order.orderId` condition in the `<TableCell>` added in T007 correctly returns `null` for all non-eligible rows in `app/(private)/notas_fiscais/NfeTable.tsx` — no additional code change is expected; this task is a verification and documentation step. If `null` is not being rendered (e.g., component returns `undefined`), update the conditional to explicitly return `null`.

**Checkpoint**: User Stories 1 and 2 both pass independently. Eligible rows show the button; ineligible rows have an empty Ações cell.

---

## Phase 5: User Story 3 — Feedback During Download & Error Handling (Priority: P3)

**Goal**: The button shows a loading spinner and becomes non-interactive while a download is in progress; all failure paths surface as `sonner` toast errors; no silent failures.

**Independent Test**: Click a download button and observe the spinner + disabled state before the file arrives. Simulate a failure (disconnect backend) and confirm a toast error appears with a human-readable message, after which the button re-enables.

### Implementation

- [x] T009 [US3] Add `const [downloading, setDownloading] = useState<Record<string, boolean>>({})` inside `NfeTable` in `app/(private)/notas_fiscais/NfeTable.tsx`; update `handleDownload` to set `downloading[key] = true` at start and `false` in a `finally` block; update the `<Button>` in T007 to set `disabled={downloading[String(order.orderId)]}` and swap the icon for `<Loader2 className="h-3 w-3 animate-spin mr-1" />` while `downloading[String(order.orderId)]` is true (see quickstart.md §2c and §2e for complete pattern)

- [x] T010 [US3] Wire all `toast.error(...)` calls inside `handleDownload` in `app/(private)/notas_fiscais/NfeTable.tsx` for every failure branch: (1) `result.success === false` → `toast.error(result.message || "Erro ao baixar XML da nota fiscal.")`, (2) `xmlContent` resolves to null/empty → `toast.error("XML da nota fiscal não encontrado.")`, (3) unexpected `catch` → `toast.error("Erro inesperado ao baixar o XML.")` — confirm no success toast is added (FR-012)

**Checkpoint**: All three user stories are independently functional and the full feature is complete.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [x] T011 Run the manual testing checklist from `specs/002-xml-download-button/quickstart.md` in full: verify button visibility only on fase-3 rows, successful download of valid XML, loading state, error toast on failure, no success toast, and Constitution II compliance (no `any` in modified files)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Stories (Phase 3–5)**: All depend on Phase 2 (T002 must be complete); phases are sequential by priority
- **Polish (Final)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: Starts after T002. No dependency on US2 or US3.
- **US2 (P2)**: Starts after T002. Verifies behaviour introduced by US1 — shares the same `<TableCell>`, so logically follows US1 in this single-developer flow.
- **US3 (P3)**: Starts after T002. Wraps the `handleDownload` and button from US1 with state and error wiring.

### Parallel Opportunities

There are no meaningful parallel opportunities in this feature — all implementation tasks (T003–T010) modify the same file (`NfeTable.tsx`) sequentially. The `types/OrderTypes.ts` change (T002) is the only independent file and has no other task it can run alongside in the foundational phase.

---

## Parallel Example: User Story 1

```bash
# All US1 tasks are sequential (same file):
T003 → add imports
T004 → type props
T005 → implement handler
T006 → add column header
T007 → add button cell

# Then US2 and US3 extend the same file:
T008 → verify null render
T009 → add loading state
T010 → wire error toasts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002) — **critical**
3. Complete Phase 3: User Story 1 (T003–T007)
4. **STOP and VALIDATE**: Confirm download works end-to-end
5. Continue to US2/US3 or deploy as MVP

### Incremental Delivery

1. T001–T002 → Foundation ready
2. T003–T007 (US1) → Download works for fase-3 rows → **MVP deliverable**
3. T008 (US2) → Confirm clean empty cells — minimal effort, high confidence
4. T009–T010 (US3) → Loading state + error toasts → polished UX
5. T011 → Full smoke test

---

## Format Reference

- **[P]**: Can run in parallel (different files, no incomplete dependencies) — no [P] tasks in this feature; all work is in one file
- **[USn]**: User story label — traces each task to the story it delivers
- All paths are repository-relative
