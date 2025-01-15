import AuthService from "@/auth/util";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

//"/sign-in"
export function GET(req: NextRequest) {
  AuthService.destroySession();
  return NextResponse.redirect(new URL("/", req.url));
}
