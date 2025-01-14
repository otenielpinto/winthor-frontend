import { User } from "@/auth/types/user";
const BASE_URL = (process.env.NEXT_AUTH_URL ||
  "http://localhost:3000") as string;

export async function getUserByEmail(email: string) {
  let query = { email: email };
  const response = await fetch(`${BASE_URL}/api/user/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    cache: "no-store",
  });

  return await response.json();
}

export async function getUsers(query: any): Promise<User[]> {
  const response = await fetch(`/api/user/list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    cache: "no-store",
  });

  try {
    const data: any = await response.json();
    return data;
  } catch (error) {
    console.log("🚀 ~ getUsers ~ error:", error);
    return [];
  }
}

export async function createUser(user: User): Promise<any> {
  const response = await fetch(`/api/user/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
    cache: "no-store",
  });

  try {
    const data: User = await response.json();
    return data;
  } catch (error) {
    console.log("🚀 ~ createUser ~ error:", error);
    return {};
  }
}
