# Feature Specification: Paginação Fixa e Visível na Listagem de Pedidos

**Feature Branch**: `001-sticky-pagination`  
**Created**: 2026-02-19  
**Status**: Draft  
**Input**: User description: "eu quero fixar a parte de paginacao para que fique visivel, ficando amigavel a paginacao"

## User Scenarios & Testing _(mandatory)_

### User Story 1 – Controles de paginação sempre visíveis durante a rolagem (Priority: P1)

O operador está navegando pela listagem de pedidos que retornou 283 registros (15 páginas de 50 itens). Os botões "Anterior" / "Próxima" e o indicador de página ficam fora da área visível enquanto o usuário rola a tabela. O usuário precisa rolar até o fim da lista para mudar de página, tornando a navegação lenta e frustrante.

Com a melhoria, a barra de paginação deve ficar fixada na parte inferior da tela, permanecendo visível independentemente da posição de rolagem.

**Why this priority**: É o requisito central do pedido. Sem isso, todas as demais melhorias de usabilidade perdem sentido.

**Independent Test**: Abrir a listagem com pelo menos 2 páginas de resultado, rolar a tabela até o meio ou fim — os controles de paginação DEVEM permanecer visíveis na parte inferior da janela o tempo todo.

**Acceptance Scenarios**:

1. **Given** a listagem retornou múltiplas páginas, **When** o usuário rola para baixo na tabela, **Then** a barra de paginação permanece fixada na base da tela sem sobrepor o conteúdo útil.
2. **Given** a listagem retornou apenas uma página, **When** o usuário rola a página, **Then** a barra de paginação ainda aparece de forma consistente na base com botões desabilitados.
3. **Given** o usuário está com a barra fixa visível, **When** clica em "Próxima", **Then** a tabela atualiza para a página seguinte e o scroll volta ao topo da tabela automaticamente.
4. **Given** a barra está fixa, **When** o usuário redimensiona a janela, **Then** a barra continua visível e sem transbordar os limites da tela.

---

### User Story 2 – Indicador de página informativo e legível (Priority: P2)

O operador precisa saber em qual página está, o total de registros e o total de páginas sem ter que rolar até o rodapé.

**Why this priority**: Com a barra fixa (P1), o indicador já estará sempre visível. Esta história garante que o conteúdo da barra seja claro e útil.

**Independent Test**: Com a listagem carregada, verificar que a barra exibe "Página X de Y — N registros" sem ambiguidade.

**Acceptance Scenarios**:

1. **Given** a busca retornou 283 registros em 15 páginas, **When** o usuário está na página 3, **Then** a barra exibe "Página 3 de 15" e "283 registros".
2. **Given** a busca retornou 0 registros, **When** a listagem está vazia, **Then** a barra exibe "0 registros" e os botões estão desabilitados.
3. **Given** a busca retornou resultados de página única (≤ 50 registros), **When** a barra é exibida, **Then** mostra apenas o total de registros de forma não intrusiva.

---

### User Story 3 – Scroll automático ao topo ao mudar de página (Priority: P3)

Ao clicar em "Próxima" ou "Anterior" enquanto a tabela está rolada, o usuário deve ser levado automaticamente ao início da tabela para começar a leitura dos novos dados desde a primeira linha.

**Why this priority**: Melhoria de experiência complementar. Sem ela o usuário vê o rodapé da página anterior antes dos dados novos carregarem.

**Independent Test**: Estando na página 2 com a tabela rolada para baixo, clicar em "Próxima" — a view deve voltar ao topo da tabela imediatamente.

**Acceptance Scenarios**:

1. **Given** o usuário está na página 2 com a tabela rolada até o meio, **When** clica em "Próxima", **Then** a página muda para 3 e a posição de scroll vai para o topo da listagem.
2. **Given** o usuário está na página 1 no topo, **When** clica em "Próxima", **Then** o comportamento é o mesmo sem salto visual perceptível.

---

### Edge Cases

- O que acontece se a consulta retorna exatamente 50 registros (1 página)? → A barra fica visível mas os botões estão desabilitados.
- O que acontece se a barra sobrepor a última linha da tabela em telas pequenas? → A barra deve ter fundo opaco e ficar na camada visual acima do conteúdo para não se misturar com ele.
- O que acontece enquanto uma nova página está carregando? → Os botões ficam desabilitados com indicador visual de loading.
- O que acontece em telas mobile (< 375px)? → Os botões e texto devem reduzir proporcionalmente, mas a barra continua funcional.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A barra de paginação DEVE permanecer visível na parte inferior da área de visualização enquanto o usuário rola a listagem de pedidos, independentemente da quantidade de registros.
- **FR-002**: A barra de paginação DEVE exibir: número da página atual, total de páginas e total de registros encontrados.
- **FR-003**: Os botões "Anterior" e "Próxima" DEVEM estar desabilitados quando não houver página anterior ou seguinte, respectivamente.
- **FR-004**: Os botões "Anterior" e "Próxima" DEVEM estar desabilitados enquanto uma nova página está sendo carregada.
- **FR-005**: Ao navegar para outra página, a posição de scroll da tabela DEVE retornar ao topo automaticamente.
- **FR-006**: A barra de paginação DEVE ter fundo opaco para não se misturar visualmente com o conteúdo da tabela.
- **FR-007**: O layout DEVE ser responsivo, funcionando corretamente em telas desktop (≥ 1024px), tablet (768px–1023px) e mobile (< 768px).

### Key Entities

- **Barra de Paginação**: Componente de UI que exibe os controles de navegação entre páginas e o resumo de resultados.
- **Estado de Paginação**: Página corrente, tamanho de página, total de registros, total de páginas.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: O operador consegue navegar entre páginas sem precisar rolar a tela até o rodapé — ação realizável em menos de 2 cliques a partir de qualquer posição de scroll.
- **SC-002**: A barra de paginação permanece visível em 100% das posições de scroll testadas na listagem (topo, meio e fim de uma lista com 200+ registros).
- **SC-003**: O indicador de página exibe informações corretas em todas as situações: lista vazia, página única e múltiplas páginas.
- **SC-004**: O tempo para o usuário localizar e usar os controles de paginação é inferior a 3 segundos, independentemente do tamanho da lista.
- **SC-005**: O layout não apresenta sobreposição de conteúdo em resoluções de 375px, 768px, 1280px e 1920px de largura.

## Assumptions

- O `PAGE_SIZE` corrente de 50 registros por página é mantido; esta especificação não altera a lógica de busca no servidor.
- A barra ficará ancorada e sempre visível na base da área de visualização, não apenas no rodapé da tabela quando rolada.
- Scroll automático ao topo sem animação é aceitável (salto direto).
- Não está no escopo desta feature a seleção de `pageSize` pelo usuário (10/25/50/100 por página).
