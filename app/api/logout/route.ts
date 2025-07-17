"use server";

import AuthService from "@/auth/util";
import { NextRequest, NextResponse } from "next/server";

//"/sign-in"
export async function GET(req: NextRequest) {
  await AuthService.destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}
