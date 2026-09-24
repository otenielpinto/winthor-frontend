# Produtos Simples — Relatório

## Objetivo
Relatório Excel (mesmo formato de Produtos Kit) lendo a collection `product_price`.

## Escopo autorizado
- Nova action `actions/produtoSimplesRelatorioAction.tsx`
- Nova página `app/(private)/relatorios/produtos-simples/page.tsx`
- Item de menu "Produtos Simples" abaixo de "Produtos Kit" em `components/app-sidebar.tsx`

## Mudança aceita (usuário, 2ª iteração)
- Filial não é mais fixa: **seletor de filial** na página. Opções vindas de `distinct codfilial` por tenant (action `getFiliaisProdutosSimples`). Default: "3" quando existir.

## Mudança aceita (usuário, 3ª iteração)
- **Checkbox "Somente produtos com custo maior que zero"**, marcado por padrão. Filtro no servidor (`custo: { $gt: 0 }`) — payload de ~37% menor.

## Mapeamento de campos
| Coluna | Campo `product_price` |
|--------|----------------------|
| codigo | codprod |
| custo  | custo |
| venda  | pvenda |
| origem | origmerctrib |

## Decisão de negócio (usuário)
- `product_price` tem 2 linhas por produto (uma por `codfilial`: "1" e "3", tenants 1 e 2).
- **Decisão: filtrar apenas `codfilial: "3"`** (1 linha por produto, igual ao relatório de Kit).
- Tenant filter: `idtenant` (convenção desta collection — não `id_tenant` como em `tmp_produto_kit`).

## Checklist
- [x] TS-1: action `getProdutosSimplesRelatorio(codfilial)` (zod, filtro tenant + filial, projection, sort por codprod) + action `getFiliaisProdutosSimples` (distinct codfilial por tenant)
- [x] TS-2: página `/relatorios/produtos-simples` com seletor de filial (shadcn Select) e export Excel (reportToExcel)
- [x] TS-3: menu "Produtos Simples" abaixo de "Produtos Kit"
- [x] TS-4: work-unit commit (build OK)
- [x] TS-5: checkbox custo>0 (default marcado), filtro server-side com zod + query `$gt`

## Verificação / evidência
- `npm run build`: PASS — rota `/relatorios/produtos-simples` presente (3.56 kB).
- `npx next lint`: SKIPPED — ESLint nunca configurado no projeto (wizard interativo de setup); configurar lint foge ao escopo da feature.
- Tipo de dado verificado no Mongo: codfilial é string ("1"/"3"); 46.598 produtos (tenant 1), 92.253 (tenant 2); 2 linhas por produto.
- RDD assess (base-ref main, committed-only): risk **medium** (executable_change), 4 paths / 303 lines, `review_due: false` (**under_budget**). Avaliação de alta-risco inicial falhou por untracked `sync/` (pré-existente do usuário); reavaliado com `--untracked-scope=exclude` + inventário confirmado.
- Sort por `codprod` adicionado (lexicográfico) — melhoria de usabilidade não pedida explicitamente; 46k linhas sem ordem seriam inutilizáveis.

## Rota escolhida
Direct inline (clones mecânicos de um padrão já lido; 3 arquivos pequenos).
