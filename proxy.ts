import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyDashboardSessionToken, COOKIE_NAME } from "@/lib/dashboardAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dispatch/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await verifyDashboardSessionToken(token);

  if (!valid) {
    return NextResponse.redirect(new URL("/dispatch/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/dispatch/:path*",
};
