'use client';

import Link from 'next/link';
import { Package, TrendingUp, AlertTriangle, DollarSign, ArrowRight, Plus } from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';
import { LocalOrdersPanel } from '@/components/shared/LocalOrdersPanel';


export default function SupplierDashboard() {
  const { inventory, profile, lowStockCount } = useSupplier();

  const totalProducts = inventory.length;
  const inStock = inventory.filter((p) => p.active && p.stock > 0).length;
  const inventoryValue = inventory.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = inventory.filter((p) => p.active && p.stock <= p.lowStockThreshold);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <p className="text-xs font-body text-[#8F8780] uppercase tracking-widest mb-1">
          Bienvenido de nuevo
        </p>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">{profile.storeName}</h1>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Total Productos', value: totalProducts, icon: Package, color: '#3B82F6' },
          { label: 'En Stock', value: inStock, icon: TrendingUp, color: '#10B981' },
          { label: 'Stock Bajo', value: lowStockCount, icon: AlertTriangle, color: '#EF4444' },
          { label: 'Valor Inventario', value: `$${inventoryValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: '#8B5CF6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-[#EDEBE8] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-body text-[#8F8780] uppercase tracking-wider">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Low stock alerts */}
        <div className="bg-white border border-[#EDEBE8] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Alertas de Stock
            </h2>
            <Link href="/supplier/inventario" className="text-xs text-[#3B82F6] hover:underline font-body">
              Ver todo →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-[#8F8780] font-body py-4 text-center">Sin alertas activas</p>
          ) : (
            <div className="space-y-2">
              {lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#F7F6F5] last:border-0">
                  <div>
                    <p className="text-sm font-body font-medium text-[#0A0A0A]">{p.name}</p>
                    <p className="text-xs text-[#8F8780] font-body">{p.sku}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/supplier/inventario"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 border border-dashed border-[#EDEBE8] rounded-lg text-xs font-body text-[#8F8780] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajustar inventario
          </Link>
        </div>

        {/* Recent orders */}
        <LocalOrdersPanel title="Pedidos Recientes" />
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Agregar Producto', href: '/supplier/inventario', color: profile.brandColor },
          { label: 'Editar Perfil & Marca', href: '/supplier/perfil', color: '#6B7280' },
          { label: 'Vista Mi Tienda', href: '/supplier/tienda', color: '#8B5CF6' },
        ].map(({ label, href, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: color }}
          >
            {label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ))}
      </div>
    </div>
  );
}
