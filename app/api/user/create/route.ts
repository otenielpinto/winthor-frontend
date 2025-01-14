import { NextResponse } from "next/server";
import * as bcryptjs from "bcryptjs";
import { TAuthMongo } from "@/auth/infra/mongoClient";
import { User } from "@/auth/types/user";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const body = await req.json();
  let email = body?.email ? body?.email : "email";
  let password = body?.password;
  let name = body?.name ? body?.name : uuidv4();

  let query = { email };
  const { client, clientdb } = await TAuthMongo.connectToDatabase();
  let response: any = await clientdb.collection("user").findOne(query);

  if (!response) {
    let salt = await bcryptjs.genSalt(10);
    let hashPassword = bcryptjs.hashSync(password, salt);

    let user: User = {
      id: uuidv4(),
      email,
      name,
      active: 0,
      isAdmin: 0,
      password: hashPassword,
      codigo: name,
      emp_acesso: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    response = await clientdb.collection("user").insertOne(user);
  }

  await TAuthMongo.mongoDisconnect(client);
  return NextResponse.json(response ? response : {}, { status: 200 });
}
