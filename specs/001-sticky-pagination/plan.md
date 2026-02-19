# Implementation Plan: Paginação Fixa e Visível na Listagem de Pedidos

**Branch**: `001-sticky-pagination` | **Date**: 2026-02-19 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-sticky-pagination/spec.md`

## Summary

A barra de paginação do componente `DataTable` (usado na listagem de pedidos)
atualmente fica ao final do fluxo de documento e sai da área visível quando o
usuário rola a tabela. O objetivo é torná-la sempre visível usando
`position: sticky; bottom: 0`, adicionar indicador de loading nos botões de
navegação, implementar scroll-to-top automático ao trocar de página, e garantir
que o conteúdo da tabela nunca fique oculto atrás da barra.

Nenhuma alteração no servidor ou na camada de dados é necessária — toda a
implementação é puramente de UI.

## Technical Context

**Language/Version**: TypeScript 5 / React 18 / Next.js 15 (App Router)  
**Primary Dependencies**: TanStack Table v8, TanStack Query v5, Tailwind CSS v3, shadcn/ui  
**Storage**: N/A (nenhuma alteração de dados)  
**Testing**: Verificação visual + TypeScript `--noEmit`  
**Target Platform**: Web — desktop ≥ 1024px primário; responsivo até 375px  
**Project Type**: Web (Next.js App Router, single repo)  
**Performance Goals**: Mudança de página percebida em < 300ms (sem regressão)  
**Constraints**: Sidebar shadcn/ui ocupa parte da largura da viewport — a barra
deve usar `sticky` (relativa ao scroll container) e não `fixed` (relativa à
viewport) para não sobrepor a sidebar  
**Scale/Scope**: Afeta um único componente `DataTable` e seu consumidor `OrderList`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Server-First Business Logic | ✅ PASS | Nenhuma lógica de negócios no cliente; sem acesso a MongoDB ou chamadas de API diretas |
| II | Type Safety | ✅ PASS | Prop `isLoading: boolean` será tipada; nenhum `any` introduzido |
| III | Multi-Tenant Data Isolation | ✅ PASS | Não há alterações na camada de dados |
| IV | shadcn/ui Component Hierarchy | ✅ PASS | Usa `Button` de `/components/ui/`; nenhum elemento `<button>` raw |
| V | Session-Guarded Routes | ✅ PASS | Nenhuma rota nova; componente reside dentro de `app/(private)/` já protegido |

**Stack compliance**: Somente Tailwind CSS + shadcn/ui para UI; TanStack Table para tabela; TanStack Query para estado async. Nenhuma biblioteca nova introduzida.

## Phase 0: Research

### Pesquisa 1 — `sticky` vs `fixed` no layout com Sidebar shadcn/ui

**Decisão**: `position: sticky; bottom: 0` (classe Tailwind `sticky bottom-0`)  
**Rationale**: O layout `(private)` usa `SidebarProvider > SidebarInset > main`. O conteúdo renderiza dentro do `main`, e o scroll de página ocorre no `html/body`. Com `sticky bottom-0`, a barra fica ancorada ao fundo da viewport enquanto há conteúdo acima dela para rolar, sem extensão atrás da sidebar.  
Com `position: fixed`, a barra ficaria na largura total da viewport (incluindo a área da sidebar), exigindo cálculo dinâmico de `left` baseado na largura da sidebar — desnecessariamente complexo.  
**Alternativas consideradas**: `fixed bottom-0 left-[--sidebar-width] right-0` — rejeitado pela fragilidade ao sidebar ser colapsado/expandido.

### Pesquisa 2 — Prevenção de conteúdo oculto pela barra sticky

**Decisão**: Adicionar `pb-20` (80px) no container pai da barra (`DataTable`) para que, quando a barra está colada ao fundo, a última linha da tabela não fique por baixo dela.  
**Rationale**: A barra mede aproximadamente 52px de altura. `pb-20` (80px) garante folga suficiente em todas as resoluções.  
**Alternativas consideradas**: Padding no `OrderList` — rejeitado porque o próprio `DataTable` é responsável pela sua barra; manter o encapsulamento dentro do componente é correto.

### Pesquisa 3 — Scroll-to-top ao trocar de página

**Decisão**: Chamar `window.scrollTo({ top: 0, behavior: 'instant' })` dentro de `handlePageChange` em `OrderList`, antes de `setPage(newPage)`.  
**Rationale**: `behavior: 'instant'` evita animação lenta que confundiria o usuário ao ver dados antigos rolando. `ScrollIntoView` numa `ref` do container da tabela seria equivalente mas mais frágil em SSR.  
**Alternativas consideradas**: `ref.scrollIntoView()` — rejeitado por acoplamento desnecessário entre `OrderList` e `DataTable`.

### Pesquisa 4 — Loading state nos botões de paginação

**Decisão**: Adicionar prop `isLoading?: boolean` ao `DataTable`. Quando `true`, desabilitar ambos os botões e exibir `<Loader2 className="h-4 w-4 animate-spin" />` ao lado do texto "Próxima" / "Anterior".  
**Rationale**: FR-004 exige que os botões sejam desabilitados durante o carregamento. O `isLoading` já existe no `OrderList` (vindo de TanStack Query) e só precisa ser repassado.  
**Alternativas consideradas**: Desabilitar apenas via CSS opacity sem ícone — rejeitado por não dar feedback visual suficiente.

## Phase 1: Design & Contracts

### Mudanças de dados — Nenhuma

Nenhuma entidade nova. Nenhum schema Zod. Nenhuma alteração em Server Action.
Os tipos `PaginatedOrderResult` e `FiltersOrder` (com `page?`, `pageSize?`)
já foram adicionados em `/types/OrderTypes.ts` na iteração anterior.

### Contrato de componente — `DataTable` (atualizado)

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // Paginação server-side (opcional)
  total?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Novo: repassa estado de loading do TanStack Query
  isLoading?: boolean;
}
```

**Mudança estrutural no JSX**: o `<div>` da barra de paginação ganha as classes
`sticky bottom-0 z-10 bg-background border-t` e o container raiz do DataTable
ganha `pb-20`.

### Quickstart — como testar a feature

```bash
# 1. Certifique-se de estar na branch correta
git checkout 001-sticky-pagination

# 2. Instale dependências (se necessário)
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse http://localhost:3000
# Navegue para Pedidos > faça uma busca que retorne > 50 resultados
# Verifique que ao rolar a lista, a barra de paginação permanece visível na base da tela

# 5. Verificação de tipos
npx tsc --noEmit
```

## Project Structure

### Documentation (this feature)

```text
specs/001-sticky-pagination/
├── plan.md              ← este arquivo
├── research.md          ← consolidado no plan.md (Phase 0 acima)
├── checklists/
│   └── requirements.md
└── tasks.md             ← criado pelo /speckit.tasks (próximo passo)
```

### Source Code — Arquivos afetados

```text
app/(private)/orders/
├── DataTable.tsx        ← MODIFICAR: sticky bar + isLoading prop + pb-20
└── OrderList.tsx        ← MODIFICAR: passar isLoading + scroll-to-top

types/
└── OrderTypes.ts        ← SEM ALTERAÇÃO (tipos já atualizados)

actions/
└── pedidoAction.tsx     ← SEM ALTERAÇÃO (server action já atualizada)
```

**Structure Decision**: Single-project (Next.js App Router). Toda a implementação
fica dentro do módulo `app/(private)/orders/`. Nenhuma pasta nova necessária.

## Implementation Phases

### Phase A — Sticky pagination bar (FR-001, FR-006)
Modificar `DataTable.tsx`:
- Container raiz: adicionar `pb-20`
- Div da barra: trocar `py-4` por `sticky bottom-0 z-10 bg-background border-t px-4 py-3`

### Phase B — Loading state nos botões (FR-004)
Modificar `DataTable.tsx`:
- Adicionar prop `isLoading?: boolean`
- Desabilitar botões quando `isLoading === true`
- Exibir `<Loader2 animate-spin>` ao lado de "Anterior" / "Próxima" durante loading

### Phase C — Scroll-to-top ao trocar página (FR-005)
Modificar `OrderList.tsx`:
- `handlePageChange`: chamar `window.scrollTo({ top: 0, behavior: 'instant' })` antes de `setPage`
- Passar `isLoading={isLoading}` ao `<DataTable>`

### Phase D — Validação final
- `npx tsc --noEmit` sem erros
- Teste visual: scroll + navegação de página

## Constitution Check (pós-design)

| # | Principle | Status |
|---|-----------|--------|
| I | Server-First | ✅ Nenhuma lógica de servidor no cliente |
| II | Type Safety | ✅ `isLoading: boolean` — sem `any`, sem asserções |
| III | Multi-Tenant | ✅ Sem alteração de dados |
| IV | shadcn/ui | ✅ `Button` de `/components/ui/`; `Loader2` de lucide-react (já no projeto) |
| V | Session-Guarded | ✅ Sem rotas novas |

**Resultado: APROVADO — sem violações.**
