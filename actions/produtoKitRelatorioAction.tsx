"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

const COLLECTION = "tmp_produto_kit";

export interface ProdutoKitRelatorioItem {
  codigo: string;
  custo_total_kit: number;
  venda_total_kit: number;
  origem_kit: string;
}

export interface ProdutoKitRelatorioResult {
  success: boolean;
  message: string;
  data?: ProdutoKitRelatorioItem[];
}

export async function getProdutosKitRelatorio(): Promise<ProdutoKitRelatorioResult> {
  const user = await getUser();

  if (!user?.id_tenant) {
    return { success: false, message: "Usuário não autenticado" };
  }

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const rows = await clientdb
      .collection(COLLECTION)
      .find(
        { id_tenant: user.id_tenant },
        {
          projection: {
            _id: 0,
            codigo: 1,
            custo_total_kit: 1,
            venda_total_kit: 1,
            origem_kit: 1,
          },
        }
      )
      .toArray();

    if (rows.length === 0) {
      return { success: false, message: "Nenhum produto kit encontrado" };
    }

    return {
      success: true,
      message: `${rows.length} produtos encontrados`,
      data: rows as unknown as ProdutoKitRelatorioItem[],
    };
  } catch (error) {
    console.error("Erro ao buscar produtos kit:", error);
    return { success: false, message: "Erro ao buscar produtos kit" };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
