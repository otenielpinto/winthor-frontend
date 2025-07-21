"use server";

import { TMongo } from "@/infra/mongoClient";

export async function getUserEmpresas(userId: string) {
  if (!userId) {
    return [];
  }
  const { client, clientdb } = await TMongo.connectToDatabase();
  const user = await clientdb.collection("user").findOne({ id: userId });

  if (!user) {
    await TMongo.mongoDisconnect(client);
    console.log("User not found");
    return [];
  }
  //Sempre gravar o array com int32 para evitar problemas de comparação ****
  const empresas = await clientdb.collection("empresa").find({}).toArray();
  await TMongo.mongoDisconnect(client);

  const filteredEmpresas = empresas.filter((empresa: any) =>
    user.emp_acesso.includes(Number(empresa.id))
  );
  const response = filteredEmpresas
    ? filteredEmpresas.map((empresa) => ({
        ...empresa,
        _id: empresa._id.toString(),
      }))
    : [];

  return response;
}
