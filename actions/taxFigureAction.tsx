"use server";

import { randomUUID } from "crypto";
import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { z } from "zod";
import type { TaxFigure } from "@/types/TaxFigureTypes";

const taxFigureSchema = z.object({
  uf: z
    .string()
    .min(1, "UF é obrigatória")
    .transform((v) => v.trim().toUpperCase()),
  cod_st_nac: z.number().int("Código ST NAC deve ser inteiro"),
  cod_st_imp: z.number().int("Código ST IMP deve ser inteiro"),
});

type TaxFigureInput = z.infer<typeof taxFigureSchema>;

type ActionResult = {
  success: boolean;
  message: string;
  data?: TaxFigure | null;
  error?: string;
};

const COLLECTION = "tmp_tax_figure_id";

/**
 * List all tax figures for the authenticated tenant
 */
export async function getTaxFigures(): Promise<TaxFigure[]> {
  const user = await getUser();

  if (!user || !user.id_tenant) {
    return [];
  }

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const items = await clientdb
      .collection(COLLECTION)
      .find({ id_tenant: user.id_tenant })
      .sort({ uf: 1 })
      .toArray();

    return items.map((doc) => ({
      id: doc.id,
      id_tenant: doc.id_tenant,
      uf: doc.uf,
      cod_st_nac: doc.cod_st_nac,
      cod_st_imp: doc.cod_st_imp,
    })) as TaxFigure[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Create a new tax figure for the authenticated tenant
 */
export async function createTaxFigure(
  input: TaxFigureInput
): Promise<ActionResult> {
  const validated = taxFigureSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      message: "Dados inválidos",
      error: validated.error.errors[0].message,
    };
  }

  const user = await getUser();

  if (!user || !user.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado",
      error: "AUTH_REQUIRED",
    };
  }

  const id_tenant = user.id_tenant as number;

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    // Reject duplicate (uf + id_tenant)
    const existing = await clientdb
      .collection(COLLECTION)
      .findOne({ uf: validated.data.uf, id_tenant });

    if (existing) {
      return {
        success: false,
        message: "Já existe uma configuração para esta UF",
        error: "DUPLICATE",
      };
    }

    const now = new Date();

    const newItem: TaxFigure & {
      createdat: Date;
      updatedat: Date;
    } = {
      id: randomUUID(),
      id_tenant,
      ...validated.data,
      createdat: now,
      updatedat: now,
    };

    await clientdb.collection(COLLECTION).insertOne(newItem);

    return {
      success: true,
      message: "Figura fiscal criada com sucesso",
      data: {
        id: newItem.id,
        id_tenant: newItem.id_tenant,
        uf: newItem.uf,
        cod_st_nac: newItem.cod_st_nac,
        cod_st_imp: newItem.cod_st_imp,
      },
    };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Update an existing tax figure
 */
export async function updateTaxFigure(
  id: string,
  input: TaxFigureInput
): Promise<ActionResult> {
  const validated = taxFigureSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      message: "Dados inválidos",
      error: validated.error.errors[0].message,
    };
  }

  const user = await getUser();

  if (!user || !user.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado",
      error: "AUTH_REQUIRED",
    };
  }

  const id_tenant = user.id_tenant as number;

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    // Reject duplicate (uf + id_tenant), excluding the record being updated
    const existing = await clientdb.collection(COLLECTION).findOne({
      uf: validated.data.uf,
      id_tenant,
      id: { $ne: id },
    });

    if (existing) {
      return {
        success: false,
        message: "Já existe uma configuração para esta UF",
        error: "DUPLICATE",
      };
    }

    const updateData = {
      ...validated.data,
      updatedat: new Date(),
    };

    const result = await clientdb.collection(COLLECTION).updateOne(
      { id, id_tenant },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: "Figura fiscal não encontrada",
        error: "NOT_FOUND",
      };
    }

    return {
      success: true,
      message: "Figura fiscal atualizada com sucesso",
      data: { id, id_tenant, ...validated.data },
    };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

/**
 * Delete a tax figure
 */
export async function deleteTaxFigure(id: string): Promise<ActionResult> {
  const user = await getUser();

  if (!user || !user.id_tenant) {
    return {
      success: false,
      message: "Usuário não autenticado",
      error: "AUTH_REQUIRED",
    };
  }

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const result = await clientdb
      .collection(COLLECTION)
      .deleteOne({ id, id_tenant: user.id_tenant });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Figura fiscal não encontrada",
        error: "NOT_FOUND",
      };
    }

    return {
      success: true,
      message: "Figura fiscal removida com sucesso",
    };
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
