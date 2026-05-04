'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'proveedor' | 'transportista' | 'repartidor' | 'cliente';

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  redirect: string;
  supplierId?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();

  const user: AuthUser | null = session?.user
    ? {
        email: session.user.email ?? '',
        role: (session.user.role as UserRole) ?? 'cliente',
        name: session.user.name ?? '',
        redirect: (session.user.redirect as string) ?? '/',
        supplierId: session.user.supplierId as string | undefined,
      }
    : null;

  // login() no se usa directamente — el login real ocurre en login/page.tsx via signIn()
  const login = (_user: AuthUser) => {};

  const logout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
