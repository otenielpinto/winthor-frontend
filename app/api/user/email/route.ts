import { NextRequest, NextResponse } from "next/server";
import { TAuthMongo } from "@/auth/infra/mongoClient";
import { User } from "@/auth/types/user";
import * as bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  //Usando o verbo POST para poder enviar os dados via body
  let admin_email = process.env.NEXT_AUTH_ADMIN_EMAIL as string;
  let admin_password = process.env.NEXT_AUTH_ADMIN_PASSWORD as string;

  const body = await req.json();
  let email = body?.email ? body?.email : "email";

  let active = 1;
  let query = { email, active };
  const { client, clientdb } = await TAuthMongo.connectToDatabase();
  let response: any = await clientdb.collection("user").findOne(query);

  //mover isso para o create route
  if (!response && email == admin_email) {
    let salt = await bcryptjs.genSalt(10);

    let user: User = {
      id: uuidv4(),
      email,
      name: "Admin",
      active: 1,
      isAdmin: 1,
      password: bcryptjs.hashSync(admin_password, salt),
      codigo: uuidv4(),
      emp_acesso: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    response = await clientdb.collection("user").insertOne(user);
  }

  await TAuthMongo.mongoDisconnect(client);
  return NextResponse.json(response ? response : {}, { status: 200 });
}
