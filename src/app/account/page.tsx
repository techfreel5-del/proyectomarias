'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ShoppingBag, MapPin, RotateCcw, LogOut, ChevronRight, Package } from 'lucide-react';
import { orders } from '@/lib/mock-data';

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'Enviado',
  delivered: 'Entregado',
  returned: 'Devuelto',
};

const statusColors: Record<string, string> = {
  pending: 'bg-[#FFF3CD] text-[#856404]',
  processing: 'bg-[#CCE5FF] text-[#004085]',
  shipped: 'bg-[#D4EDDA] text-[#155724]',
  delivered: 'bg-[#D4EDDA] text-[#155724]',
  returned: 'bg-[#F8D7DA] text-[#721C24]',
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  // Show first 3 mock orders as sample history
  const myOrders = orders.slice(0, 3);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8F8780] mb-1">Mi Cuenta</p>
            <h1 className="font-display text-2xl font-black text-[#0A0A0A]">Hola, {user.name}</h1>
            <p className="text-sm text-[#8F8780] mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-[#C0392B] hover:text-[#a93226] transition-colors mt-1"
          >
            <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
          </button>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Tienda', href: '/shop', icon: ShoppingBag },
            { label: 'Rastrear pedido', href: '/tracking', icon: MapPin },
            { label: 'Devoluciones', href: '/returns', icon: RotateCcw },
          ].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 py-5 bg-white border border-[#E0E0E0] hover:border-[#222222] hover:shadow-sm transition-all text-center"
            >
              <Icon className="h-5 w-5 text-[#00C9B1]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">{label}</span>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-[#E0E0E0]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F2F2]">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#8F8780]" />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#222222]">Pedidos recientes</h2>
            </div>
            <Link href="/tracking" className="text-[10px] text-[#00C9B1] hover:underline font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-[#F2F2F2]">
            {myOrders.map((order) => (
              <Link
                key={order.id}
                href={`/tracking/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-[#FAFAFA] transition-colors group"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-[#0A0A0A]">{order.id}</p>
                  <p className="text-xs text-[#8F8780] truncate max-w-[200px]">{order.product}</p>
                  <p className="text-[10px] text-[#B8B2A8]">{order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                    <p className="text-xs font-semibold text-[#0A0A0A] mt-1">${order.total.toFixed(2)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#C0BDB8] group-hover:text-[#222222] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Back to shop */}
        <p className="text-center">
          <Link href="/shop" className="text-xs text-[#8F8780] hover:text-[#222222] transition-colors underline underline-offset-2">
            ← Volver a la tienda
          </Link>
        </p>
      </div>
    </div>
  );
}
