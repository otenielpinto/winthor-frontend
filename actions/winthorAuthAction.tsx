"use server";

import { getConfiguracaoTotvs } from "@/actions/configuracaoAction";
import { getUser } from "@/hooks/useUser";

// ---------------------------------------------------------------------------
// Cache em memória — persiste durante o ciclo de vida do processo Node.js.
// Chave: id_tenant (string) → valor: { token, expiresAt }
// ---------------------------------------------------------------------------
type TokenCache = {
  token: string;
  expiresAt: number; // timestamp ms
};

const TOKEN_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas em milissegundos
const tokenCache = new Map<string, TokenCache>();

type WinthorAuthResult = {
  success: boolean;
  message: string;
  token?: string;
  error?: string;
};

/**
 * Retorna um token de autenticação válido para a API Winthor.
 *
 * O token é cacheado em memória por 6 horas por tenant.
 * Se o token ainda for válido ele é retornado diretamente sem nova requisição.
 *
 * Endpoint: POST /winthor/autenticacao/v1/login
 * Body:     { login: string, senha: string }
 *
 * Credenciais e endereço são lidos via getConfiguracaoTotvs() (coleção tenant).
 */
export async function getWinthorToken(): Promise<WinthorAuthResult> {
  try {
    const user = await getUser();
    if (!user || !user.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant vinculado",
        error: "Usuário inválido",
      };
    }

    const tenantKey = String(user.id_tenant);

    // ── Verifica cache ──────────────────────────────────────────────────────
    const cached = tokenCache.get(tenantKey);
    if (cached && Date.now() < cached.expiresAt) {
      return {
        success: true,
        message: "Token recuperado do cache",
        token: cached.token,
      };
    }

    // ── Busca configuração TOTVS ────────────────────────────────────────────
    const config = await getConfiguracaoTotvs();

    if (!config) {
      return {
        success: false,
        message: "Configuração TOTVS não encontrada para o tenant",
        error: "Registro de tenant ausente",
      };
    }

    const { totvs_host, totvs_port, totvs_login, totvs_usuario } = config;

    if (!totvs_host || !totvs_port) {
      return {
        success: false,
        message: "Configuração incompleta: totvs_host / totvs_port ausentes",
        error: "totvs_host ou totvs_port não configurado",
      };
    }

    if (!totvs_login || !totvs_usuario) {
      return {
        success: false,
        message:
          "Configuração incompleta: totvs_login / totvs_usuario ausentes",
        error: "Credenciais TOTVS não configuradas",
      };
    }

    // ── Requisição de autenticação ──────────────────────────────────────────
    const url = `http://${totvs_host}:${totvs_port}/winthor/autenticacao/v1/login`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        login: totvs_usuario,
        senha: totvs_login,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        message: `Falha na autenticação Winthor (HTTP ${response.status})`,
        error: errorText || response.statusText,
      };
    }

    const json = await response.json();

    // A API Winthor retorna o token no campo accessToken.
    const token: string = json?.accessToken ?? null;

    if (!token) {
      return {
        success: false,
        message: `Token não encontrado na resposta da API Winthor. Campos recebidos: ${Object.keys(json ?? {}).join(", ") || "(vazio)"}`,
        error: `Resposta recebida: ${JSON.stringify(json)}`,
      };
    }

    // ── Armazena no cache ───────────────────────────────────────────────────
    tokenCache.set(tenantKey, {
      token,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });

    return {
      success: true,
      message: "Token obtido com sucesso",
      token,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Erro inesperado ao autenticar com Winthor",
      error: error?.message ?? String(error),
    };
  }
}

/**
 * Invalida o token em cache para o tenant do usuário logado.
 * Útil para forçar um novo login após erro 401/403 na API.
 */
export async function invalidateWinthorToken(): Promise<void> {
  const user = await getUser();
  if (user?.id_tenant) {
    tokenCache.delete(String(user.id_tenant));
  }
}
