'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, DollarSign, MapPin, Package, TrendingUp, Users } from 'lucide-react';

const sideNavItems = [
  { label: 'Resumen', href: '/admin', icon: BarChart2 },
  { label: 'Proveedores', href: '/admin/suppliers', icon: Users },
  { label: 'Motor de Precios', href: '/admin/pricing', icon: DollarSign },
  { label: 'Zonas', href: '/admin/zones', icon: MapPin },
  { label: 'Pedidos', href: '/admin/orders', icon: Package },
  { label: 'Reportes', href: '/admin/reports', icon: TrendingUp },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-[#EDEBE8] px-4 py-6 fixed top-[88px] bottom-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8F8780] mb-4 px-2">Panel Admin</p>
      <nav className="space-y-1 flex-1">
        {sideNavItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-body font-medium transition-colors ${
                active
                  ? 'bg-[#F7F6F5] text-[#0A0A0A] font-semibold'
                  : 'text-[#6B6359] hover:bg-[#F7F6F5] hover:text-[#0A0A0A]'
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#EDEBE8] pt-4 mt-4">
        <div className="flex items-center gap-2 px-3">
          <div className="w-7 h-7 rounded-full bg-[#0A0A0A] flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">A</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A]">Admin</p>
            <p className="text-[10px] text-[#8F8780]">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
