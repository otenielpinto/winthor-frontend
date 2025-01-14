import { MongoClient } from "mongodb";

async function mongoConnect() {
  const client = new MongoClient(String(process.env.MONGO_CONNECTION));

  await client.connect();
  return client;
}

async function mongoSetDatabase(client: MongoClient) {
  return client.db(process.env.MONGO_DATABASE);
}

async function mongoDisconnect(client: MongoClient) {
  await client.close();
}

const connectToDatabase = async () => {
  const client = await TMongo.mongoConnect();
  const clientdb = await TMongo.mongoSetDatabase(client);
  return { client, clientdb };
};

export const TMongo = {
  mongoConnect,
  mongoSetDatabase,
  mongoDisconnect,
  connectToDatabase,
};
