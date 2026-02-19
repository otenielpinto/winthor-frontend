# Quickstart: XML Download Button for Notas Fiscais

**Phase**: 1 — Design  
**Date**: 2026-02-19  
**Branch**: `002-xml-download-button`

---

## What is being built

A conditional XML download button added to the Notas Fiscais table. The button appears only on rows where `status_processo === 3`, placed in a new "Ações" column at the far right of the table. On click it downloads the NF-e XML file via the existing `getInvoiceXml` server action.

---

## Files to change

Only 2 source files need modification:

| File                                       | What changes                                    |
| ------------------------------------------ | ----------------------------------------------- |
| `types/OrderTypes.ts`                      | Add `NfeRow` interface                          |
| `app/(private)/notas_fiscais/NfeTable.tsx` | Add "Ações" column, typed props, download logic |

---

## Step 1 — Add `NfeRow` type to `types/OrderTypes.ts`

Append to the existing file:

```typescript
export interface NfeRow {
  id: string | number;
  slug?: string;
  numero: string | number;
  nome_ecommerce: string;
  numero_ecommerce: string;
  orderId: string | number;
  date: string;
  nome: string;
  status: string;
  status_processo: number; // ← download button visible when === 3
  value: number;
  region: string;
}
```

---

## Step 2 — Update `NfeTable.tsx`

### 2a. Replace `any` prop with `NfeRow[]`

```tsx
// Before
export default function NfeTable({ data }: any) {

// After
import { NfeRow } from "@/types/OrderTypes";
export default function NfeTable({ data }: { data: NfeRow[] }) {
```

### 2b. Add imports

```tsx
import { useState } from "react";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInvoiceXml } from "@/actions/notaFiscalAction";
```

### 2c. Add per-row download state and handler (inside component, after existing hooks)

```tsx
const [downloading, setDownloading] = useState<Record<string, boolean>>({});

const handleDownload = async (orderId: string | number) => {
  const key = String(orderId);
  setDownloading((prev) => ({ ...prev, [key]: true }));
  try {
    const result = await getInvoiceXml(orderId);
    if (!result.success) {
      toast.error(result.message || "Erro ao baixar XML da nota fiscal.");
      return;
    }
    const xmlContent =
      result.data?.xmlContent ||
      (result.data?.invoiceXml ? atob(result.data.invoiceXml) : null);
    if (!xmlContent) {
      toast.error("XML da nota fiscal não encontrado.");
      return;
    }
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nfe-${key}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    toast.error("Erro inesperado ao baixar o XML.");
  } finally {
    setDownloading((prev) => ({ ...prev, [key]: false }));
  }
};
```

### 2d. Add "Ações" column header (after `<TableHead>Região</TableHead>`)

```tsx
<TableHead>Ações</TableHead>
```

### 2e. Add "Ações" cell in the row map (after `region` cell)

```tsx
<TableCell>
  {order.status_processo === 3 && order.orderId ? (
    <Button
      variant="outline"
      size="sm"
      disabled={downloading[String(order.orderId)]}
      onClick={() => handleDownload(order.orderId)}
    >
      {downloading[String(order.orderId)] ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <Download className="h-3 w-3 mr-1" />
      )}
      XML
    </Button>
  ) : null}
</TableCell>
```

---

## Testing checklist

- [ ] Navigate to `/notas_fiscais` and filter to find records
- [ ] Confirm rows with `status_processo = 3` show the "⬇ XML" button in the "Ações" column
- [ ] Confirm all other rows have an empty "Ações" cell
- [ ] Click a download button — verify a `nfe-{orderId}.xml` file is saved and contains valid XML
- [ ] Click the button — verify it shows a loading spinner and is disabled until the request completes
- [ ] (Error path) With backend unavailable — verify a toast error appears and the button re-enables
- [ ] Verify no success toast appears after a successful download

---

## No new dependencies required

All libraries used (`sonner`, `lucide-react`, `shadcn/ui Button`, TanStack Query) are already installed. No `npm install` needed.
