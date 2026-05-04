import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: string;
      supplierId?: string;
      redirect?: string;
    };
  }

  interface User {
    role?: string;
    supplierId?: string;
    redirect?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    supplierId?: string;
    redirect?: string;
  }
}
