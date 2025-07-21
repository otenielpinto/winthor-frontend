"use server";

import AuthService from "@/auth/util";

async function getUser() {
  const user = await AuthService.getSessionUser();
  return user;
}

// id: user.id,
// sub: user.name,
// name: user.name,
// email: user.email,
// active: user.active,
// isAdmin: user.isAdmin,
// codigo: user.codigo,
// emp_acesso: user.emp_acesso || [],
// empresa: user.empresa,
//id_tenant: user.id_tenant,

export { getUser };
