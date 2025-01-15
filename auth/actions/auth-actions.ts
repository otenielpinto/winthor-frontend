"use server";
import * as bcryptjs from "bcryptjs";
import { redirect } from "next/navigation";
import AuthService from "@/auth/util";

import { User } from "@/auth/types/user";
import { TAuthMongo } from "@/auth/infra/mongoClient";
import { v4 as uuidv4 } from "uuid";

export async function createAccount(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const hashPassword = bcryptjs.hashSync(password, 10);
  const res: User = await createUser({
    name,
    email,
    password: hashPassword,
  });

  redirect("/sign-in");
}

// https://makerkit.dev/blog/tutorials/nextjs-server-actions
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  let user = await getUserByEmail(email);

  if (!user) {
    // Aqui você pode usar optimistic update para atualizar a tela
    console.log("Usuário ou senha inválidos");
    redirect("/sign-in");
  }

  bcryptjs.genSalt(10);
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    console.log("Usuário ou senha inválidos");
    alert("Usuário ou senha inválidos");
    redirect("/sign-in");
  }

  await AuthService.createSessionToken({
    id: user.id,
    sub: user.name,
    name: user.name,
    email: user.email,
    active: user.active,
    isAdmin: user.isAdmin,
    codigo: user.codigo,
    emp_acesso: user.emp_acesso || [],
    empresa: user.emp_acesso[0] ? user.emp_acesso[0] : 0,
  });

  redirect(
    (process.env.NEXT_PUBLIC_KOMACHE_AFTER_SIGN_IN_URL as string) || "/home"
  );
}

export async function getUsers() {
  const { client, clientdb } = await TAuthMongo.connectToDatabase();
  const response = await clientdb.collection("user").find().toArray();
  await TAuthMongo.mongoDisconnect(client);
  return response;
}

export async function createUser(body: User): Promise<any> {
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
  return response;
}

export async function getUserByEmail(email: any): Promise<any> {
  //Usando o verbo POST para poder enviar os dados via body
  let admin_email = process.env.NEXT_AUTH_ADMIN_EMAIL as string;
  let admin_password = process.env.NEXT_AUTH_ADMIN_PASSWORD as string;

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
  return response;
}
