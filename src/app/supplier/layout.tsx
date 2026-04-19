'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Store, User, ExternalLink, AlertTriangle } from 'lucide-react';
import { SupplierProvider, useSupplier } from '@/lib/supplier-context';
import Image from 'next/image';

const navItems = [
  { label: 'Dashboard', href: '/supplier', icon: LayoutDashboard },
  { label: 'Inventario', href: '/supplier/inventario', icon: Package, badge: true },
  { label: 'Mi Tienda', href: '/supplier/tienda', icon: Store },
  { label: 'Perfil & Marca', href: '/supplier/perfil', icon: User },
];

function SidebarContent() {
  const pathname = usePathname();
  const { profile, lowStockCount } = useSupplier();

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-[#EDEBE8] flex flex-col min-h-screen">
      {/* Brand slot */}
      <div className="px-4 py-5 border-b border-[#EDEBE8]">
        {profile.logo ? (
          <div className="relative h-10 w-full mb-1">
            <Image src={profile.logo} alt={profile.storeName} fill className="object-contain object-left" />
          </div>
        ) : (
          <div
            className="h-10 w-full flex items-center px-2 rounded"
            style={{ backgroundColor: profile.brandColor }}
          >
            <span className="text-white font-bold text-sm truncate">{profile.storeName}</span>
          </div>
        )}
        <p className="text-[10px] text-[#8F8780] mt-1.5 font-body">Portal Proveedor</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const isActive = href === '/supplier' ? pathname === '/supplier' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-body transition-all ${
                isActive
                  ? 'bg-[#F0F7FF] text-[#1E3A5F] font-semibold'
                  : 'text-[#6B6359] hover:bg-[#F7F6F5] hover:text-[#0A0A0A]'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {badge && lowStockCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {lowStockCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Ver tienda */}
      <div className="px-3 py-4 border-t border-[#EDEBE8]">
        <a
          href={`/tienda/${profile.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-body font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: profile.brandColor }}
        >
          <Store className="h-4 w-4" />
          <span className="flex-1">Ver mi tienda</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </a>
      </div>
    </aside>
  );
}

function SupplierLayoutInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F6F5]">
      <SidebarContent />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupplierProvider>
      <SupplierLayoutInner>{children}</SupplierLayoutInner>
    </SupplierProvider>
  );
}
