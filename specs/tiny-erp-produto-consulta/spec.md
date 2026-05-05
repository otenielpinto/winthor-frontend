# Feature Specification: Tiny ERP Product Query Service

**Feature Branch**: `tiny-erp-produto-consulta`  
**Created**: 2026-05-05  
**Status**: Implemented  
**Input**: Enable WTA Connect operators to consult Tiny ERP products directly from the platform without switching to the Tiny ERP web UI.

---

## Purpose

Tiny ERP product query service for WTA Connect — two read-only Server Actions that query Tiny ERP API v2 for product search and detail by ID. All data access enforces tenant isolation via `getConfiguracaoTiny()`.

## Requirements

| ID | Requirement | Strength | Summary |
|----|------------|----------|---------|
| R1 | `searchTinyProducts(term, page?, pageSize?)` — full-text product search with pagination | MUST | Zod validates term ≥1 char, page ≥1, pageSize 1–100. Retrieves `tiny_token` per tenant. Calls `POST /api2/produtos.pesquisa.php` with URL-encoded body. Returns `{success, message, data?: {produtos[], pagina, numero_paginas}}` |
| R2 | `getTinyProductById(id)` — single product detail by numeric ID | MUST | Zod validates id as positive number string. Retrieves `tiny_token` per tenant. Calls `POST /api2/produto.obter.php` with URL-encoded body. Returns `{success, message, data?: TinyErpProduct}` |
| R3 | TypeScript types in `types/TinyErpTypes.ts` matching Tiny API response shapes | MUST | `TinyErpProduct` interface covering all fields from API response. `TinyErpSearchResult` for paginated search. Zod schemas for input validation only. All fields use Tiny's native names (`codigo`, `gtin`, `variacoes`, `anexos`, etc.). Zero `any` types. |

### R1 Scenarios

#### S1 — Successful search with results
- GIVEN tenant has valid `tiny_token` configured
- WHEN `searchTinyProducts("caneta azul")` is called
- THEN returns `{success: true, data: {produtos: [...], pagina: 1, numero_paginas: N}}`

#### S2 — Search with pagination
- GIVEN valid tenant and search term
- WHEN `searchTinyProducts("parafuso", 3, 50)` is called
- THEN returns page 3 with up to 50 results AND correct `numero_paginas`

#### S3 — Empty search term
- GIVEN any tenant state
- WHEN `searchTinyProducts("")` is called
- THEN returns `{success: false, message: "Termo de busca deve ter pelo menos 1 caractere"}`

#### S4 — Zero results
- GIVEN tenant has valid token
- WHEN Tiny API returns empty `produtos` array for a valid search
- THEN returns `{success: true, data: {produtos: [], pagina: 1, numero_paginas: 0}}`

#### S5 — Missing Tiny token
- GIVEN tenant has no `tiny_token` (null, empty, or undefined)
- WHEN any search action is called
- THEN returns `{success: false, message: "Token Tiny ERP não configurado para este tenant"}`

#### S6 — API network failure
- GIVEN tenant has valid token
- WHEN `fetch` to Tiny API throws (timeout, DNS, connection refused)
- THEN returns `{success: false, message: "Erro ao consultar Tiny ERP. Tente novamente."}`

#### S7 — Invalid pagination
- GIVEN any tenant state
- WHEN `searchTinyProducts("termo", 0, 200)` is called
- THEN Zod rejects — page < 1 AND pageSize > 100 → validation error returned

### R2 Scenarios

#### S1 — Product found
- GIVEN tenant has valid `tiny_token`
- WHEN `getTinyProductById("349112581")` is called
- THEN returns `{success: true, data: <TinyErpProduct>}` with full product detail

#### S2 — Product not found
- GIVEN valid tenant token
- WHEN `getTinyProductById("999999999")` and Tiny API returns error status
- THEN returns `{success: false, message: "Produto não encontrado no Tiny ERP"}`

#### S3 — Invalid ID (non-numeric)
- GIVEN any tenant state
- WHEN `getTinyProductById("abc")` is called
- THEN Zod rejects → returns `{success: false, message: "ID do produto deve ser um número válido"}`

#### S4 — API error response
- GIVEN valid tenant and product ID
- WHEN Tiny API returns `{retorno: {status: "Erro"}}` with error description
- THEN returns `{success: false, message: <Tiny error description>}`

### R3 Details

**`TinyErpProduct`** — full interface for `/api2/produto.obter.php` response. MUST include: `id`, `nome`, `codigo`, `unidade`, `preco`, `preco_promocional`, `preco_custo`, `preco_custo_medio`, `ncm`, `origem`, `gtin`, `gtin_embalagem`, `localizacao`, `situacao`, `tipo`, `tipoVariacao`, `variacoes[]`, `anexos[]`, `kit[]`, `fornecedor`, `marca`, `categoria`, `secaoProduto`, `estoque_minimo`, `estoque_maximo`, `peso_liquido`, `peso_bruto`, `data_criacao`, `data_modificacao`.

**`TinyErpSearchResult`** — wraps paginated search: `{produtos: TinyErpProduct[], pagina: number, numero_paginas: number}`.

**`TinyErpSearchSchema`**: `{pesquisa: z.string().min(1), pagina: z.number().int().min(1).optional().default(1), pageSize: z.number().int().min(1).max(100).optional().default(100)}`.

**`TinyErpGetByIdSchema`**: `{id: z.string().regex(/^\d+$/, "ID deve ser um número válido")}`.

## Non-Functional Requirements

| ID | Requirement | Strength |
|----|-------------|----------|
| NFR1 | All error messages MUST be in pt-BR | MUST |
| NFR2 | Zero `any` types in any exported function, type, or action code | MUST NOT |
| NFR3 | Actions MUST be server-only with `"use server"` directive | MUST |
| NFR4 | Every action MUST call `getUser()` before retrieving `getConfiguracaoTiny()` | MUST |

## Edge Cases

| # | Condition | Behavior |
|---|-----------|----------|
| EC1 | `tiny_token` is empty string or null | Same as missing token → "Token Tiny ERP não configurado para este tenant" |
| EC2 | `getConfiguracaoTiny()` returns null | Return pt-BR config error (no crash) |
| EC3 | Tiny API returns `status: "Erro"` with `status_processamento: "3"` | Treat as API error, extract and return error description |
| EC4 | Network timeout (fetch hangs) | Catch and return structured pt-BR error |
| EC5 | Search with special characters (acentos, símbolos) | Pass through as-is; Tiny API handles encoding |
| EC6 | Page > `numero_paginas` | Tiny returns empty `produtos[]` — return as valid `{success: true}` with empty array |
| EC7 | `pageSize > 100` | Rejected by Zod validation; Tiny API fixed at 100 max per page |

## Out of Scope

- UI components or pages consuming these actions (future change)
- Stock queries (`produto.obter.estoque.php`) — separate concern
- Order integration, product mutations, or caching layers
- Rate-limiting backoff/retry infrastructure (returns structured error; backoff deferred)
- Bulk operations or product create/update/delete endpoints
- Token management beyond reading `tiny_token` (static key, no TTL/refresh)
