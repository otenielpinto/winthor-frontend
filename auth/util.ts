import * as jose from "jose";
import { cookies } from "next/headers";

//referencias https://github.com/guscsales/codegus-auth
//https://github.com/balazsorban44/auth-poc-next

async function openSessionToken(token: string) {
  const secret = new TextEncoder().encode(process.env.NEXT_AUTH_SECRET);
  const { payload } = await jose.jwtVerify(token, secret);

  return payload;
}

async function createSessionToken(payload = {}) {
  const secret = new TextEncoder().encode(process.env.NEXT_AUTH_SECRET);
  const session = await new jose.SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setExpirationTime("1d")
    .sign(secret);
  const { exp, role } = await openSessionToken(session);

  cookies().set("session", session, {
    expires: (exp as number) * 1000,
    path: "/",
    httpOnly: true,
  });
}

async function isSessionValid() {
  const sessionCookie = cookies().get("session");

  if (sessionCookie) {
    const { value } = sessionCookie;
    const { exp } = await openSessionToken(value);
    const currentDate = new Date().getTime();

    return (exp as number) * 1000 > currentDate;
  }

  return false;
}

async function getSessionUser() {
  const sessionCookie = cookies().get("session");
  let user = null;

  if (sessionCookie) {
    const { value } = sessionCookie;
    user = await openSessionToken(value);
  }
  return user;
}

function destroySession() {
  cookies().delete("session");
}

const AuthService = {
  openSessionToken,
  createSessionToken,
  isSessionValid,
  destroySession,
  getSessionUser,
};

export default AuthService;
