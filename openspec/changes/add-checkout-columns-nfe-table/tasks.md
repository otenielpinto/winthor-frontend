# Tasks — add-checkout-columns-nfe-table

T1. `types/OrderTypes.ts` — add `checkout_user?: string;` and `checkout_data?: string;` to both `Order` (after line 61) and `NfeRow` (after line 98).

T2. `actions/pedidoAction.tsx` — add `fmtCheckoutDateTime` helper + map `checkout_user` and `checkout_data` in `toOrdersMappers()` (lines 51-73). Use `Intl` with timezone `America/Sao_Paulo`.

T3. `app/(private)/notas_fiscais/NfeTable.tsx` — add two `<TableHead>` after "Região" header (line 54) and two `<TableCell>` after the region cell (line 73). Use `?? ""` fallback.

T4. Validation — `npm run build` passes; verify no TS errors in touched files.

## Review Workload Forecast
- Estimated changed lines: ~30
- Chained PRs recommended: No
- 400-line budget risk: Low
- Decision needed before apply: No

Single small PR — all tasks in one apply pass.