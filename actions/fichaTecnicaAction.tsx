"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { getRegiaoPreco } from "@/actions/configuracaoAction";
import { getTinyProductById } from "@/actions/tinyErpAction";
import type {
  ProductPriceDoc,
  FichaTecnicaComponent,
  FichaTecnicaProductResult,
  FichaTecnicaResult,
} from "@/types/FichaTecnicaTypes";

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Redondea a 2 casas decimais para evitar imprecisão de ponto flutuante */
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getPrecoCusto(payload: ProductPriceDoc | null | undefined): number {
  // O campo "custo" define o preço de custo do produto no WinThor
  return round2(Number(payload?.custo ?? 0));
}

/**
 * Normaliza o campo dtultent que vem do MongoDB.
 * Pode vir como string ISO, Date object, number (timestamp) ou inexistente.
 * Sempre retorna string ISO ou null.
 */
function normalizeDtUltEnt(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === "number" && raw > 0) return new Date(raw).toISOString();
  return null;
}

// ---------------------------------------------------------------------------
// Main Server Action
// ---------------------------------------------------------------------------

type ActionResult = {
  success: boolean;
  message: string;
  data?: FichaTecnicaResult;
};

export async function getFichaTecnicaProduto(
  productId: number,
): Promise<ActionResult> {
  // 1. Validate input
  if (!Number.isInteger(productId) || productId <= 0) {
    return { success: false, message: "Invalid product ID" };
  }

  // 2. Auth
  const user = await getUser();
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  // 3. Region resolution
  const regiao = await getRegiaoPreco();
  if (!regiao) {
    return { success: false, message: "Região de preço não configurada" };
  }

  // 4. Tiny ERP product lookup
  const tinyResult = await getTinyProductById({ id: productId });
  if (!tinyResult.success || !tinyResult.data) {
    return { success: false, message: tinyResult.message };
  }
  const tinyProduct = tinyResult.data;

  // 5. MongoDB connection
  const { client, clientdb } = await TMongo.connectToDatabase();
  const idtenant = Number(user.empresa);

  try {
    // 6. Check if kit product
    const isKit = !!(tinyProduct.kit && tinyProduct.kit.length > 0);

    if (isKit) {
      // --- KIT PATH ---

      // 6a. Extract kit component IDs
      const kitItems = tinyProduct.kit!.map((k) => k.item);
      const componentIds = kitItems.map((item) => item.id_produto);

      // 6b. Batch product lookup
      const products = await clientdb
        .collection("product")
        .find({ id: { $in: componentIds }, idtenant })
        .toArray();

      const productMap = new Map<string, any>();
      for (const p of products) {
        productMap.set(p.id, p);
      }

      // 6c. Collect SKUs (skip nulls)
      const skus: string[] = [];
      for (const [id, p] of productMap) {
        if (p.sku) skus.push(p.sku);
      }

      // 6d. Batch price lookup
      const priceQuery: Record<string, any> = {
        codprod: { $in: skus },
        numregiao: regiao.price_codregiao,
        idtenant,
      };

      //pegar o preco de venda da desse campo
      if (regiao.codfilial) {
        priceQuery.codfilial = regiao.codfilial;
      }

      const prices =
        skus.length > 0
          ? await clientdb
              .collection("product_price")
              .find(priceQuery)
              .toArray()
          : [];

      const priceMap = new Map<string, ProductPriceDoc>();
      for (const p of prices) {
        priceMap.set(p.codprod, p as unknown as ProductPriceDoc);
      }

      // 6e. Map each kit item to FichaTecnicaComponent
      const components: FichaTecnicaComponent[] = kitItems.map((item) => {
        const productDoc = productMap.get(item.id_produto);
        const sku = productDoc?.sku ?? null;
        const priceDoc = sku ? (priceMap.get(sku) ?? null) : null;

        return {
          id_produto: item.id_produto,
          quantidade: item.quantidade,
          codfilial: priceDoc?.codfilial ?? null,
          origmerctrib: priceDoc?.origmerctrib ?? null,
          sku,
          descricao: productDoc?.descricao ?? null,
          dtultent: normalizeDtUltEnt(priceDoc?.dtultent),
          pvenda: round2(priceDoc?.pvenda ?? 0),
          ptabela: round2(priceDoc?.ptabela ?? 0),
          precoCusto: round2(getPrecoCusto(priceDoc)),
          custocont: round2(priceDoc?.custocont ?? 0),
        };
      });

      // 6f. Build product result for kit product
      const mainPriceDoc =
        skus.length > 0 ? prices.find((p) => p.codprod === skus[0]) : null;
      const mainProduct: FichaTecnicaProductResult = {
        id: tinyProduct.id,
        nome: tinyProduct.nome,
        codigo: tinyProduct.codigo,
        sku: null,
        descricao: null,
        codfilial: (mainPriceDoc as any)?.codfilial ?? "",
        unidade: tinyProduct.unidade,
        preco: round2(tinyProduct.preco ?? 0),
        pvenda: round2((mainPriceDoc as any)?.pvenda ?? 0),
        ptabela: round2((mainPriceDoc as any)?.ptabela ?? 0),
        precoCusto: round2(getPrecoCusto(mainPriceDoc as any)),
        custocont: round2((mainPriceDoc as any)?.custocont ?? 0),
      };

      return {
        success: true,
        message: "Ficha técnica retrieved successfully",
        data: { product: mainProduct, components, isKit: true },
      };
    } else {
      // --- SIMPLE PRODUCT PATH ---

      // Lookup local product
      const productDoc = await clientdb
        .collection("product")
        .findOne({ id: String(tinyProduct.id), idtenant });

      const sku = productDoc?.sku ?? null;

      // Lookup price
      const priceQuery: Record<string, any> = {
        codprod: sku,
        numregiao: regiao.price_codregiao,
        idtenant,
      };
      if (regiao.codfilial) {
        priceQuery.codfilial = regiao.codfilial;
      }

      const priceDoc = sku
        ? await clientdb.collection("product_price").findOne(priceQuery)
        : null;

      const product: FichaTecnicaProductResult = {
        id: tinyProduct.id,
        nome: tinyProduct.nome,
        codigo: tinyProduct.codigo,
        sku,
        descricao: productDoc?.descricao ?? null,
        codfilial: (priceDoc as any)?.codfilial ?? "",
        unidade: tinyProduct.unidade,
        preco: round2(tinyProduct.preco ?? 0),
        pvenda: round2((priceDoc as any)?.pvenda ?? 0),
        ptabela: round2((priceDoc as any)?.ptabela ?? 0),
        precoCusto: round2(getPrecoCusto(priceDoc as any)),
        custocont: round2((priceDoc as any)?.custocont ?? 0),
      };

      // Build component with same structure as kit components
      const component: FichaTecnicaComponent = {
        id_produto: tinyProduct.id,
        quantidade: 1,
        codfilial: (priceDoc as any)?.codfilial ?? null,
        origmerctrib: (priceDoc as any)?.origmerctrib ?? null,
        sku,
        descricao: productDoc?.descricao ?? null,
        dtultent: normalizeDtUltEnt((priceDoc as any)?.dtultent),
        pvenda: round2((priceDoc as any)?.pvenda ?? 0),
        ptabela: round2((priceDoc as any)?.ptabela ?? 0),
        precoCusto: round2(getPrecoCusto(priceDoc as any)),
        custocont: round2((priceDoc as any)?.custocont ?? 0),
      };

      return {
        success: true,
        message: "Ficha técnica retrieved successfully",
        data: { product, components: [component], isKit: false },
      };
    }
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
