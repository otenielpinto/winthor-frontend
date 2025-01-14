"use server";
import * as bcryptjs from "bcryptjs";
import { redirect } from "next/navigation";
import AuthService from "@/auth/util";
import { getUserByEmail, createUser } from "@/auth/services";
import { User } from "@/auth/types/user";
import { ActivitySquare } from "lucide-react";

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

  redirect(process.env.NEXT_PUBLIC_KOMACHE_AFTER_SIGN_IN_URL || "/home");
}
