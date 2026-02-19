# Feature Specification: XML Download Button for Notas Fiscais

**Feature Branch**: `002-xml-download-button`  
**Created**: 2026-02-19  
**Status**: Draft  
**Input**: User description: "analise do ponto de vista da usabilidade e decida onde fica melhor colocar um botao para download do xml. Esse botao só ficar disponivel quando status_processo = 3 (na grid aparece como fase). ao clicar em download precisa fazer o download do arquivo em base64 e converter em arquivo xml. use getInvoiceXml"

---

## Context & Usability Analysis

The Notas Fiscais screen (`/notas_fiscais`) displays a table with columns: Numero, Canal de Venda, Numero ecommerce, Codigo Sistema, Data, Nome do Cliente, Status, Valor, Região.

**Recommended placement**: Add a dedicated **"Ações"** (Actions) column as the **last column** of the table. Within each row, the download XML button is rendered conditionally — only when `status_processo = 3`. For rows that do not meet this condition, the cell is left empty, preserving column alignment.

**Why "Ações" column is best**:

- Consistent with standard data-table UX patterns (actions rightmost, data leftmost)
- Avoids cluttering the Status column or adding a floating overlay
- Scales gracefully if future row-level actions are added
- A compact button (download icon + "XML" label) gives clear affordance without expanding row height

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Download XML for Completed Invoice (Priority: P1)

An operator viewing the Notas Fiscais grid identifies an invoice in fase 3 (`status_processo = 3`) and wants to obtain the XML file for accounting or tax compliance purposes. They click the download button directly in the row and the browser saves the `.xml` file automatically — no navigation away from the page required.

**Why this priority**: This is the core capability. Directly enables tax-compliance workflows with zero friction.

**Independent Test**: Navigate to `/notas_fiscais`, filter to show records. Identify any row with fase = 3. Click the download button; verify a `.xml` file is saved to disk with valid XML content matching the invoice number.

**Acceptance Scenarios**:

1. **Given** a Notas Fiscais row where `status_processo = 3`, **When** the user views the row, **Then** a download button (⬇ XML) is visible in the "Ações" column.
2. **Given** the user clicks the download button, **When** the API call to `getInvoiceXml` succeeds, **Then** the browser immediately downloads a file named `nfe-{orderId}.xml` containing valid XML.
3. **Given** the API returns a base64-encoded XML string, **When** the browser receives it, **Then** the file is decoded and saved as a plain-text `.xml` file (not raw base64 text).

---

### User Story 2 - Button Hidden for Non-Eligible Invoices (Priority: P2)

An operator browses invoices in earlier phases and observes that the "Ações" column is empty for those rows — no confusing or disabled download button appears.

**Why this priority**: Prevents user confusion and incorrect action attempts on invoices that have no XML yet.

**Independent Test**: Filter to show rows with different status values. Verify only rows with fase = 3 show the download button; all other rows show an empty "Ações" cell.

**Acceptance Scenarios**:

1. **Given** a row where `status_processo ≠ 3`, **When** the user views the row, **Then** the "Ações" column cell is empty (no button rendered).
2. **Given** a mix of rows with different fase values in the table, **When** the page loads, **Then** only fase-3 rows display the download button.

---

### User Story 3 - Feedback During Download & Error Handling (Priority: P3)

While the XML is being fetched, the operator receives visual feedback (loading state on the button). If the download fails, a clear non-blocking error message is shown.

**Why this priority**: Prevents silent failures and user confusion in the minority case of API errors.

**Independent Test**: Simulate an API failure and click the download button. Verify a toast error message appears and the button returns to its normal state.

**Acceptance Scenarios**:

1. **Given** the user clicks the download button, **When** the API call is in progress, **Then** the button shows a loading indicator and is disabled to prevent duplicate requests.
2. **Given** the user clicks the download button, **When** the API call fails or returns `success: false`, **When** the response is received, **Then** a non-blocking error notification (toast) is displayed with a human-readable message, and the button returns to its clickable state.
3. **Given** the API returns success but the XML content is empty or malformed (both `xmlContent` and `invoiceXml` absent), **When** the download is triggered, **Then** an error toast is shown and no file is saved. On a successful download no toast is shown — the browser file-save is the only feedback.

---

### Edge Cases

- What happens when the user clicks the download button rapidly multiple times? → Button must be disabled while loading to prevent duplicate requests.
- What happens when `orderId` is null or undefined for a row? → Button should not render for that row.
- `status_processo` is confirmed as a numeric field; comparison uses strict numeric equality (`=== 3`). String `"3"` values are not expected but can be coerced as a defensive measure.
- What happens when the downloaded XML is very large? → Browser handles the native file download; no special handling needed for typical NF-e XML sizes.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Notas Fiscais table MUST include an "Ações" column as the last column, visible on all rows.
- **FR-002**: The XML download button MUST only be rendered in rows where `status_processo === 3` (numeric field, distinct from the `status` text column).
- **FR-003**: Rows where `status_processo ≠ 3` MUST display an empty cell in the "Ações" column.
- **FR-004**: Clicking the download button MUST invoke `getInvoiceXml` using the row's `orderId` value.
- **FR-005**: The system MUST obtain the XML content using the following priority: (1) use `xmlContent` directly if non-empty; (2) fallback to client-side base64 decoding of `invoiceXml` if `xmlContent` is absent/empty; (3) if both are missing, show an error toast and abort the download.
- **FR-006**: The downloaded file MUST be named `nfe-{orderId}.xml`, where `orderId` is the Codigo Sistema value (the same identifier passed to `getInvoiceXml`).
- **FR-007**: The download button MUST display a loading indicator and become non-interactive while the API call is in progress.
- **FR-008**: If the API call fails or returns `success: false`, the system MUST display a non-blocking error notification (toast) with a descriptive message.
- **FR-009**: After a failed or successful download attempt, the button MUST return to its interactive state.
- **FR-010**: The button MUST be compact (icon + short label or icon-only with tooltip) to preserve table row height and visual balance.
- **FR-011**: The download button MUST be visible and functional for all authenticated users who have access to the Notas Fiscais screen; no additional role or permission check is required beyond existing route authentication.
- **FR-012**: On successful download the system MUST NOT display a success toast — the browser's native file-save indicator is the sole success signal.

### Key Entities

- **Invoice Row**: Represents a nota fiscal entry in the table. Key attributes for this feature: `orderId` (download identifier), `status_processo` — a **separate numeric field** in the row data (distinct from the human-readable `status` text column) — controls button visibility. Condition: `row.status_processo === 3`.
- **InvoiceXmlResult**: The API response object containing `invoiceXml` (base64 string) and `xmlContent` (already-decoded XML string). The download uses `xmlContent` directly when non-empty; otherwise decodes `invoiceXml` from base64. If both are absent, the download is aborted and an error toast is shown.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can download an NF-e XML file in under 5 seconds from click to file save under normal network conditions.
- **SC-002**: The download button appears exclusively on fase-3 rows — 0% of non-fase-3 rows render the button.
- **SC-003**: 100% of downloaded `.xml` files are valid, non-corrupted XML documents (not raw base64 text).
- **SC-004**: Users see a loading indicator within 300ms of clicking the download button.
- **SC-005**: On API failure, users receive an error notification — no silent failures occur.

---

## Clarifications

### Session 2026-02-19

- Q: Is `status_processo` a separate numeric field in the row data, or does it map to the text `status` field, or does it need to be added to the query? → A: `status_processo` is a separate numeric field already returned in the row data (e.g., `row.status_processo === 3`).
- Q: Who can use the download button — all authenticated users, or only admins? → A: All authenticated users who can access the Notas Fiscais screen (no extra role check required).
- Q: When `xmlContent` is null/empty but `invoiceXml` (base64) is present, should the system fallback to decoding base64, show an error, or always use base64? → A: Use `xmlContent` first; if absent/empty, decode `invoiceXml` from base64 as fallback. Only show error if both are missing.
- Q: Which identifier should appear in the downloaded filename — `orderId` (Codigo Sistema), `numero` (Winthor number), or both? → A: `nfe-{orderId}.xml` using the same `orderId` field passed to `getInvoiceXml` (Codigo Sistema column).
- Q: Should a success toast be shown after a successful download? → A: No — browser native file-save behaviour is sufficient feedback; success toasts are not displayed.

---

## Assumptions

- `orderId` in the NfeTable data (Codigo Sistema column) corresponds to the `orderId` parameter expected by `getInvoiceXml` and is also used as the filename identifier (`nfe-{orderId}.xml`).
- `status_processo = 3` is the definitive condition for XML availability; no intermediate states require handling at this time.
- The `xmlContent` field in `InvoiceXmlResult` is preferred. If absent/empty, `invoiceXml` is decoded via base64 client-side. Both being absent triggers an error state.
- The existing toast/sonner notification system in the project is used for error messages.
- No new API endpoints are needed; `getInvoiceXml` from `notaFiscalAction.tsx` is sufficient.
- No role-based visibility check is applied to the download button; access is governed solely by the existing Notas Fiscais route authentication.
- Column header label will be "Ações" (Portuguese, consistent with the rest of the UI language).
