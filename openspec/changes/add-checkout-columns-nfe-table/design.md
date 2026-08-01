# Design — add-checkout-columns-nfe-table

## Architecture
No new modules, no new dependencies. The change respects the existing 3-layer flow: Mongo doc → server action (mapping + formatting) → typed row → presentational component.

## Components touched

### 1. `types/OrderTypes.ts`
Add two optional string fields to both interfaces:
```ts
// Order (lines ~49-62)
checkout_user?: string;
checkout_data?: string;

// NfeRow (lines ~86-99)
checkout_user?: string;
checkout_data?: string;
```
Marked optional so existing `Order` literals (~5 call sites across `pedidoAction.tsx`) remain type-safe.

### 2. `actions/pedidoAction.tsx` — `toOrdersMappers()` (lines 51-73)
Add a tiny private formatter at the top of the function (or above it):
```ts
const fmtCheckoutDateTime = (d: unknown): string =>
  d instanceof Date || typeof d === "string" || typeof d === "number"
    ? new Date(d as any).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "";
```
Then inside the map loop after the existing computed vars:
```ts
const checkout_user = order.checkout_user ?? "";
const checkout_data = fmtCheckoutDateTime(order.checkout_data);
```
And include both in the pushed object.

**Why `Intl` and not `lib.dateToBr`:** `lib.dateToBr` hand-rolls a 3-hour offset (`now.getTime() - 3*60*60*1000`), which is wrong during Brazil DST transitions. `Intl` with `timeZone: "America/Sao_Paulo"` delegates DST to the runtime — correct year-round.

**Guard order:** the `instanceof Date || typeof string|number` branch covers the Mongo driver's runtime type (Date) plus defensive coercion for raw ISO strings. Objects (the raw `{$date}` wrapper from JSON exports) deliberately fall through to `""` since they only appear in test fixtures, not runtime rows.

### 3. `app/(private)/notas_fiscais/NfeTable.tsx`
Two new `<TableHead>` after line 54 ("Região"):
```tsx
<TableHead>Usuário</TableHead>
<TableHead>Dt.Hora</TableHead>
```
Two new `<TableCell>` after line 73 (region):
```tsx
<TableCell>{order.checkout_user ?? ""}</TableCell>
<TableCell>{order.checkout_data ?? ""}</TableCell>
```
The `?? ""` is belt-and-suspenders since the action already guarantees strings — but the component is typed `NfeRow` and the field is optional, so TS allows `undefined`; the fallback keeps the cell visibly empty without printing `undefined`.

## Alternatives considered
- **Format in the component**: rejected — violates constitution (UI does no business logic).
- **Add `formatDate` to `lib.ts`**: rejected for this slice (YAGNI — only one new consumer; two local copies exist elsewhere; extract when a 3rd consumer arrives).
- **Projection in Mongo `find()`**: rejected — unnecessary; whole docs already fetched; adding projection risks dropping fields other code paths consume.
- **Required fields in interfaces**: rejected — would break other `Order` constructors across `pedidoAction.tsx`.

## Validation
- `npm run build` passes with no new TypeScript errors.
- Manual: load the NFe page with the default filter ("NFe emitida"); confirm the two columns appear with values for recent docs and empty cells for old ones.