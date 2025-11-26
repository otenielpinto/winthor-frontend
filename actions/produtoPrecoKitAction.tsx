"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for validating product price kit data
const produtoPrecoKitSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z.number().min(0, "Valor deve ser maior ou igual a zero"),
  user_upd: z.string().optional().default(""),
  ativo: z.boolean().optional().default(true),
  id_tenant: z.number().optional(),
});

type ProdutoPrecoKitItem = {
  _id?: string;
  id?: string;
  id_tenant: number;
  codigo: string;
  createdat?: Date;
  descricao: string;
  valor: number;
  user_upd: string;
  ativo: boolean;
  updatedat?: Date;
};

type ActionResult = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Get all product price kits for a specific tenant
 */
export async function getProdutoPrecoKit(
  id_tenant?: number
): Promise<ProdutoPrecoKitItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_preco_kit")
      .find({ id_tenant: tenantId })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as ProdutoPrecoKitItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get a specific product price kit by ID
 */
export async function getProdutoPrecoKitById(
  id: string
): Promise<ProdutoPrecoKitItem | null> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const item = await clientdb
      .collection("tmp_produto_preco_kit")
      .findOne({ id: id });

    if (!item) return null;

    return {
      ...item,
      _id: item._id.toString(),
    } as ProdutoPrecoKitItem;
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get product price kits by code
 */
export async function getProdutoPrecoKitByCodigo(
  codigo: string,
  id_tenant?: number
): Promise<ProdutoPrecoKitItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_preco_kit")
      .find({
        codigo: codigo,
        id_tenant: tenantId,
      })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as ProdutoPrecoKitItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Create a new product price kit
 */
export async function createProdutoPrecoKit(
  formData: FormData
): Promise<ActionResult> {
  try {
    const validatedFields = produtoPrecoKitSchema.safeParse({
      codigo: formData.get("codigo"),
      descricao: formData.get("descricao"),
      valor: parseFloat(formData.get("valor") as string) || 0,
      user_upd: formData.get("user_upd") || "",
      ativo: formData.get("ativo") === "true",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Dados inválidos",
        error: validatedFields.error.errors[0].message,
      };
    }

    const user = await getUser();
    if (!user) {
      return {
        success: false,
        message: "Usuário não autenticado",
        error: "AUTH_REQUIRED",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const now = new Date();

      // Check if product with same codigo and id_tenant already exists
      const existingItem = await clientdb
        .collection("tmp_produto_preco_kit")
        .findOne({
          codigo: validatedFields.data.codigo,
          id_tenant: user?.id_tenant,
        });

      // If exists, update the price instead of creating new
      if (existingItem) {
        const updateResult = await clientdb
          .collection("tmp_produto_preco_kit")
          .updateOne(
            { _id: existingItem._id },
            {
              $set: {
                valor: validatedFields.data.valor,
                descricao: validatedFields.data.descricao,
                ativo: validatedFields.data.ativo,
                updatedat: now,
                user_upd: user?.name || validatedFields.data.user_upd,
              },
            }
          );

        revalidatePath("/produto-preco-kit");

        return {
          success: true,
          message: "Preço atualizado com sucesso (código já existente)",
          data: {
            ...existingItem,
            valor: validatedFields.data.valor,
            descricao: validatedFields.data.descricao,
            ativo: validatedFields.data.ativo,
            updatedat: now,
            user_upd: user?.name || validatedFields.data.user_upd,
            _id: existingItem._id.toString(),
          },
        };
      }

      // If not exists, create new item
      const newId = Date.now().toString() + "-" + validatedFields.data.codigo;

      const newItem = {
        id: newId,
        id_tenant: user?.id_tenant,
        createdat: now,
        updatedat: now,
        ...validatedFields.data,
        user_upd: user?.name || validatedFields.data.user_upd,
      };

      const result = await clientdb
        .collection("tmp_produto_preco_kit")
        .insertOne(newItem);

      revalidatePath("/produto-preco-kit");

      return {
        success: true,
        message: "Preço kit criado com sucesso",
        data: { ...newItem, _id: result.insertedId.toString() },
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error creating produto preco kit:", error);
    return {
      success: false,
      message: "Erro ao criar preço kit",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing product price kit
 */
export async function updateProdutoPrecoKit(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const validatedFields = produtoPrecoKitSchema.safeParse({
      codigo: formData.get("codigo"),
      descricao: formData.get("descricao"),
      valor: parseFloat(formData.get("valor") as string) || 0,
      user_upd: formData.get("user_upd") || "",
      ativo: formData.get("ativo") === "true",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Dados inválidos",
        error: validatedFields.error.errors[0].message,
      };
    }

    const user = await getUser();

    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const updateData = {
        ...validatedFields.data,
        user_upd: user?.name || validatedFields.data.user_upd,
        updatedat: new Date(),
      };

      const result = await clientdb
        .collection("tmp_produto_preco_kit")
        .updateOne({ id: id }, { $set: updateData });

      revalidatePath("/produto-preco-kit");

      if (result.matchedCount === 0) {
        return {
          success: false,
          message: "Preço kit não encontrado",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Preço kit atualizado com sucesso",
        data: updateData,
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error updating produto preco kit:", error);
    return {
      success: false,
      message: "Erro ao atualizar preço kit",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a product price kit
 */
export async function deleteProdutoPrecoKit(id: string): Promise<ActionResult> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const result = await clientdb
        .collection("tmp_produto_preco_kit")
        .deleteOne({ id: id });

      revalidatePath("/produto-preco-kit");

      if (result.deletedCount === 0) {
        return {
          success: false,
          message: "Preço kit não encontrado",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Preço kit removido com sucesso",
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error deleting produto preco kit:", error);
    return {
      success: false,
      message: "Erro ao remover preço kit",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search product price kits by description, code, or product ID
 */
export async function searchProdutoPrecoKit(
  searchTerm: string,
  id_tenant?: number
): Promise<ProdutoPrecoKitItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_preco_kit")
      .find({
        id_tenant: tenantId,
        $or: [
          { descricao: { $regex: searchTerm, $options: "i" } },
          { codigo: { $regex: searchTerm, $options: "i" } },
        ],
      })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as ProdutoPrecoKitItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get product price kit statistics
 */
export async function getProdutoPrecoKitStats(id_tenant?: number) {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const stats = await clientdb
      .collection("tmp_produto_preco_kit")
      .aggregate([
        { $match: { id_tenant: tenantId } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            activeItems: {
              $sum: { $cond: [{ $eq: ["$ativo", true] }, 1, 0] },
            },
            inactiveItems: {
              $sum: { $cond: [{ $eq: ["$ativo", false] }, 1, 0] },
            },
            totalValor: { $sum: "$valor" },
            avgValor: { $avg: "$valor" },
          },
        },
      ])
      .toArray();

    return {
      totalItems: stats[0]?.totalItems || 0,
      activeItems: stats[0]?.activeItems || 0,
      inactiveItems: stats[0]?.inactiveItems || 0,
      totalValor: stats[0]?.totalValor || 0,
      avgValor: stats[0]?.avgValor || 0,
    };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get product price kits with filters
 */
export async function getProdutoPrecoKitWithFilters(filters: {
  startDate?: Date | null;
  endDate?: Date | null;
  descricao?: string;
  codigo?: string;
  valorMin?: number;
  valorMax?: number;
  user_upd?: string;
  ativo?: boolean;
  id_tenant?: number;
}): Promise<ProdutoPrecoKitItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = filters.id_tenant || user?.id_tenant;

    // Build query object
    const query: any = {
      id_tenant: tenantId,
    };

    // Add date range filter if provided
    if (filters.startDate && filters.endDate) {
      query.createdat = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    // Add active/inactive filter
    if (typeof filters.ativo === "boolean") {
      query.ativo = filters.ativo;
    }

    // Add valor range filter
    if (filters.valorMin !== undefined || filters.valorMax !== undefined) {
      query.valor = {};
      if (filters.valorMin !== undefined) {
        query.valor.$gte = filters.valorMin;
      }
      if (filters.valorMax !== undefined) {
        query.valor.$lte = filters.valorMax;
      }
    }

    // Add user_upd filter
    if (filters.user_upd) {
      query.user_upd = { $regex: filters.user_upd, $options: "i" };
    }

    // Add search filters
    const searchFilters = [];

    if (filters.descricao) {
      searchFilters.push({
        descricao: { $regex: filters.descricao, $options: "i" },
      });
    }

    if (filters.codigo) {
      searchFilters.push({
        codigo: { $regex: filters.codigo, $options: "i" },
      });
    }

    if (searchFilters.length > 0) {
      query.$or = searchFilters;
    }

    const items = await clientdb
      .collection("tmp_produto_preco_kit")
      .find(query)
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as ProdutoPrecoKitItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Toggle product price kit active status
 */
export async function toggleProdutoPrecoKitStatus(
  id: string
): Promise<ActionResult> {
  try {
    const user = await getUser();
    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      // First get the current item
      const currentItem = await clientdb
        .collection("tmp_produto_preco_kit")
        .findOne({ id: id });

      if (!currentItem) {
        return {
          success: false,
          message: "Preço kit não encontrado",
          error: "NOT_FOUND",
        };
      }

      // Toggle the active status
      const newStatus = !currentItem.ativo;

      const result = await clientdb
        .collection("tmp_produto_preco_kit")
        .updateOne(
          { id: id },
          {
            $set: {
              ativo: newStatus,
              user_upd: user?.name || "",
              updatedat: new Date(),
            },
          }
        );

      revalidatePath("/produto-preco-kit");

      if (result.matchedCount === 0) {
        return {
          success: false,
          message: "Preço kit não encontrado",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: `Preço kit ${
          newStatus ? "ativado" : "desativado"
        } com sucesso`,
        data: { ativo: newStatus },
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error toggling produto preco kit status:", error);
    return {
      success: false,
      message: "Erro ao alterar status do preço kit",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
