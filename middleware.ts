import { NextRequest, NextResponse } from "next/server";
import AuthService from "@/auth/util";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

const publicRoutes = ["/sign-in", "/sign-up", "/"];

export async function middleware(req: NextRequest) {
  //console.log(req.nextUrl);

  const pathname = req.nextUrl.pathname;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  const session = await AuthService.isSessionValid();
  if (!session) {
    const isAPIRoute = pathname.startsWith("/api");

    if (isAPIRoute) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/sign-in", req.url));
  } else if (pathname == "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}
