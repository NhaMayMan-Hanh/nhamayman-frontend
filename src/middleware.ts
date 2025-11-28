// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Ignore non-page requests
  if (!request.headers.get("accept")?.includes("text/html")) {
    return NextResponse.next();
  }

  console.log("[Middleware] Path:", pathname);

  if (pathname.startsWith("/admin")) {
    if (!token) {
      console.log("❌ [Middleware] No token → /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      if ((payload as any).role !== "admin") {
        console.log("⛔ [Middleware] Not admin → /");
        return NextResponse.redirect(new URL("/", request.url));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.log("❌ [Middleware] Invalid token → /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ✅ Auth routes - redirect nếu đã login
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        const role = (payload as any).role;
        const redirectPath = role === "admin" ? "/admin/dashboard" : "/";
        console.log(`✅ [Middleware] Already logged in (${role}) → ${redirectPath}`);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      } catch {
        // Token invalid, cho vào login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // Tất cả route admin
    "/login",
    "/register",
  ],
};
