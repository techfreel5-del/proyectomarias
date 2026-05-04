'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Package, TrendingUp, AlertTriangle, DollarSign, ArrowRight, Plus,
  ShoppingBag, Store, Lock, ChevronDown, CheckCircle2, Clock,
} from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';
import { useAuth } from '@/lib/auth-context';
import {
  getOrders, fetchOrders, subscribeOrders, LocalOrder,
  STATUS_LABELS, STATUS_COLORS,
} from '@/lib/orders-store';
import { getSupplierWholesaleRate } from '@/lib/pricing-store';

export default function SupplierDashboard() {
  const { inventory, profile, lowStockCount } = useSupplier();
  const { user } = useAuth();
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [expandedMC, setExpandedMC] = useState<string | null>(null);
  const [expandedOwn, setExpandedOwn] = useState<string | null>(null);

  const refresh = useCallback(() => setOrders(getOrders()), []);
  useEffect(() => {
    refresh();
    fetchOrders();
    return subscribeOrders(refresh);
  }, [refresh]);

  /* ── Métricas de inventario ─────────────────────────────── */
  const totalProducts = inventory.length;
  const inStock = inventory.filter((p) => p.active && p.stock > 0).length;
  const inventoryValue = inventory.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStock = inventory.filter((p) => p.active && p.stock <= p.lowStockThreshold);

  const supplierId = user?.supplierId ?? '';
  const wholesaleRate = getSupplierWholesaleRate(supplierId);

  /* ── Separar pedidos ────────────────────────────────────── */
  // Pedidos de MariasClub: tienen supplierPackages y el paquete pertenece a este proveedor
  const mcOrders = orders.filter((o) =>
    o.supplierPackages?.some((p) => p.supplierId === supplierId),
  );
  // Pedidos de tienda propia: tienen supplierSlug con el slug del proveedor
  const ownOrders = orders.filter((o) => o.supplierSlug === profile.slug);

  /* ── Cálculo de mayoreo ─────────────────────────────────── */
  const getWholesaleAmount = (order: LocalOrder): number => {
    const myItems = order.items.filter((i) => i.supplierId === supplierId);
    const retail = myItems.reduce((s, i) => s + i.price * i.qty, 0);
    return retail * (wholesaleRate / 100);
  };

  const pendingPayOrders = mcOrders.filter(
    (o) => o.supplierPayments?.[supplierId]?.status !== 'paid',
  );
  const paidOrders = mcOrders.filter(
    (o) => o.supplierPayments?.[supplierId]?.status === 'paid',
  );
  const totalPending = pendingPayOrders.reduce((s, o) => s + getWholesaleAmount(o), 0);
  const totalPaid    = paidOrders.reduce((s, o) => s + getWholesaleAmount(o), 0);

  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-7">

      {/* ── Encabezado ─────────────────────────────────────── */}
      <div>
        <p className="text-xs font-body text-[#8F8780] uppercase tracking-widest mb-1">
          Bienvenido de nuevo
        </p>
        <h1 className="text-2xl font-bold text-[#0A0A0A]">{profile.storeName}</h1>
      </div>

      {/* ── Métricas de inventario ──────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Productos', value: totalProducts, icon: Package,       color: '#3B82F6' },
          { label: 'En Stock',        value: inStock,       icon: TrendingUp,    color: '#10B981' },
          { label: 'Stock Bajo',      value: lowStockCount, icon: AlertTriangle, color: '#EF4444' },
          {
            label: 'Valor Inventario',
            value: `$${inventoryValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`,
            icon: DollarSign, color: '#8B5CF6',
          },
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

      {/* ── PEDIDOS MARIASCLUB ──────────────────────────────── */}
      <section className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F7F6F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#00C9B1]" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Pedidos MariasClub</h2>
            <span className="text-[10px] bg-[#00C9B1]/10 text-[#00C9B1] font-bold px-2 py-0.5 rounded-full border border-[#00C9B1]/20">
              {mcOrders.length}
            </span>
          </div>
          <Link href="/supplier/pedidos" className="text-xs text-[#00C9B1] hover:underline font-semibold">
            Gestionar →
          </Link>
        </div>

        {/* Resumen quick */}
        <div className="grid grid-cols-3 divide-x divide-[#F7F6F5] border-b border-[#F7F6F5]">
          <div className="px-5 py-3">
            <p className="text-[10px] text-[#8F8780] uppercase tracking-wider font-body mb-0.5">Activos</p>
            <p className="text-xl font-black text-[#0A0A0A]">
              {mcOrders.filter((o) => !['delivered', 'returned'].includes(o.status)).length}
            </p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] text-[#8F8780] uppercase tracking-wider font-body mb-0.5">Por cobrar (mayoreo)</p>
            <p className="text-xl font-black text-orange-500">${fmt(totalPending)}</p>
          </div>
          <div className="px-5 py-3">
            <p className="text-[10px] text-[#8F8780] uppercase tracking-wider font-body mb-0.5">Ya cobrado</p>
            <p className="text-xl font-black text-green-600">${fmt(totalPaid)}</p>
          </div>
        </div>

        {/* Lista */}
        {mcOrders.length === 0 ? (
          <div className="text-center py-10 text-[#8F8780] font-body text-sm">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Sin pedidos de MariasClub aún
          </div>
        ) : (
          <div className="divide-y divide-[#F7F6F5]">
            {mcOrders.slice(0, 6).map((order) => {
              const wholesale = getWholesaleAmount(order);
              const isPaid = order.supplierPayments?.[supplierId]?.status === 'paid';
              const myPkg = order.supplierPackages?.find((p) => p.supplierId === supplierId);
              const isExp = expandedMC === order.id;

              return (
                <div key={order.id} className="px-5 py-3">
                  <div
                    className="flex items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setExpandedMC(isExp ? null : order.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#0A0A0A] flex-shrink-0">{order.id}</span>
                      <span className="text-xs text-[#6B6359] font-body truncate">{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="text-xs font-black text-[#00C9B1]">${fmt(wholesale)}</span>
                      {isPaid
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        : <Clock className="h-4 w-4 text-orange-400 flex-shrink-0" />}
                      <ChevronDown className={`h-3.5 w-3.5 text-[#8F8780] transition-transform ${isExp ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExp && (
                    <div className="mt-3 pt-3 border-t border-[#F7F6F5] text-xs font-body text-[#6B6359] space-y-3">
                      {/* Mis productos + desglose menudeo/mayoreo */}
                      <div>
                        <p className="font-semibold text-[#0A0A0A] mb-1.5">Mis productos en este pedido</p>
                        <div className="space-y-1">
                          {order.items.filter((i) => i.supplierId === supplierId).map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-[#F7F6F5] px-3 py-2 rounded-lg">
                              <span>{item.name} <span className="text-[#C0BAB2]">×{item.qty}</span></span>
                              <div className="flex gap-4 text-right">
                                <div>
                                  <p className="text-[10px] text-[#8F8780]">Menudeo</p>
                                  <p className="font-semibold">${(item.price * item.qty).toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-[#00C9B1]">A cobrar</p>
                                  <p className="font-bold text-[#00C9B1]">${(item.price * item.qty * wholesaleRate / 100).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between px-3 pt-1 font-bold text-[#0A0A0A]">
                            <span>Total a cobrar (mayoreo)</span>
                            <span className="text-[#00C9B1]">${fmt(wholesale)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Estado de pago y paquete */}
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#0A0A0A]">Pago MariasClub:</span>
                          {isPaid ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              Saldado
                              {order.supplierPayments?.[supplierId]?.paidAt
                                ? ` — ${new Date(order.supplierPayments[supplierId].paidAt!).toLocaleDateString('es-MX')}`
                                : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                              Pendiente de cobro
                            </span>
                          )}
                        </div>
                        {myPkg && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#0A0A0A]">Mi paquete:</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              myPkg.status === 'picked_up' ? 'text-teal-600 bg-teal-50 border-teal-200' :
                              myPkg.status === 'ready'     ? 'text-green-600 bg-green-50 border-green-200' :
                              myPkg.status === 'preparing' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                              'text-orange-600 bg-orange-50 border-orange-200'
                            }`}>
                              {myPkg.status === 'picked_up' ? 'Recogido' :
                               myPkg.status === 'ready'     ? 'Listo' :
                               myPkg.status === 'preparing' ? 'Preparando' : 'Pendiente'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {mcOrders.length > 6 && (
          <div className="px-5 py-3 border-t border-[#F7F6F5] text-center">
            <Link href="/supplier/pedidos" className="text-xs text-[#00C9B1] hover:underline font-semibold">
              Ver {mcOrders.length - 6} pedidos más →
            </Link>
          </div>
        )}
      </section>

      {/* ── PEDIDOS DE MI TIENDA ───────────────────────────── */}
      <section className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F7F6F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4" style={{ color: profile.brandColor }} />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Pedidos de mi tienda</h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: profile.brandColor, borderColor: `${profile.brandColor}40`, backgroundColor: `${profile.brandColor}10` }}
            >
              {ownOrders.length}
            </span>
          </div>
          <a
            href={`/tienda/${profile.slug}`}
            target="_blank"
            className="text-xs text-[#6B6359] hover:text-[#0A0A0A] font-semibold transition-colors"
          >
            Abrir tienda →
          </a>
        </div>

        {ownOrders.length === 0 ? (
          <div className="text-center py-10 text-[#8F8780] font-body text-sm">
            <Store className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Sin pedidos de tu tienda aún
          </div>
        ) : (
          <div className="divide-y divide-[#F7F6F5]">
            {ownOrders.slice(0, 6).map((order) => {
              const isExp = expandedOwn === order.id;
              return (
                <div key={order.id} className="px-5 py-3">
                  <div
                    className="flex items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setExpandedOwn(isExp ? null : order.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#0A0A0A] flex-shrink-0">{order.id}</span>
                      <span className="text-xs text-[#6B6359] font-body truncate">{order.customer.name}</span>
                      <span className="text-[10px] text-[#8F8780] font-body hidden sm:block">
                        {order.shippingMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="text-xs font-bold text-[#0A0A0A]">${order.total.toFixed(2)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        order.paymentMethod === 'cash' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.paymentMethod === 'cash' ? 'Efectivo' : 'Transfer.'}
                      </span>
                      <ChevronDown className={`h-3.5 w-3.5 text-[#8F8780] transition-transform ${isExp ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExp && (
                    <div className="mt-3 pt-3 border-t border-[#F7F6F5] text-xs font-body text-[#6B6359] space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="font-semibold text-[#0A0A0A] mb-0.5">Cliente</p>
                          <p>{order.customer.name}</p>
                          <p>{order.customer.phone}</p>
                          {order.customer.address && order.customer.address !== '—' && (
                            <p className="text-[#8F8780]">{order.customer.address}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0A0A0A] mb-0.5">Entrega &amp; Pago</p>
                          <p>{order.shippingMethod ?? '—'}</p>
                          <p>{order.paymentMethod === 'cash' ? 'Efectivo en tienda' : 'Transferencia bancaria'}</p>
                          <p className="font-bold text-[#0A0A0A] mt-1">Total: ${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-[#0A0A0A] mb-1">Productos</p>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between bg-[#F7F6F5] px-3 py-1.5 rounded-lg">
                              <span>{item.name} <span className="text-[#C0BAB2]">×{item.qty}</span></span>
                              <span className="font-bold">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {ownOrders.length > 6 && (
          <div className="px-5 py-3 border-t border-[#F7F6F5] text-center">
            <span className="text-xs text-[#8F8780] font-body">+{ownOrders.length - 6} pedidos más</span>
          </div>
        )}
      </section>

      {/* ── CUENTAS POR COBRAR ─────────────────────────────── */}
      <section className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F7F6F5] flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#8B5CF6]" />
          <h2 className="text-sm font-bold text-[#0A0A0A]">Cuentas por cobrar — MariasClub</h2>
          <span className="text-[10px] text-[#8B5CF6] font-bold bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
            Privado
          </span>
        </div>

        <p className="px-5 pt-3 pb-0 text-[10px] text-[#8F8780] font-body">
          Información confidencial. Solo visible para ti y el administrador de MARIASCLUB™.
          Los montos reflejan el importe que recibirás por tus ventas en la plataforma.
        </p>

        {/* Totales */}
        <div className="grid grid-cols-2 gap-4 p-5">
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <p className="text-xs text-orange-700 font-semibold">Pendiente de cobro</p>
            </div>
            <p className="text-2xl font-black text-orange-500">${fmt(totalPending)}</p>
            <p className="text-[10px] text-orange-600/70 mt-0.5">
              {pendingPayOrders.length} pedido{pendingPayOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <p className="text-xs text-green-700 font-semibold">Ya cobrado</p>
            </div>
            <p className="text-2xl font-black text-green-600">${fmt(totalPaid)}</p>
            <p className="text-[10px] text-green-600/70 mt-0.5">
              {paidOrders.length} pedido{paidOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Detalle por pedido */}
        {mcOrders.length === 0 ? (
          <div className="text-center pb-8 text-[#8F8780] font-body text-sm">
            Sin pedidos de MariasClub registrados
          </div>
        ) : (
          <>
            <div className="px-5 pb-2">
              <p className="text-[10px] font-semibold text-[#8F8780] uppercase tracking-wider">Detalle por pedido</p>
            </div>
            <div className="divide-y divide-[#F7F6F5]">
              {mcOrders.map((order) => {
                const wholesale = getWholesaleAmount(order);
                const isPaid = order.supplierPayments?.[supplierId]?.status === 'paid';
                const paidAt = order.supplierPayments?.[supplierId]?.paidAt;
                return (
                  <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#0A0A0A]">{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8F8780] font-body mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('es-MX')} · {order.customer.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-[#00C9B1]">${fmt(wholesale)}</p>
                        <p className="text-[10px] text-[#8F8780] font-body">mayoreo</p>
                      </div>
                      {isPaid ? (
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg block whitespace-nowrap">
                            Saldado
                          </span>
                          {paidAt && (
                            <p className="text-[9px] text-[#8F8780] mt-0.5">
                              {new Date(paidAt).toLocaleDateString('es-MX')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg whitespace-nowrap">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="px-5 py-3 border-t border-[#F7F6F5]">
          <p className="text-[10px] text-[#8F8780] font-body text-center">
            El administrador de MARIASCLUB™ marca los pagos como saldados desde el panel de administración.
          </p>
        </div>
      </section>

      {/* ── Stock + Acciones rápidas ────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
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

        <div className="bg-white border border-[#EDEBE8] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#0A0A0A] mb-4">Acciones rápidas</h2>
          <div className="space-y-2">
            <Link
              href="/supplier/pedidos"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F0FDF9] border border-[#00C9B1]/20 text-sm font-semibold text-[#009E8C] hover:bg-[#00C9B1]/10 transition-colors"
            >
              Gestionar pedidos MariasClub
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/supplier/inventario"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F7F6F5] text-sm font-semibold text-[#0A0A0A] hover:bg-[#EDEBE8] transition-colors"
            >
              Gestionar inventario
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/supplier/perfil"
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F7F6F5] text-sm font-semibold text-[#0A0A0A] hover:bg-[#EDEBE8] transition-colors"
            >
              Configurar perfil
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
