import AuthService from "@/auth/util";
import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  AuthService.destroySession();
  return NextResponse.redirect(new URL("/sign-in", req.url));
}
