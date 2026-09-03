"use server";

import { z } from "zod";
import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

const COLLECTION = "product_price";

const estoqueWmsInputSchema = z.object({
  codfilial: z
    .string()
    .trim()
    .regex(/^\d*$/, "Código filial deve conter apenas números")
    .max(20, "Código filial muito longo")
    .optional(),
  codprod: z
    .string()
    .trim()
    .regex(/^\d*$/, "Código produto deve conter apenas números")
    .max(20, "Código produto muito longo")
    .optional(),
});

export interface EstoqueWmsRow {
  codfilial: string;
  codprod: string;
  unidade: string;
  descricao: string;
  disponivel: number;
  danificado: number;
  truncado: number;
  alocado: number;
  valorTotal: number;
}

export interface EstoqueWmsResult {
  success: boolean;
  message: string;
  data?: EstoqueWmsRow[];
}

interface ProductPriceDoc {
  codfilial?: string;
  codprod?: string;
  qtest?: number;
  custo?: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function getEstoqueWms(input: {
  codfilial?: string;
  codprod?: string;
}): Promise<EstoqueWmsResult> {
  const parsed = estoqueWmsInputSchema.safeParse(input ?? {});

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message ?? "Dados inválidos",
    };
  }

  const user = await getUser();
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const idtenant = Number(user.empresa);

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const filter: {
      idtenant: number;
      qtest: { $gt: number };
      codfilial?: string;
      codprod?: string;
    } = {
      idtenant,
      qtest: { $gt: 0 },
    };

    if (parsed.data.codfilial) {
      filter.codfilial = parsed.data.codfilial;
    }
    if (parsed.data.codprod) {
      filter.codprod = parsed.data.codprod;
    }

    const docs = await clientdb
      .collection(COLLECTION)
      .find(filter, {
        projection: { _id: 0, codfilial: 1, codprod: 1, qtest: 1, custo: 1 },
      })
      .sort({ codprod: 1 })
      .toArray();

    if (docs.length === 0) {
      return {
        success: false,
        message: "Nenhum produto com estoque encontrado",
      };
    }

    // Lookup product info (descricao, unidade) — product.sku is the join key
    // to product_price.codprod. Map keeps the lookup O(1) per row.
    const skus = [
      ...new Set(
        docs
          .map(
            (doc) =>
              String((doc as unknown as ProductPriceDoc).codprod ?? "").trim()
          )
          .filter(Boolean)
      ),
    ];

    const productMap = new Map<string, { descricao: string; unidade: string }>();
    if (skus.length > 0) {
      const products = await clientdb
        .collection("product")
        .find(
          { sku: { $in: skus }, idtenant },
          { projection: { _id: 0, sku: 1, descricao: 1, unidade: 1 } }
        )
        .toArray();

      for (const p of products) {
        productMap.set(String(p.sku ?? ""), {
          descricao: String(p.descricao ?? ""),
          unidade: String(p.unidade ?? ""),
        });
      }
    }

    const rows: EstoqueWmsRow[] = docs.map((doc) => {
      const d = doc as unknown as ProductPriceDoc;
      const qtest = Number(d.qtest ?? 0);
      const custo = Number(d.custo ?? 0);
      const info = productMap.get(String(d.codprod ?? "").trim());

      return {
        codfilial: String(d.codfilial ?? ""),
        codprod: String(d.codprod ?? ""),
        unidade: info?.unidade ?? "",
        descricao: info?.descricao ?? "",
        disponivel: qtest,
        danificado: 0,
        truncado: 0,
        alocado: 0,
        valorTotal: round2(qtest * custo),
      };
    });

    return {
      success: true,
      message: `${rows.length} produtos encontrados`,
      data: rows,
    };
  } catch (error) {
    console.error("Erro ao buscar estoque WMS:", error);
    return { success: false, message: "Erro ao buscar estoque WMS" };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
