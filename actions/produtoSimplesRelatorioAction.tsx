"use server";

import { z } from "zod";
import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

const COLLECTION = "product_price";

const codfilialSchema = z.string().trim().min(1, "Filial é obrigatória");

export interface ProdutoSimplesRelatorioItem {
  codprod: string;
  custo: number;
  pvenda: number;
  origmerctrib: string;
}

export interface ProdutoSimplesRelatorioResult {
  success: boolean;
  message: string;
  data?: ProdutoSimplesRelatorioItem[];
}

export async function getFiliaisProdutosSimples(): Promise<{
  success: boolean;
  message: string;
  data?: string[];
}> {
  const user = await getUser();

  if (!user?.id_tenant) {
    return { success: false, message: "Usuário não autenticado" };
  }

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const filiais = await clientdb
      .collection(COLLECTION)
      .distinct("codfilial", { idtenant: user.id_tenant });

    if (filiais.length === 0) {
      return { success: false, message: "Nenhuma filial encontrada" };
    }

    return {
      success: true,
      message: `${filiais.length} filiais encontradas`,
      data: filiais.sort(),
    };
  } catch (error) {
    console.error("Erro ao buscar filiais:", error);
    return { success: false, message: "Erro ao buscar filiais" };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

export async function getProdutosSimplesRelatorio(
  codfilial: string
): Promise<ProdutoSimplesRelatorioResult> {
  const user = await getUser();

  if (!user?.id_tenant) {
    return { success: false, message: "Usuário não autenticado" };
  }

  const parsed = codfilialSchema.safeParse(codfilial);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Filial inválida",
    };
  }

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const rows = await clientdb
      .collection(COLLECTION)
      .find(
        { idtenant: user.id_tenant, codfilial: parsed.data },
        {
          projection: {
            _id: 0,
            codprod: 1,
            custo: 1,
            pvenda: 1,
            origmerctrib: 1,
          },
        }
      )
      .sort({ codprod: 1 })
      .toArray();

    if (rows.length === 0) {
      return { success: false, message: "Nenhum produto encontrado" };
    }

    return {
      success: true,
      message: `${rows.length} produtos encontrados`,
      data: rows as unknown as ProdutoSimplesRelatorioItem[],
    };
  } catch (error) {
    console.error("Erro ao buscar produtos simples:", error);
    return { success: false, message: "Erro ao buscar produtos simples" };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
