/** Raw product_price document from MongoDB */
export interface ProductPriceDoc {
  codprod: string;
  numregiao: string;
  codfilial?: string;
  idtenant: number;
  pvenda: number;
  ptabela: number;
  vlultentmes: number | null;
  custo?: number;
  custocont?: number;
  /** Data da última entrada — pode ser null */
  dtultent: string | null;
  /** Origem da mercadoria (tributação) */
  origmerctrib: string | null;
}

/** Single kit component with resolved pricing */
export interface FichaTecnicaComponent {
  id_produto: string;
  quantidade: number;
  /** Filial do preço (vem de product_price.codfilial) */
  codfilial: string | null;
  /** Origem da mercadoria (vem de product_price.origmerctrib) */
  origmerctrib: string | null;
  sku: string | null;
  descricao: string | null;
  /** Data da última entrada (vem de product_price.dtultent) */
  dtultent: string | null;
  pvenda: number;
  ptabela: number;
  precoCusto: number;
  custocont: number;
}

/** Main product data with resolved pricing */
export interface FichaTecnicaProductResult {
  id: string;
  nome: string;
  codigo: string;
  sku: string | null;
  descricao: string | null;
  codfilial: string | null;
  unidade: string;
  /** Preço atual no Tiny ERP (sem região — preço base do produto) */
  preco: number;
  pvenda: number;
  ptabela: number;
  precoCusto: number;
  custocont: number;
}

/** Complete ficha técnica result */
export interface FichaTecnicaResult {
  product: FichaTecnicaProductResult;
  components: FichaTecnicaComponent[];
  isKit: boolean;
}
