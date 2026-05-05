export interface Product {
  id: string;
  idtenant: number;
  descricao: string;
  sku: string;
  numregiao: string | null;
  gtin: string | null;
  preco: number;
  preco_custo: number | null;
  preco_custo_medio: number | null;
  preco_promocional: number | null;
  unidade: string;
}

export interface ProductFilters {
  descricao?: string;
  sku?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedProductResult {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
