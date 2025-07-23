"use server";

import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/hooks/useUser";

export async function getConfiguracao() {
  const user = await getUser();

  if (!user || !user.id_tenant) {
    return null;
  }

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const response = await clientdb.collection("tenant").findOne(
      { id: Number(user.id_tenant) },
      {
        projection: {
          wta_validar_etapa: 1,
          wta_validar_estoque: 1,
          wta_reprocessar_hora: 1,
          id: 1,
        },
      }
    );

    await TMongo.mongoDisconnect(client);

    if (!response) {
      return null;
    }

    return {
      id_tenant: response.id,
      // Convert numeric values (0/1) to boolean for the form
      wta_validar_etapa: response.wta_validar_etapa === 1,
      wta_validar_estoque: response.wta_validar_estoque === 1,
      wta_reprocessar_hora: response.wta_reprocessar_hora === 1,
      _id: response._id.toString(),
    };
  } catch (error) {
    await TMongo.mongoDisconnect(client);
    throw error;
  }
}

export async function setConfiguracao(data: {
  wta_validar_etapa?: boolean;
  wta_validar_estoque?: boolean;
  wta_reprocessar_hora?: boolean;
}) {
  const user = await getUser();

  if (!user || !user.id_tenant) {
    throw new Error("Usuário não encontrado ou sem id_tenant");
  }

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const updateData: any = {};

    // Convert boolean values to numeric (0/1) for database storage
    if (data.wta_validar_etapa !== undefined) {
      updateData.wta_validar_etapa = data.wta_validar_etapa ? 1 : 0;
    }

    if (data.wta_validar_estoque !== undefined) {
      updateData.wta_validar_estoque = data.wta_validar_estoque ? 1 : 0;
    }

    if (data.wta_reprocessar_hora !== undefined) {
      updateData.wta_reprocessar_hora = data.wta_reprocessar_hora ? 1 : 0;
    }

    const response = await clientdb
      .collection("tenant")
      .updateOne({ id: Number(user.id_tenant) }, { $set: updateData });

    await TMongo.mongoDisconnect(client);
    return response;
  } catch (error) {
    await TMongo.mongoDisconnect(client);
    throw error;
  }
}
