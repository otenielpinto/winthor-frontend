# Research: XML Download Button for Notas Fiscais

**Phase**: 0 — Outline & Research  
**Date**: 2026-02-19  
**Feature**: [spec.md](./spec.md)

---

## 1. Browser File Download from a String in Next.js Client Component

**Decision**: Use the Blob + anchor-click pattern — create a `Blob` from the XML string, generate an object URL with `URL.createObjectURL`, programmatically click a temporary `<a>` element with `download` attribute, then revoke the URL.

**Rationale**: Works in all modern browsers without any third-party library. Compatible with Next.js client components running in the browser. No server round-trip required — the content is already in memory after the server action returns.

**Pattern**:

```ts
const blob = new Blob([xmlContent], { type: "application/xml" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = `nfe-${orderId}.xml`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
```

**Alternatives considered**:

- `window.open(dataURI)` — blocked by pop-up blockers in some browsers. Rejected.
- Server-side file streaming endpoint — introduces unnecessary new API route. Rejected (spec says no new endpoints).
- `FileSaver.js` library — adds a dependency for functionality achievable in 6 native lines. Rejected (constitution: no new UI libs without amendment).

---

## 2. Base64 Decode in Browser

**Decision**: Use native `atob()` for base64 decoding of `invoiceXml` when `xmlContent` is absent/empty.

**Rationale**: `atob()` is available in all modern browsers and in the Next.js runtime (both browser and Edge). No additional package required. NF-e XML files are ASCII/UTF-8 text; `atob()` handles them correctly.

**Pattern**:

```ts
const xmlContent =
  result.data?.xmlContent ||
  (result.data?.invoiceXml ? atob(result.data.invoiceXml) : null);
```

**Alternatives considered**:

- `Buffer.from(b64, "base64").toString("utf-8")` — Node.js only, not available in browser client components. Rejected.
- A `base64-js` package — unnecessary given `atob()` availability. Rejected.

---

## 3. Sonner Toast in Client Components

**Decision**: Import `toast` from `"sonner"` directly in the component. Call `toast.error(message)` for failure feedback. No success toast needed (see spec FR-012).

**Rationale**: The project already has `sonner` installed and a `<Toaster>` mounted in `app/layout.tsx` (via `components/ui/sonner.tsx`). Direct import requires no setup.

**Pattern**:

```ts
import { toast } from "sonner";
// ...
toast.error("Erro ao baixar XML: " + result.message);
```

**Alternatives considered**:

- The legacy `useToast` hook (`components/ui/use-toast.ts`) — present in the codebase but the constitution specifies `sonner` as the sole notification mechanism. Rejected.

---

## 4. Per-Row Loading State Pattern

**Decision**: Use a `useState<Record<string, boolean>>({})` map keyed by `orderId` to track which row is downloading. This avoids a single boolean (which would disable all buttons simultaneously) and keeps state local to `NfeTable`.

**Rationale**: Multiple rows may be rendered. Users should be able to initiate a second download on a different row while the first is in progress. Keying by `orderId` (unique per row) is the minimal correct approach.

**Pattern**:

```ts
const [downloading, setDownloading] = useState<Record<string, boolean>>({});

const handleDownload = async (orderId: string) => {
  setDownloading((prev) => ({ ...prev, [orderId]: true }));
  try {
    // ... call getInvoiceXml, trigger download
  } finally {
    setDownloading((prev) => ({ ...prev, [orderId]: false }));
  }
};
```

**Alternatives considered**:

- A single `downloadingId: string | null` — only supports one concurrent download. Rejected as unnecessarily restrictive.
- External state (Zustand, React Query mutation) — overkill for ephemeral UI state scoped to one component. Rejected.

---

## 5. shadcn/ui Button Variant for the Action

**Decision**: Use `variant="outline"` with `size="sm"` and the `Download` icon from `lucide-react`. Label: "XML".

**Rationale**: `outline` buttons are visually lightweight, appropriate for secondary/utility actions within a data row. `size="sm"` prevents row height expansion. The `Download` icon from `lucide-react` is already a project dependency (used elsewhere) and communicates intent without additional text bulk.

**Alternatives considered**:

- `variant="ghost"` — lower contrast, less discoverable for a CTF (call-to-focus) action. Rejected.
- Icon-only button with tooltip — lower discoverability; tooltip requires hover which is inaccessible on touch. Rejected as sole option; label retained.

---

## All NEEDS CLARIFICATION items: Resolved

| Item                           | Resolution                                |
| ------------------------------ | ----------------------------------------- |
| `status_processo` field source | Confirmed numeric field in row data       |
| Access control                 | All authenticated users, no extra check   |
| XML content fallback           | `xmlContent` → `atob(invoiceXml)` → error |
| Filename identifier            | `nfe-{orderId}.xml` (Codigo Sistema)      |
| Success toast                  | None — browser native is sufficient       |
