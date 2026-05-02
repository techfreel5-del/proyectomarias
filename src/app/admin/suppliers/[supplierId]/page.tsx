'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';
import {
  ArrowLeft, Package, TrendingUp, AlertTriangle, DollarSign,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getSupplier, type SupplierRecord, type InventoryProduct } from '@/lib/suppliers-store';

const PAGE_SIZE = 15;

export default function AdminSupplierDetailPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = use(params);
  const [record, setRecord] = useState<SupplierRecord | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const r = getSupplier(supplierId);
    setRecord(r ?? null);
  }, [supplierId]);

  if (!record) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-56 px-8 py-16 text-center text-[#8F8780] font-body">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
          Proveedor no encontrado.{' '}
          <Link href="/admin/suppliers" className="text-[#3B82F6] hover:underline">Volver</Link>
        </main>
      </div>
    );
  }

  const { profile, inventory } = record;

  /* ── Stats ───────────────────────────────────────── */
  const inStockCount = inventory.filter((p) => p.active && p.stock > 0).length;
  const lowStockItems = inventory.filter((p) => p.active && p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = inventory.filter((p) => p.stock === 0).length;
  const totalValue = inventory.reduce((s, p) => s + p.price * p.stock, 0);

  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtPrice = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── Filtered + paginated inventory ──────────────── */
  const filtered = inventory.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function stockBadge(p: InventoryProduct) {
    if (p.stock === 0)
      return <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Agotado</span>;
    if (p.stock <= p.lowStockThreshold)
      return <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{p.stock} uds · Bajo</span>;
    return <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{p.stock} uds</span>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Breadcrumb + header */}
        <div>
          <Link
            href="/admin/suppliers"
            className="inline-flex items-center gap-1 text-xs text-[#8F8780] hover:text-[#0A0A0A] transition-colors mb-3 font-body"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Proveedores
          </Link>

          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: profile.brandColor }}
            >
              <span className="text-white text-lg font-bold">
                {profile.storeName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-[#0A0A0A]">{profile.storeName}</h1>
              <p className="text-xs text-[#8F8780] font-body">
                {record.email} · Alta {new Date(record.createdAt).toLocaleDateString('es-MX')}
                {!record.active && (
                  <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Inactivo
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total productos', value: inventory.length, icon: Package, color: '#3B82F6' },
            { label: 'En stock', value: inStockCount, icon: TrendingUp, color: '#10B981' },
            { label: 'Stock bajo / agotado', value: `${lowStockItems.length} / ${outOfStock}`, icon: AlertTriangle, color: '#EF4444' },
            { label: 'Valor inventario', value: `$${fmt(totalValue)}`, icon: DollarSign, color: '#8B5CF6' },
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

        {/* Alertas de stock bajo */}
        {lowStockItems.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
            <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {lowStockItems.length} producto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((p) => (
                <span key={p.id} className="text-[11px] font-body bg-white border border-orange-200 text-orange-700 px-2.5 py-1 rounded-lg">
                  {p.name} — {p.stock} uds
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Inventario */}
        <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F7F6F5] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#3B82F6]" />
              <h2 className="text-sm font-bold text-[#0A0A0A]">Inventario disponible</h2>
              <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] font-bold px-2 py-0.5 rounded-full border border-[#3B82F6]/20">
                {inventory.length}
              </span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre, SKU o categoría..."
              className="h-9 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] bg-[#FAFAFA] rounded-lg focus:outline-none focus:border-[#0A0A0A] w-64 max-w-full"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#8F8780] font-body text-sm">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {inventory.length === 0
                ? 'Este proveedor aún no tiene productos en su inventario.'
                : 'Sin resultados para la búsqueda.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F7F6F5]">
                      {['Producto', 'SKU', 'Categoría', 'Precio', 'Stock', 'Activo'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8F8780]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F6F5]">
                    {paginated.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-[#F7F6F5]"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#F7F6F5] flex items-center justify-center flex-shrink-0">
                                <Package className="h-4 w-4 text-[#C0BAB2]" />
                              </div>
                            )}
                            <span className="font-medium text-[#0A0A0A] leading-tight">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-[#6B6359]">{p.sku}</td>
                        <td className="px-5 py-3 text-[#6B6359] font-body">{p.category}</td>
                        <td className="px-5 py-3 font-semibold text-[#0A0A0A]">${fmtPrice(p.price)}</td>
                        <td className="px-5 py-3">{stockBadge(p)}</td>
                        <td className="px-5 py-3">
                          {p.active
                            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-[#C0BAB2]" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-[#F7F6F5] flex items-center justify-between">
                  <p className="text-xs text-[#8F8780] font-body">
                    {filtered.length} productos · página {page} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-[#EDEBE8] text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-[#EDEBE8] text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </div>
  );
}
