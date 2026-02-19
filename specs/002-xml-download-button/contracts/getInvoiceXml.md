# Contract: getInvoiceXml

**Type**: Next.js Server Action (existing — no changes required)  
**Location**: `/actions/notaFiscalAction.tsx`  
**Feature**: XML Download Button for Notas Fiscais

---

## Signature

```typescript
export async function getInvoiceXml(
  orderId: string | number,
): Promise<InvoiceXmlResult>;
```

## Parameters

| Parameter | Type               | Required | Description                                                                    |
| --------- | ------------------ | -------- | ------------------------------------------------------------------------------ |
| `orderId` | `string \| number` | Yes      | The Winthor Codigo Sistema value for the order. Sourced from `NfeRow.orderId`. |

## Response Type

```typescript
type InvoiceXmlResult = {
  success: boolean; // true = XML retrieved; false = error occurred
  message: string; // Human-readable status message (pt-BR)
  data?: {
    invoiceXml: string; // base64-encoded NF-e XML document
    xmlContent: string; // pre-decoded UTF-8 XML string (preferred for download)
  };
  error?: string; // Machine-readable error code (present on failure)
};
```

## Consumer Contract (NfeTable)

The component consuming this action MUST:

1. Check `result.success` before accessing `result.data`
2. Use `result.data.xmlContent` as the XML source when non-empty
3. Fall back to `atob(result.data.invoiceXml)` when `xmlContent` is absent/empty
4. Show `toast.error(result.message)` when `result.success === false` or both XML fields are absent
5. Never attempt to download when XML content resolves to an empty string

## Underlying API

```
GET http://{totvs_host}:{totvs_port}/winthor/fiscal/v1/documentosfiscais/nfe/invoiceDocument
  ?orderId={orderId}&returnBase64=true

Authorization: Bearer {winthor_token}
```

Token acquisition and renewal (401/403 retry) are handled internally by the server action. The component does not interact with auth directly.

## Error Scenarios

| Scenario               | `success` | `message` (example)                    | Component Action                |
| ---------------------- | --------- | -------------------------------------- | ------------------------------- |
| `orderId` missing      | `false`   | "orderId é obrigatório"                | toast.error                     |
| User not authenticated | `false`   | "Usuário não autenticado..."           | toast.error                     |
| TOTVS config missing   | `false`   | "Configuração TOTVS não encontrada..." | toast.error                     |
| Token renewal failed   | `false`   | "Falha ao renovar token Winthor"       | toast.error                     |
| HTTP error from API    | `false`   | "Erro ao buscar XML..."                | toast.error                     |
| Success, XML empty     | `true`    | —                                      | Both fields empty → toast.error |
| Success, XML present   | `true`    | —                                      | Trigger download                |
