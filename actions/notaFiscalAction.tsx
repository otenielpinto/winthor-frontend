"use server";

import { getUser } from "@/hooks/useUser";
import { getConfiguracaoTotvs } from "@/actions/configuracaoAction";
import {
  getWinthorToken,
  invalidateWinthorToken,
} from "@/actions/winthorAuthAction";
import { base64ToXml } from "@/lib/xmlUtils";

type InvoiceXmlResult = {
  success: boolean;
  message: string;
  data?: {
    invoiceXml: string; // base64 encoded XML
    xmlContent: string; // decoded XML string
  };
  error?: string;
};

/**
 * Busca o XML da nota fiscal (NF-e) de um pedido via API Winthor Fiscal.
 * O host e port são lidos da configuração da empresa do usuário logado.
 *
 * Endpoint: GET /winthor/fiscal/v1/documentosfiscais/nfe/invoiceDocument
 *   ?orderId={orderId}&returnBase64=true
 *
 * @param orderId - Número do pedido no Winthor
 */
export async function getInvoiceXml(
  orderId: string | number,
): Promise<InvoiceXmlResult> {
  try {
    if (!orderId) {
      return {
        success: false,
        message: "orderId é obrigatório",
        error: "orderId ausente",
      };
    }

    const user = await getUser();
    if (!user || !user.id_tenant) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem tenant vinculado",
        error: "Usuário inválido",
      };
    }

    const config = await getConfiguracaoTotvs();

    if (!config) {
      return {
        success: false,
        message: "Configuração TOTVS não encontrada para o tenant",
        error: "Registro de tenant ausente",
      };
    }

    const host = config.totvs_host;
    const port = config.totvs_port;

    if (!host || !port) {
      return {
        success: false,
        message:
          "Configuração de servidor TOTVS incompleta (totvs_host / totvs_port)",
        error: "totvs_host ou totvs_port não configurado no tenant",
      };
    }

    const authResult = await getWinthorToken();
    if (!authResult.success || !authResult.token) {
      return {
        success: false,
        message: authResult.message,
        error: authResult.error,
      };
    }

    const url = `http://${host}:${port}/winthor/fiscal/v1/documentosfiscais/nfe/invoiceDocument?orderId=${orderId}&returnBase64=true`;

    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${authResult.token}`,
      },
    });

    // Token expirado antes do esperado — invalida cache e tenta uma vez mais
    if (response.status === 401 || response.status === 403) {
      await invalidateWinthorToken();
      const retryAuth = await getWinthorToken();
      if (!retryAuth.success || !retryAuth.token) {
        return {
          success: false,
          message: "Falha ao renovar token Winthor",
          error: retryAuth.error,
        };
      }
      response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${retryAuth.token}`,
        },
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        message: `Erro ao buscar XML da nota fiscal (HTTP ${response.status})`,
        error: errorText || response.statusText,
      };
    }

    const json = await response.json();
    const invoiceXml: string = json?.invoiceXml ?? "";

    if (!invoiceXml) {
      return {
        success: false,
        message: "XML da nota fiscal não encontrado na resposta",
        error: "Campo invoiceXml ausente ou vazio",
      };
    }

    const xmlContent = base64ToXml(invoiceXml);

    return {
      success: true,
      message: "XML da nota fiscal obtido com sucesso",
      data: {
        invoiceXml,
        xmlContent,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Erro inesperado ao buscar XML da nota fiscal",
      error: error?.message ?? String(error),
    };
  }
}
