'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';

export function ConditionalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWhiteLabel = pathname.startsWith('/tienda');

  if (isWhiteLabel) {
    return <main>{children}</main>;
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
