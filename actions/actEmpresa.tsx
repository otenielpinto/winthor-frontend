"use server";

import { TMongo } from "@/infra/mongoClient";

export async function getAllEmpresas() {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb.collection("empresa").find().toArray();
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function getEmpresaById(id: Number) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .findOne({ id: Number(id) });
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function createEmpresa(data: any) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb.collection("empresa").insertOne(data);
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function updateEmpresa(id: Number, data: any) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .updateOne({ id: Number(id) }, { $set: data });
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function deleteEmpresa(id: Number) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .deleteOne({ id: Number(id) });
  await TMongo.mongoDisconnect(client);
  return response;
}

export async function getEmpresaByCnpj(cnpj: String) {
  const { client, clientdb } = await TMongo.connectToDatabase();
  const response = await clientdb
    .collection("empresa")
    .findOne({ cpfcnpj: cnpj });
  await TMongo.mongoDisconnect(client);
  return response;
}
