"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { z } from "zod";
import type { Product, ProductFilters, PaginatedProductResult } from "@/types/ProductTypes";

const getProductsSchema = z.object({
  descricao: z.string().optional(),
  sku: z.string().optional(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
});

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ponytail: fixed filial for provisional stock lookup; parametrize when needed
const DEFAULT_CODFILIAL = "3";

export async function getProducts(
  filters: ProductFilters
): Promise<PaginatedProductResult> {
  const validated = getProductsSchema.safeParse(filters);
  if (!validated.success) {
    return {
      data: [],
      total: 0,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: 0,
    };
  }

  const { descricao, sku, page, pageSize } = validated.data;

  const user: any = await getUser();
  const idtenant = user.empresa;

  const conditions: Record<string, any>[] = [];

  if (descricao && descricao.trim()) {
    conditions.push({
      descricao: { $regex: escapeRegex(descricao.trim()), $options: "i" },
    });
  }

  if (sku && sku.trim()) {
    conditions.push({
      sku: { $regex: escapeRegex(sku.trim()), $options: "i" },
    });
  }

  const query: Record<string, any> = { idtenant };

  if (conditions.length > 0) {
    query.$and = conditions;
  }

  const limit = pageSize;
  const skip = (page - 1) * pageSize;

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const collection = clientdb.collection("product");

    const [count, rows] = await Promise.all([
      collection.countDocuments(query),
      collection
        .find(query)
        .sort({ descricao: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    // Batch stock lookup for the current page.
    // product_stock.productId references product.sku (verified against live data),
    // not product.id.
    const skus = rows.map((doc: any) => String(doc.sku)).filter(Boolean);
    const stockMap = new Map<string, number>();
    if (skus.length > 0) {
      const stockRows = await clientdb
        .collection("product_stock")
        .find(
          {
            idtenant,
            productId: { $in: skus },
            codfilial: DEFAULT_CODFILIAL,
          },
          { projection: { _id: 0, productId: 1, quantity: 1 } }
        )
        .toArray();
      for (const s of stockRows) {
        stockMap.set(String(s.productId), s.quantity ?? 0);
      }
    }

    const products: Product[] = rows.map((doc: any) => ({
      id: doc.id,
      idtenant: doc.idtenant,
      descricao: doc.descricao,
      sku: doc.sku,
      numregiao: doc.numregiao ?? null,
      gtin: doc.gtin ?? null,
      preco: doc.preco ?? 0,
      preco_custo: doc.preco_custo ?? null,
      preco_custo_medio: doc.preco_custo_medio ?? null,
      preco_promocional: doc.preco_promocional ?? null,
      unidade: doc.unidade,
      estoque: stockMap.get(String(doc.sku)) ?? null,
    }));

    return {
      data: products,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
