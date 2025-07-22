"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for validating product exception data
const produtoExcessaoSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  ativo: z.boolean().optional().default(true),
  id_tenant: z.number().optional(),
});

type ProdutoExcessaoItem = {
  _id?: string;
  id?: string;
  id_tenant: number;
  codigo: string;
  createdat?: Date;
  descricao: string;
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
 * Get all product exceptions for a specific tenant
 */
export async function getProdutoExcessao(
  id_tenant?: number
): Promise<ProdutoExcessaoItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_excecao")
      .find({ id_tenant: tenantId })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as ProdutoExcessaoItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get a specific product exception by ID
 */
export async function getProdutoExcessaoById(
  id: string
): Promise<ProdutoExcessaoItem | null> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const item = await clientdb
      .collection("tmp_produto_excecao")
      .findOne({ id: id });

    if (!item) return null;

    return {
      ...item,
      _id: item._id.toString(),
    } as ProdutoExcessaoItem;
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get product exceptions by code
 */
export async function getProdutoExcessaoByCodigo(
  codigo: string,
  id_tenant?: number
): Promise<ProdutoExcessaoItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_excecao")
      .find({
        codigo: codigo,
        id_tenant: tenantId,
      })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as ProdutoExcessaoItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Create a new product exception
 */
export async function createProdutoExcessao(
  formData: FormData
): Promise<ActionResult> {
  try {
    const validatedFields = produtoExcessaoSchema.safeParse({
      codigo: formData.get("codigo"),
      descricao: formData.get("descricao"),
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
      const newId = Date.now().toString() + "-" + validatedFields.data.codigo;

      const newItem = {
        id: newId,
        id_tenant: user?.id_tenant,
        createdat: now,
        updatedat: now,
        ...validatedFields.data,
      };

      const result = await clientdb
        .collection("tmp_produto_excecao")
        .insertOne(newItem);

      revalidatePath("/produtoExcecao");

      return {
        success: true,
        message: "Exceção de produto criada com sucesso",
        data: { ...newItem, _id: result.insertedId.toString() },
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error creating produto excecao:", error);
    return {
      success: false,
      message: "Erro ao criar exceção de produto",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing product exception
 */
export async function updateProdutoExcessao(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const validatedFields = produtoExcessaoSchema.safeParse({
      codigo: formData.get("codigo"),
      descricao: formData.get("descricao"),
      ativo: formData.get("ativo") === "true",
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Dados inválidos",
        error: validatedFields.error.errors[0].message,
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const updateData = {
        ...validatedFields.data,
        updatedat: new Date(),
      };

      const result = await clientdb
        .collection("tmp_produto_excecao")
        .updateOne({ id: id }, { $set: updateData });

      revalidatePath("/produtoExcecao");

      if (result.matchedCount === 0) {
        return {
          success: false,
          message: "Exceção não encontrada",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Exceção atualizada com sucesso",
        data: updateData,
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error updating produto excecao:", error);
    return {
      success: false,
      message: "Erro ao atualizar exceção",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a product exception
 */
export async function deleteProdutoExcessao(id: string): Promise<ActionResult> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const result = await clientdb
        .collection("tmp_produto_excecao")
        .deleteOne({ id: id });

      revalidatePath("/produtoExcecao");

      if (result.deletedCount === 0) {
        return {
          success: false,
          message: "Exceção não encontrada",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Exceção removida com sucesso",
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error deleting produto excecao:", error);
    return {
      success: false,
      message: "Erro ao remover exceção",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search product exceptions by description, code, or product ID
 */
export async function searchProdutoExcessao(
  searchTerm: string,
  id_tenant?: number
): Promise<ProdutoExcessaoItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_excecao")
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
    })) as ProdutoExcessaoItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get product exception statistics
 */
export async function getProdutoExcessaoStats(id_tenant?: number) {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const stats = await clientdb
      .collection("tmp_produto_excecao")
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
          },
        },
      ])
      .toArray();

    return {
      totalItems: stats[0]?.totalItems || 0,
      activeItems: stats[0]?.activeItems || 0,
      inactiveItems: stats[0]?.inactiveItems || 0,
    };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get product exceptions with filters
 */
export async function getProdutoExcessaoWithFilters(filters: {
  startDate?: Date | null;
  endDate?: Date | null;
  descricao?: string;
  codigo?: string;
  tipo_excecao?: string;
  ativo?: boolean;
  id_tenant?: number;
}): Promise<ProdutoExcessaoItem[]> {
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

    // Add type filter
    if (filters.tipo_excecao) {
      query.tipo_excecao = filters.tipo_excecao;
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
      .collection("tmp_produto_excecao")
      .find(query)
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as ProdutoExcessaoItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Toggle product exception active status
 */
export async function toggleProdutoExcessaoStatus(
  id: string
): Promise<ActionResult> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      // First get the current item
      const currentItem = await clientdb
        .collection("tmp_produto_excecao")
        .findOne({ id: id });

      if (!currentItem) {
        return {
          success: false,
          message: "Exceção não encontrada",
          error: "NOT_FOUND",
        };
      }

      // Toggle the active status
      const newStatus = !currentItem.ativo;

      const result = await clientdb.collection("tmp_produto_excecao").updateOne(
        { id: id },
        {
          $set: {
            ativo: newStatus,
            updatedat: new Date(),
          },
        }
      );

      revalidatePath("/produtoExcecao");

      if (result.matchedCount === 0) {
        return {
          success: false,
          message: "Exceção não encontrada",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: `Exceção ${newStatus ? "ativada" : "desativada"} com sucesso`,
        data: { ativo: newStatus },
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error toggling produto excecao status:", error);
    return {
      success: false,
      message: "Erro ao alterar status da exceção",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
