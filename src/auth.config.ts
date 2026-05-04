import type { NextAuthConfig } from "next-auth";

// Config ligera compatible con Edge Runtime (sin Prisma, sin Node.js modules)
// Usada SOLO en middleware para verificar el JWT
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.supplierId = (user as { supplierId?: string }).supplierId;
        token.redirect = (user as { redirect?: string }).redirect;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string | undefined;
      session.user.supplierId = token.supplierId as string | undefined;
      session.user.redirect = token.redirect as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
};
