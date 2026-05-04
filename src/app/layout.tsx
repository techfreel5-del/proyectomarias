import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { ConditionalChrome } from '@/components/layout/ConditionalChrome';

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MARIASCLUB™ — Esenciales Curados',
    template: '%s | MARIASCLUB™',
  },
  description: 'Tienda multimarca: Moda, Hogar y Cocina, Deportes y Fitness, Electrónica. Entregamos en Zamora y alrededores.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A]">
        <SessionProvider>
        <AuthProvider>
          <CartProvider>
            <SmoothScrollProvider>
              <ConditionalChrome>
                {children}
              </ConditionalChrome>
            </SmoothScrollProvider>
          </CartProvider>
        </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
