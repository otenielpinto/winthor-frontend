# Spec — add-checkout-columns-nfe-table

## Requirements

### REQ-1: Two new columns in the NFe table
The Notas Fiscais table at `app/(private)/notas_fiscais/NfeTable.tsx` MUST display two additional columns at the end of the existing header/body set:
- Header text: **"Usuário"** — renders the value of `checkout_user`.
- Header text: **"Dt.Hora"** — renders the value of `checkout_data` formatted as `dd/MM/yyyy HH:mm` in pt-BR, timezone `America/Sao_Paulo`.

### REQ-2: Null / missing field safety
Documents in the `order` MongoDB collection may lack `checkout_user` and/or `checkout_data`, or have them as `null`. The table MUST render empty cells in those cases — no crash, no `undefined` or `null` string, no `[object Object]`.

### REQ-3: Formatting lives in the action layer
Per the project constitution, all business/transform logic stays in `"use server"` actions. The UI component MUST receive `checkout_data` already formatted as a string. The component does not import date utilities.

### REQ-4: Backwards-compatible types
The new fields added to `Order` and `NfeRow` interfaces in `types/OrderTypes.ts` MUST be **optional** so existing literal constructions of `Order` elsewhere in the codebase continue to compile.

## Scenarios

### Scenario S1: user performed checkout
Given an order doc with `checkout_user: "Anderson"` and `checkout_data` of `2026-07-31T08:23:21.402Z`,
when the NFe table renders,
then the "Usuário" cell shows `Anderson` and the "Dt.Hora" cell shows `31/07/2026 05:23` (UTC-3 that date; runtime computes DST).

### Scenario S2: old doc without checkout fields
Given an order doc where neither `checkout_user` nor `checkout_data` exists,
when the NFe table renders,
then both new cells render an empty string and the page does not throw.

### Scenario S3: doc with null values
Given an order doc with `checkout_user: null` and `checkout_data: null`,
when the NFe table renders,
then both new cells render an empty string (no `null`/`undefined` literal shown).

### Scenario S4: NFe filter "checkout_data" path
Given the existing `checkout_filter === "1"` branch in `getOrdersByNfe` that filters by `checkout_data`,
when the user uses that filter,
then the new columns still render correctly for the matched rows (no regression — the action already fetches whole docs).

## Out of scope
Filtering / sorting by the new columns; refactoring `formatDate` to a shared util; touching `FilterSection.tsx`.