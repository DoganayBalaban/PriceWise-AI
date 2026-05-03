import { NextRequest, NextResponse } from "next/server";

const authOnlyPaths = ["/login", "/register"];
const protectedPaths = ["/dashboard", "/products", "/alerts"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const sessionCookie =
    req.cookies.get("better-auth.session_token") ??
    req.cookies.get("__Secure-better-auth.session_token");

  const isLoggedIn = !!sessionCookie;

  // Giriş yapılmışsa login/register/landing'e gitmesin → dashboard
  if (isLoggedIn && (pathname === "/" || authOnlyPaths.some((p) => pathname.startsWith(p)))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Giriş yapılmamışsa korumalı sayfalara gitmesin → login
  if (!isLoggedIn && protectedPaths.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
