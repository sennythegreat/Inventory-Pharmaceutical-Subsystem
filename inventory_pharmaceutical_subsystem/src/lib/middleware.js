//Next.js root middleware. Runs on every request that matches `config.matcher`
//Protects all /api/* routes except /api/login
//redirect unauthenticated browser requests to /login

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  //Paths that never need a token
  const isPublic =
    pathname === "/login" || //login UI page
    pathname === "/register" ||
    pathname === "/api/login" || //login API
    pathname === "/api/register" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  if (isPublic) return NextResponse.next();

  //Protect /api/* routes
  if (pathname.startsWith("/api/")) {
    const auth = requireAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }
    return NextResponse.next();
  }

  //Protect browser page routes
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (!cookieToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  //verify the cookie token
  const auth = requireAuth({
    headers: { get: () => `Bearer ${cookieToken}` },
  });
  if (!auth.ok) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  //middleware on all routes except static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
