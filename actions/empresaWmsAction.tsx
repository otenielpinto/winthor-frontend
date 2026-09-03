"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const empresaWmsSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cnpj: z.string().optional().default(""),
});

export type EmpresaWmsItem = {
  _id: string;
  id: number;
  id_tenant: number;
  nome: string;
  cnpj: string;
  createdat?: Date;
  updatedat?: Date;
};

type ActionResult = {
  success: boolean;
  message: string;
  data?: any;
};

// Numeric id from id_tracker collection: { name, id_tenant, id_sequence }
// ponytail: findOneAndUpdate $inc is atomic, no race between concurrent creates
async function getNextId(
  clientdb: any,
  name: string,
  id_tenant: number
): Promise<number> {
  const result = await clientdb
    .collection("id_tracker")
    .findOneAndUpdate(
      { name, id_tenant },
      { $inc: { id_sequence: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  const doc: any = result?.value ?? result;
  return Number(doc?.id_sequence);
}

export async function getEmpresasWms(): Promise<EmpresaWmsItem[]> {
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const user = await getUser();
    const items = await clientdb
      .collection("empresa_wms")
      .find({ id_tenant: user?.id_tenant })
      .sort({ id: 1 })
      .toArray();

    return items.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as EmpresaWmsItem[];
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

export async function createEmpresaWms(formData: FormData): Promise<ActionResult> {
  try {
    const validated = empresaWmsSchema.safeParse({
      nome: formData.get("nome"),
      cnpj: formData.get("cnpj") || "",
    });

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.errors[0].message,
      };
    }

    const user = await getUser();
    if (!user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const id_tenant = user.id_tenant as number;
      const id = await getNextId(clientdb, "empresa_wms", id_tenant);
      const now = new Date();

      const newItem = {
        id,
        id_tenant,
        nome: validated.data.nome,
        cnpj: validated.data.cnpj,
        createdat: now,
        updatedat: now,
      };

      await clientdb.collection("empresa_wms").insertOne(newItem);
      revalidatePath("/empresas");

      // Return plain fields only — insertOne mutates newItem appending an
      // ObjectId _id, which RSC serialization cannot pass to client components.
      return {
        success: true,
        message: "Empresa criada com sucesso",
        data: { id, id_tenant, nome: newItem.nome, cnpj: newItem.cnpj },
      };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error creating empresa_wms:", error);
    return { success: false, message: "Erro ao criar empresa" };
  }
}

export async function updateEmpresaWms(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  try {
    const validated = empresaWmsSchema.safeParse({
      nome: formData.get("nome"),
      cnpj: formData.get("cnpj") || "",
    });

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.errors[0].message,
      };
    }

    const user = await getUser();
    if (!user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const result = await clientdb
        .collection("empresa_wms")
        .updateOne(
          { id: Number(id), id_tenant: user.id_tenant },
          {
            $set: {
              nome: validated.data.nome,
              cnpj: validated.data.cnpj,
              updatedat: new Date(),
            },
          }
        );

      revalidatePath("/empresas");

      if (result.matchedCount === 0) {
        return { success: false, message: "Empresa não encontrada" };
      }

      return { success: true, message: "Empresa atualizada com sucesso" };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error updating empresa_wms:", error);
    return { success: false, message: "Erro ao atualizar empresa" };
  }
}

export async function deleteEmpresaWms(id: number): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, message: "Usuário não autenticado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    try {
      const result = await clientdb
        .collection("empresa_wms")
        .deleteOne({ id: Number(id), id_tenant: user.id_tenant });

      revalidatePath("/empresas");

      if (result.deletedCount === 0) {
        return { success: false, message: "Empresa não encontrada" };
      }

      return { success: true, message: "Empresa excluída com sucesso" };
    } finally {
      await TMongo.mongoDisconnect(client);
    }
  } catch (error) {
    console.error("Error deleting empresa_wms:", error);
    return { success: false, message: "Erro ao excluir empresa" };
  }
}
