import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/auth-context";

const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin",
  proveedor: "/supplier",
  transportista: "/transporter",
  repartidor: "/repartidor",
  cliente: "/account",
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { supplier: { select: { active: true } } },
        });

        if (!user) return null;

        // Verificar proveedor activo
        if (user.role === "proveedor" && user.supplier && !user.supplier.active) {
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          supplierId: user.supplierId ?? undefined,
          redirect: ROLE_REDIRECTS[user.role] ?? "/",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.supplierId = (user as { supplierId?: string }).supplierId;
        token.redirect = (user as { redirect: string }).redirect;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as UserRole;
      session.user.supplierId = token.supplierId as string | undefined;
      session.user.redirect = token.redirect as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
});
