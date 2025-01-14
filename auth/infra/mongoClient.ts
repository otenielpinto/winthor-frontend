import { MongoClient } from "mongodb";

// Esse servico é responsável por conectar com o banco de dados MongoDB
// USAR EXCLUSIVAMENTE PARA AUTENTICACAO

async function mongoConnect() {
  const client = new MongoClient(String(process.env.NEXT_AUTH_MONGO_URL));
  await client.connect();
  return client;
}

async function mongoSetDatabase(client: MongoClient) {
  return client.db(process.env.NEXT_AUTH_MONGO_DATABASE);
}

async function mongoDisconnect(client: MongoClient) {
  await client.close();
}

const connectToDatabase = async () => {
  const client = await TAuthMongo.mongoConnect();
  const clientdb = await TAuthMongo.mongoSetDatabase(client);
  return { client, clientdb };
};

export const TAuthMongo = {
  mongoConnect,
  mongoSetDatabase,
  mongoDisconnect,
  connectToDatabase,
};
