import { NextResponse } from "next/server";
import { TAuthMongo } from "@/auth/infra/mongoClient";

export async function GET(req: Request) {
  const { client, clientdb } = await TAuthMongo.connectToDatabase();
  const response = await clientdb.collection("user").find().toArray();

  await TAuthMongo.mongoDisconnect(client);
  return NextResponse.json(response, { status: 200 });
}
