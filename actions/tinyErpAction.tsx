"use server";

import { getConfiguracaoTiny } from "@/actions/configuracaoAction";
import { z } from "zod";
import {
  searchParamsSchema,
  getByIdSchema,
  type TinyErpProduct,
  type TinyErpSearchResult,
  type TinyActionResult,
} from "@/types/TinyErpTypes";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TINY_API_BASE = "https://api.tiny.com.br";

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Recupera o token de acesso à API Tiny ERP para o tenant do usuário logado.
 *
 * A função getConfiguracaoTiny() já faz o isolamento por tenant (consulta
 * a coleção `tenant` filtrando por `user.id_tenant`). Não é necessário
 * chamar getUser() novamente aqui.
 *
 * @returns token string ou null se não configurado
 */
async function getTinyToken(): Promise<string | null> {
  try {
    const config = await getConfiguracaoTiny();
    if (!config || !config.token) {
      return null;
    }
    return config.token;
  } catch {
    return null;
  }
}

/**
 * Helper genérico para chamadas POST à API Tiny ERP v2.
 *
 * Constrói o corpo como URLSearchParams (application/x-www-form-urlencoded),
 * verifica HTTP status e status do retorno, e extrai os dados.
 *
 * @param endpoint  Caminho relativo da API (ex: "/api2/produtos.pesquisa.php")
 * @param params    Parâmetros que serão serializados via URLSearchParams
 * @param dataKey   Chave opcional para extrair um sub-objeto do retorno
 *                  (ex: "produto" para o endpoint de detalhe)
 * @returns         TinyActionResult<T> — nunca lanca exceção
 */
async function callTinyApi<T>(
  endpoint: string,
  params: Record<string, string>,
  dataKey?: string,
): Promise<TinyActionResult<T>> {
  try {
    const body = new URLSearchParams(params).toString();

    const response = await fetch(`${TINY_API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Erro na API Tiny ERP (HTTP ${response.status})`,
        error: response.statusText,
      };
    }

    const json = await response.json();

    if (json.retorno?.status !== "OK") {
      return {
        success: false,
        message: `API retornou status: ${json.retorno?.status ?? "desconhecido"}`,
        error: json.retorno?.status_processamento,
      };
    }

    // Remove campos de status do retorno e extrai o payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status_processamento, status, ...retornoData } = json.retorno;

    const data: T = dataKey
      ? (retornoData as Record<string, unknown>)[dataKey] as T
      : (retornoData as unknown as T);

    return {
      success: true,
      message: "Consulta realizada com sucesso",
      data,
    };
  } catch (e: unknown) {
    return {
      success: false,
      message: "Erro de conexão com a API Tiny ERP",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// ---------------------------------------------------------------------------
// Ações exportadas (Server Actions)
// ---------------------------------------------------------------------------

/**
 * Busca produtos no Tiny ERP por termo de pesquisa textual.
 *
 * A paginação é fixada em 100 itens por página (limite da API Tiny).
 *
 * @param params  { pesquisa: string; pagina?: number }
 * @returns       { success, message, data?: TinyErpSearchResult, error? }
 */
export async function searchTinyProducts(
  params: z.infer<typeof searchParamsSchema>,
): Promise<TinyActionResult<TinyErpSearchResult>> {
  const validated = searchParamsSchema.safeParse(params);
  if (!validated.success) {
    return {
      success: false,
      message: "Parâmetros de busca inválidos",
      error: validated.error.message,
    };
  }

  const token = await getTinyToken();
  if (!token) {
    return {
      success: false,
      message:
        "Token de acesso ao Tiny ERP não configurado para este tenant",
    };
  }

  return callTinyApi<TinyErpSearchResult>("/api2/produtos.pesquisa.php", {
    token,
    pesquisa: validated.data.pesquisa,
    formato: "json",
    pagina: String(validated.data.pagina),
  });
}

/**
 * Obtém um produto específico do Tiny ERP pelo ID numérico.
 *
 * ATENÇÃO: o campo `id` retornado pela API é string (ex: "349112581"),
 * mas a entrada do usuário é validada como number — diferença intencional
 * entre o contrato de entrada e o shape de resposta da Tiny.
 *
 * @param params  { id: number }
 * @returns       { success, message, data?: TinyErpProduct, error? }
 */
export async function getTinyProductById(
  params: z.infer<typeof getByIdSchema>,
): Promise<TinyActionResult<TinyErpProduct>> {
  const validated = getByIdSchema.safeParse(params);
  if (!validated.success) {
    return {
      success: false,
      message: "Parâmetros inválidos",
      error: validated.error.message,
    };
  }

  const token = await getTinyToken();
  if (!token) {
    return {
      success: false,
      message:
        "Token de acesso ao Tiny ERP não configurado para este tenant",
    };
  }

  return callTinyApi<TinyErpProduct>(
    "/api2/produto.obter.php",
    {
      token,
      id: String(validated.data.id),
      formato: "json",
    },
    "produto",
  );
}
