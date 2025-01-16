// Tipos para nossos dados
export type OrderStatusStr =
  | "Em processamento"
  | "Aguardando NFe"
  | "NFe emitida"
  | "Processado com erro";

export const EM_PROCESSAMENTO = 1;
export const AGUARDANDO_NFE = 2;
export const NFE_EMITIDA = 3;
export const ERRO_PROCESSAMENTO = 500;

export const statusOptions = [
  "Em processamento",
  "Aguardando NFe",
  "NFe emitida",
  "Processado com erro",
];

export const statusOptionsMap = {
  "Em processamento": EM_PROCESSAMENTO,
  "Aguardando NFe": AGUARDANDO_NFE,
  "NFe emitida": NFE_EMITIDA,
  "Processado com erro": ERRO_PROCESSAMENTO,
};

export function statusToCodigo(status: OrderStatusStr): number {
  return statusOptionsMap[status];
}

export function statusToString(codigo: number): string {
  switch (codigo) {
    case 1:
      return "Em processamento";
    case 2:
      return "Aguardando NFe";
    case 3:
      return "NFe emitida";
    case 500:
      return "Processado com erro";
    default:
      return "Status desconhecido";
  }
}

export type OrderStatusCodigo = [1, 2, 3, 500];
export type Region = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";

export interface Order {
  id: string;
  numero: string;
  numero_ecommerce: string;
  nome_ecommerce: string;
  date: string;
  status: string;
  value: number;
  region: string;
  nome: string;
  status_processo?: number;
  orderId?: string;
  slug?: any;
}

export interface FiltersOrder {
  numero: string;
  startDate: Date | null;
  endDate: Date | null;
  ecommerceNumber: string;
  orderId: string;
  status?: string;
  nome_cliente?: string;
}
