# Data Model: XML Download Button for Notas Fiscais

**Phase**: 1 — Design & Contracts  
**Date**: 2026-02-19  
**Feature**: [spec.md](./spec.md)

---

## Entities

### NfeRow

Represents one row in the Notas Fiscais table as returned by `getOrdersByNfe`.

```typescript
// Location: /types/OrderTypes.ts (extend existing file)

export interface NfeRow {
  id: string | number;
  slug?: string;
  numero: string | number;
  nome_ecommerce: string;
  numero_ecommerce: string;
  orderId: string | number; // Codigo Sistema — used as getInvoiceXml parameter and filename
  date: string;
  nome: string;
  status: string; // Human-readable status label (e.g., "NFe emitida")
  status_processo: number; // Numeric phase — download button visible when === 3
  value: number;
  region: string;
}
```

**Validation rules**:

- `status_processo` must be compared with strict numeric equality `=== 3`
- `orderId` must be truthy before rendering or invoking the download button
- All fields are read-only within this feature — no mutations to this entity

---

### DownloadState

Ephemeral UI state tracking which rows are currently downloading. Not persisted.

```typescript
// Local to NfeTable component (useState)

type DownloadState = Record<string, boolean>;
// Key: orderId (coerced to string)
// Value: true while download is in progress, false/absent otherwise
```

---

### InvoiceXmlResult (existing — no changes)

Defined in `/actions/notaFiscalAction.tsx`. Reproduced here for reference:

```typescript
type InvoiceXmlResult = {
  success: boolean;
  message: string;
  data?: {
    invoiceXml: string; // base64-encoded XML (fallback source)
    xmlContent: string; // pre-decoded XML string (preferred source)
  };
  error?: string;
};
```

**XML content resolution order** (per FR-005):

1. `result.data?.xmlContent` — use if non-empty
2. `atob(result.data?.invoiceXml)` — use if `xmlContent` absent/empty and `invoiceXml` present
3. Neither present → error toast, abort download

---

## State Transitions

```
Row rendered
    │
    ├─ status_processo !== 3 → Ações cell: empty
    │
    └─ status_processo === 3 → Ações cell: <Button "XML">
                                       │
                                  User clicks
                                       │
                              [downloading[orderId] = true]
                              Button: disabled + spinner
                                       │
                               getInvoiceXml(orderId)
                                       │
                         ┌─────────────┴──────────────┐
                    success                        failure / error
                         │                             │
                 resolve xmlContent              toast.error(message)
                         │                             │
                  trigger file download        [downloading[orderId] = false]
                         │                       Button: re-enabled
               [downloading[orderId] = false]
                  Button: re-enabled
                  (no toast — browser handles)
```

---

## Files Affected

| File                                       | Change Type | Description                                                                      |
| ------------------------------------------ | ----------- | -------------------------------------------------------------------------------- |
| `types/OrderTypes.ts`                      | MODIFY      | Add `NfeRow` interface                                                           |
| `app/(private)/notas_fiscais/NfeTable.tsx` | MODIFY      | Replace `any` with `NfeRow[]`, add "Ações" column, add `handleDownload` function |
| `actions/notaFiscalAction.tsx`             | NO CHANGE   | `getInvoiceXml` already implemented and sufficient                               |
