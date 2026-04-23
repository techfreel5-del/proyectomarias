'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';

const PORTAL_ROUTES = ['/admin', '/supplier', '/transporter', '/repartidor'];

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWhiteLabel = pathname.startsWith('/tienda');
  const isPortal = PORTAL_ROUTES.some(r => pathname.startsWith(r));

  if (isWhiteLabel || isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="pt-[88px]">{children}</main>
      <Footer />
    </>
  );
}
