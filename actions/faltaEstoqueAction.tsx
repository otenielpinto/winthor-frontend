"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for validating stock shortage data
const faltaEstoqueSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  id_produto: z.string().min(1, "ID do produto é obrigatório"),
  quantidade: z.string().min(1, "Quantidade é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  valor_unitario: z.string().min(1, "Valor unitário é obrigatório"),
  id_tenant: z.number().optional(),
});

type FaltaEstoqueItem = {
  _id?: string;
  id?: string;
  id_tenant: number;
  codigo: string;
  createdat?: Date;
  descricao: string;
  id_produto: string;
  quantidade: string;
  unidade: string;
  updatedat?: Date;
  valor_unitario: string;
};

type ActionResult = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * Get all stock shortage items for a specific tenant
 */
export async function getFaltaEstoque(
  id_tenant?: number
): Promise<FaltaEstoqueItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_falta_estoque")
      .find({ id_tenant: tenantId })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as FaltaEstoqueItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get a specific stock shortage item by ID
 */
export async function getFaltaEstoqueById(
  id: string
): Promise<FaltaEstoqueItem | null> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const item = await clientdb
      .collection("tmp_produto_falta_estoque")
      .findOne({ id: id });

    if (!item) return null;

    return {
      ...item,
      _id: item._id.toString(),
    } as FaltaEstoqueItem;
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get stock shortage items by product ID
 */
export async function getFaltaEstoqueByProduto(
  id_produto: string,
  id_tenant?: number
): Promise<FaltaEstoqueItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_falta_estoque")
      .find({
        id_produto: id_produto,
        id_tenant: tenantId,
      })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as FaltaEstoqueItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Create a new stock shortage item
 */
export async function createFaltaEstoque(
  formData: FormData
): Promise<ActionResult> {
  try {
    const validatedFields = faltaEstoqueSchema.safeParse({
      codigo: formData.get("codigo"),
      descricao: formData.get("descricao"),
      id_produto: formData.get("id_produto"),
      quantidade: formData.get("quantidade"),
      unidade: formData.get("unidade"),
      valor_unitario: formData.get("valor_unitario"),
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

      // Generate a new ID (you might want to implement a better ID generation strategy)
      const lastItem = await clientdb
        .collection("tmp_produto_falta_estoque")
        .findOne({}, { sort: { id: -1 } });

      const newId = lastItem ? String(Number(lastItem.id) + 1) : "1";

      const newItem = {
        id: newId,
        id_tenant: user?.id_tenant,
        createdat: now,
        updatedat: now,
        ...validatedFields.data,
      };

      const result = await clientdb
        .collection("tmp_produto_falta_estoque")
        .insertOne(newItem);

      revalidatePath("/faltaEstoque");

      return {
        success: true,
        message: "Item de falta de estoque criado com sucesso",
        data: { ...newItem, _id: result.insertedId.toString() },
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error creating falta estoque:", error);
    return {
      success: false,
      message: "Erro ao criar item de falta de estoque",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update an existing stock shortage item
 */
export async function updateFaltaEstoque(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const validatedFields = faltaEstoqueSchema.safeParse({
      codigo: formData.get("codigo"),
      descricao: formData.get("descricao"),
      id_produto: formData.get("id_produto"),
      quantidade: formData.get("quantidade"),
      unidade: formData.get("unidade"),
      valor_unitario: formData.get("valor_unitario"),
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
        .collection("tmp_produto_falta_estoque")
        .updateOne({ id: id }, { $set: updateData });

      revalidatePath("/faltaEstoque");

      if (result.matchedCount === 0) {
        return {
          success: false,
          message: "Item não encontrado",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Item atualizado com sucesso",
        data: updateData,
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error updating falta estoque:", error);
    return {
      success: false,
      message: "Erro ao atualizar item",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a stock shortage item
 */
export async function deleteFaltaEstoque(id: string): Promise<ActionResult> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const result = await clientdb
        .collection("tmp_produto_falta_estoque")
        .deleteOne({ id: id });

      revalidatePath("/faltaEstoque");

      if (result.deletedCount === 0) {
        return {
          success: false,
          message: "Item não encontrado",
          error: "NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Item removido com sucesso",
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error deleting falta estoque:", error);
    return {
      success: false,
      message: "Erro ao remover item",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search stock shortage items by description or code
 */
export async function searchFaltaEstoque(
  searchTerm: string,
  id_tenant?: number
): Promise<FaltaEstoqueItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const items = await clientdb
      .collection("tmp_produto_falta_estoque")
      .find({
        id_tenant: tenantId,
        $or: [
          { descricao: { $regex: searchTerm, $options: "i" } },
          { codigo: { $regex: searchTerm, $options: "i" } },
          { id_produto: { $regex: searchTerm, $options: "i" } },
        ],
      })
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as FaltaEstoqueItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get stock shortage statistics
 */
export async function getFaltaEstoqueStats(id_tenant?: number) {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const tenantId = id_tenant || user?.id_tenant;

    const stats = await clientdb
      .collection("tmp_produto_falta_estoque")
      .aggregate([
        { $match: { id_tenant: tenantId } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: { $toDouble: "$quantidade" } },
            totalValue: { $sum: { $toDouble: "$valor_unitario" } },
            avgValue: { $avg: { $toDouble: "$valor_unitario" } },
          },
        },
      ])
      .toArray();

    return (
      stats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        avgValue: 0,
      }
    );
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Get stock shortage items with filters
 */
export async function getFaltaEstoqueWithFilters(filters: {
  startDate?: Date | null;
  endDate?: Date | null;
  descricao?: string;
  codigo?: string;
  id_produto?: string;
  id_tenant?: number;
}): Promise<FaltaEstoqueItem[]> {
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

    if (filters.id_produto) {
      searchFilters.push({
        id_produto: { $regex: filters.id_produto, $options: "i" },
      });
    }

    if (searchFilters.length > 0) {
      query.$or = searchFilters;
    }

    const items = await clientdb
      .collection("tmp_produto_falta_estoque")
      .find(query)
      .sort({ createdat: -1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as FaltaEstoqueItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
