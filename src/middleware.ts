import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  "/admin": ["admin"],
  "/supplier": ["proveedor"],
  "/transporter": ["transportista"],
  "/repartidor": ["repartidor"],
  "/account": ["admin", "proveedor", "transportista", "repartidor", "cliente"],
};

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;

  const protectedBase = Object.keys(ROLE_ROUTES).find((base) =>
    pathname.startsWith(base)
  );

  if (!protectedBase) return NextResponse.next();

  const session = req.auth;
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const allowedRoles = ROLE_ROUTES[protectedBase];
  const userRole = session.user.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/supplier/:path*",
    "/transporter/:path*",
    "/repartidor/:path*",
    "/account/:path*",
  ],
};
