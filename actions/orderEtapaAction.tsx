"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

export async function saveOrderEtapa(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const user: any = await getUser();

    if (!user || !user.empresa) {
      return {
        success: false,
        message: "Usuário não autenticado ou sem empresa associada",
      };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Update existing order etapa record
    const updateData = {
      $set: {
        id: Number(orderId),
        id_tenant: user.id_tenant,
        userId: user.id,
        updatedAt: new Date(),
        status: "confirmed",
      },
    };

    const result = await clientdb
      .collection("tmp_order_etapa")
      .updateOne(
        { id: Number(orderId), id_tenant: user.id_tenant },
        updateData,
        {
          upsert: true,
        }
      );
    await TMongo.mongoDisconnect(client);

    if (result.upsertedCount > 0) {
      return {
        success: true,
        message: "Novo registro criado com sucesso",
      };
    }

    if (result.modifiedCount > 0) {
      return {
        success: true,
        message: "Pedido confirmado e atualizado com sucesso",
      };
    } else {
      return {
        success: false,
        message: "Nenhum registro foi atualizado",
      };
    }
  } catch (error) {
    console.error("Error saving order etapa:", error);
    return {
      success: false,
      message: "Erro interno do servidor ao salvar registro",
    };
  }
}
