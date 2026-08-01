# Proposal — add-checkout-columns-nfe-table

## Intent
Add two columns to the Notas Fiscais table (`app/(private)/notas_fiscais/NfeTable.tsx`) so users can see, per row, **who** performed the checkout (`checkout_user`) and **when** (`checkout_data` as date + time).

## Scope

### IN
- Add `checkout_user` and `checkout_data` (already-formatted string) fields to `NfeRow` and `Order` interfaces in `types/OrderTypes.ts`.
- Map the two fields in `toOrdersMappers()` (`actions/pedidoAction.tsx`) with null/missing guards and pt-BR date+time formatting (`dd/MM/yyyy HH:mm`, timezone `America/Sao_Paulo`).
- Render two new columns at the end of `NfeTable.tsx`: headers "Usuário" / "Dt.Hora".

### OUT
- Filters / search by `checkout_user`.
- Sorting by the new columns.
- Refactoring other tables or moving `formatDate` to a shared util (YAGNI — two local copies exist today; revisit only when a 3rd consumer appears).
- Touching `FilterSection.tsx`.

## Approach
1. **`types/OrderTypes.ts`** — add two **optional** string fields to both `Order` (lines 49-62) and `NfeRow` (lines 86-99):
   ```ts
   checkout_user?: string;
   checkout_data?: string; // already formatted "dd/MM/yyyy HH:mm"
   ```
   Optional keeps the change backwards-compatible with other `Order` constructors.
2. **`actions/pedidoAction.tsx`** — in `toOrdersMappers()` (lines 51-73), before the `orders.push({...})`, compute:
   ```ts
   const checkoutUser = order.checkout_user ?? "";
   const checkoutData = order.checkout_data
     ? new Date(order.checkout_data).toLocaleString("pt-BR", {
         timeZone: "America/Sao_Paulo",
         day: "2-digit", month: "2-digit", year: "numeric",
         hour: "2-digit", minute: "2-digit",
       })
     : "";
   ```
   and include `checkout_user: checkoutUser, checkout_data: checkoutData` in the pushed object. The Mongo driver returns `checkout_data` as a `Date` at runtime (the `{$date}` wrapper only appears in raw JSON exports).
3. **`app/(private)/notas_fiscais/NfeTable.tsx`** — append two `<TableHead>` ("Usuário", "Dt.Hora") after "Região" (line 54), and two `<TableCell>` after the region cell (line 73) rendering `order.checkout_user` and `order.checkout_data`. Falsy values render as empty string naturally (no crash).

## Data shape

Before (row):
```ts
{ id, slug?, numero, nome_ecommerce, numero_ecommerce, orderId, date, nome, status, status_processo, value, region }
```

After (row):
```ts
{ ..., region, checkout_user?: string, checkout_data?: string }
```

Source MongoDB doc (relevant fields):
```json
{ "checkout_data": { "$date": "2026-07-31T08:23:21.402Z" }, "checkout_user": "Anderson" }
```

## Risks
- **Timezone**: `checkout_data` stored in UTC. Use `Intl` with `timeZone: "America/Sao_Paulo"` so DST is handled by the runtime — do NOT hand-roll the 3h offset (`lib.dateToBr` does that manually and would be wrong during DST).
- **Type compatibility**: `Order` is consumed across the app. Marking the new fields **optional** keeps existing `Order` literals type-safe.
- **Missing fields on old docs**: `checkout_user`/`checkout_data` may be absent or `null`. Already covered by `?? ""` and the `order.checkout_data ?` guard.

## Acceptance
- "Usuário" and "Dt.Hora" columns appear at the end of the NFe table.
- Docs without `checkout_user` / `checkout_data` render empty cells (no crash, no `undefined`/`null` string).
- `checkout_data` shows `dd/MM/yyyy HH:mm` in Brazil timezone.
- `npm run build` passes (no new TS errors).