import { z } from "zod";

// ---------------------------------------------------------------------------
// Tipos aninhados — variações, anexos, imagens externas
// Nomes mantidos conforme a API Tiny ERP (sem tradução / mapeamento)
// ---------------------------------------------------------------------------

export interface TinyErpVariacao {
  id: string;
  codigo: string;
  /** ATENÇÃO: preco é string na API Tiny (ex: "36.3200000000"). NÃO converta para number. */
  preco: string;
  grade: Record<string, string>;
}

export interface TinyErpVariacaoWrapper {
  variacao: TinyErpVariacao;
}

export interface TinyErpAnexo {
  anexo: string;
}

export interface TinyErpImagemExterna {
  url: string;
}

export interface TinyErpImagemExternaWrapper {
  imagem_externa: TinyErpImagemExterna;
}

// ---------------------------------------------------------------------------
// Produto Tiny ERP — todos os campos do retorno real da API v2
// ---------------------------------------------------------------------------

export interface TinyErpKitItem {
  item: {
    id_produto: string;
    quantidade: number;
  };
}

export interface TinyErpProduct {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  preco: number;
  preco_promocional: number;
  ncm: string;
  origem: string;
  gtin: string;
  gtin_embalagem: string;
  localizacao: string;
  peso_liquido: number;
  peso_bruto: number;
  estoque_minimo: number;
  estoque_maximo: number;
  id_fornecedor: number;
  codigo_fornecedor: string;
  codigo_pelo_fornecedor: string;
  unidade_por_caixa: string;
  preco_custo: number;
  preco_custo_medio: number;
  situacao: string;
  tipo: string;
  classe_ipi: string;
  valor_ipi_fixo: string;
  cod_lista_servicos: string;
  descricao_complementar: string;
  obs: string;
  garantia: string;
  cest: string;
  tipoVariacao: string;
  variacoes: TinyErpVariacaoWrapper[];
  idProdutoPai: string;
  sob_encomenda: string;
  marca: string;
  tipoEmbalagem: string;
  alturaEmbalagem: string;
  comprimentoEmbalagem: string;
  larguraEmbalagem: string;
  diametroEmbalagem: string;
  categoria: string;
  anexos: TinyErpAnexo[];
  imagens_externas: TinyErpImagemExternaWrapper[];
  classe_produto: string;
  kit?: TinyErpKitItem[];
}

// ---------------------------------------------------------------------------
// Resultado de busca paginada
// ---------------------------------------------------------------------------

export interface TinyErpSearchResult {
  produtos: TinyErpProduct[];
  pagina: number;
  numero_paginas: number;
}

// ---------------------------------------------------------------------------
// Wrapper genérico para resposta da API Tiny ERP
// T = payload sem os campos de status (status_processamento, status)
// ---------------------------------------------------------------------------

export type TinyApiResponse<T> = {
  retorno: {
    status_processamento: string;
    status: string;
  } & T;
};

// ---------------------------------------------------------------------------
// Tipo de retorno padrão das Server Actions (Constitution Principle I)
// ---------------------------------------------------------------------------

export type TinyActionResult<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

// ---------------------------------------------------------------------------
// Schemas Zod para validação de entrada
// ---------------------------------------------------------------------------

export const searchParamsSchema = z.object({
  pesquisa: z.string().min(1, "Termo de pesquisa é obrigatório"),
  pagina: z.number().int().min(1).optional().default(1),
});

export const getByIdSchema = z.object({
  id: z.number().int().positive("ID do produto é obrigatório"),
});
