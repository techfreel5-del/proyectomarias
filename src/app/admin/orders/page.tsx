'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  getOrders, fetchOrders, updateOrderStatus, markSupplierPaid, unmarkSupplierPaid,
  LocalOrder, OrderStatus, STATUS_LABELS, STATUS_COLORS, subscribeOrders,
} from '@/lib/orders-store';
import { Package, ChevronDown, RefreshCw, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'at_hub', 'shipped', 'delivered', 'returned'];

// Primary contextual action per status
const PRIMARY_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus; color: string }>> = {
  pending:    { label: 'Avanzar a Preparando', next: 'processing', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  processing: { label: 'Avanzar a En Hub',     next: 'at_hub',    color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
  at_hub:     { label: 'Asignar repartidor → En camino', next: 'shipped', color: 'bg-[#0A0A0A] hover:bg-[#00C9B1] text-white' },
  shipped:    { label: 'Confirmar entrega',    next: 'delivered', color: 'bg-teal-600 hover:bg-teal-700 text-white' },
};

export default function AdminOrdersPage() {
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showOverride, setShowOverride] = useState<string | null>(null);

  const refresh = useCallback(() => setLocalOrders(getOrders()), []);

  useEffect(() => {
    refresh();
    fetchOrders();
    return subscribeOrders(refresh);
  }, [refresh]);

  const filteredLocal = filterStatus === 'all'
    ? localOrders
    : localOrders.filter((o) => o.status === filterStatus);

  const totalAll = localOrders.length;

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = localOrders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">MARIASCLUB™</p>
            <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Gestión de Pedidos</h1>
          </div>
          <button onClick={refresh} className="flex items-center gap-1.5 text-xs text-[#6B6359] hover:text-[#0A0A0A] border border-[#EDEBE8] px-3 py-2 rounded-xl transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { s: 'pending',    label: 'Pendientes',  color: '#F97316', bg: 'bg-orange-50' },
            { s: 'processing', label: 'Preparando',  color: '#3B82F6', bg: 'bg-blue-50' },
            { s: 'at_hub',     label: 'En hub',      color: '#6366F1', bg: 'bg-indigo-50' },
            { s: 'shipped',    label: 'En camino',   color: '#8B5CF6', bg: 'bg-purple-50' },
            { s: 'delivered',  label: 'Entregados',  color: '#00C9B1', bg: 'bg-teal-50' },
            { s: 'returned',   label: 'Devueltos',   color: '#C0392B', bg: 'bg-red-50' },
          ].map(({ s, label, color, bg }) => (
            <div key={s} className={`${bg} border border-[#EDEBE8] rounded-xl p-4`}>
              <p className="text-2xl font-black font-body" style={{ color }}>{counts[s as OrderStatus] ?? 0}</p>
              <p className="text-xs text-[#6B6359] font-body mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap bg-white border border-[#EDEBE8] rounded-xl px-4 py-3">
          <span className="text-xs font-body font-semibold text-[#8F8780] uppercase tracking-wider mr-1">Filtrar:</span>
          {(['all', ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === s ? 'bg-[#0A0A0A] text-white font-semibold' : 'text-[#6B6359] hover:bg-[#F7F6F5]'
              }`}
            >
              {s === 'all' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-xs text-[#8F8780] font-body">{totalAll} pedidos en total</span>
        </div>

        {filteredLocal.length > 0 && (
          <div>
            <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
              <div className="divide-y divide-[#F7F6F5]">
                {filteredLocal.map((order) => {
                  const primary = PRIMARY_ACTION[order.status];
                  return (
                    <div key={order.id} className="px-5 py-3">
                      <div
                        className="flex items-center justify-between gap-3 cursor-pointer"
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs font-bold text-[#0A0A0A] flex-shrink-0">{order.id}</span>
                          <span className="text-sm font-body text-[#6B6359] truncate">{order.customer.name || 'Sin nombre'}</span>
                          <span className="text-xs text-[#8F8780] font-body hidden sm:block">{order.customer.zone}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                          <span className="text-xs font-semibold text-[#0A0A0A]">${order.total.toFixed(2)}</span>
                          <ChevronDown className={`h-3.5 w-3.5 text-[#8F8780] transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {expanded === order.id && (
                        <div className="mt-4 space-y-3 text-xs font-body text-[#6B6359] border-t border-[#F7F6F5] pt-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <p className="font-semibold text-[#0A0A0A] mb-0.5">Cliente</p>
                              <p>{order.customer.name}</p>
                              <p>{order.customer.phone}</p>
                              {order.customer.email && <p className="text-[#8F8780]">{order.customer.email}</p>}
                            </div>
                            <div>
                              <p className="font-semibold text-[#0A0A0A] mb-0.5">Dirección</p>
                              <p>{order.customer.address}</p>
                              <p>{order.customer.zone}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-[#0A0A0A] mb-0.5">Pago</p>
                              <p>{order.paymentMethod}</p>
                              <p>{order.isAdvance ? `Anticipo $${order.amountPaid.toFixed(2)}` : 'Completo'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-[#0A0A0A] mb-0.5">Fecha</p>
                              <p>{new Date(order.createdAt).toLocaleDateString('es-MX')}</p>
                              <p>{new Date(order.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold text-[#0A0A0A] mb-1">Productos</p>
                            <div className="space-y-1">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between">
                                  <span>{item.name} × {item.qty}{item.supplierId ? <span className="text-[#C0BAB2] ml-1">({item.supplierName ?? item.supplierId})</span> : null}</span>
                                  <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-bold text-[#0A0A0A] border-t border-[#F7F6F5] pt-1 mt-1">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Paquetes por proveedor */}
                          {order.supplierPackages && order.supplierPackages.length > 0 && (
                            <div>
                              <p className="font-semibold text-[#0A0A0A] mb-1">Paquetes</p>
                              <div className="space-y-1">
                                {order.supplierPackages.map((pkg) => (
                                  <div key={pkg.supplierId} className="flex items-center justify-between bg-[#F7F6F5] rounded-lg px-3 py-2">
                                    <span className="font-body">{pkg.supplierName}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      pkg.status === 'picked_up' ? 'text-teal-600 bg-teal-50 border-teal-200' :
                                      pkg.status === 'ready' ? 'text-green-600 bg-green-50 border-green-200' :
                                      pkg.status === 'preparing' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                                      'text-orange-600 bg-orange-50 border-orange-200'
                                    }`}>
                                      {pkg.status === 'picked_up' ? 'Recogido' : pkg.status === 'ready' ? 'Listo' : pkg.status === 'preparing' ? 'Preparando' : 'Pendiente'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pagos a proveedores — solo para pedidos MariasClub con paquetes */}
                          {order.supplierPackages && order.supplierPackages.length > 0 && (
                            <div>
                              <p className="font-semibold text-[#0A0A0A] mb-1">Pagos a proveedores</p>
                              <div className="space-y-1.5">
                                {order.supplierPackages.map((pkg) => {
                                  const isPaid = order.supplierPayments?.[pkg.supplierId]?.status === 'paid';
                                  const paidAt = order.supplierPayments?.[pkg.supplierId]?.paidAt;
                                  return (
                                    <div key={pkg.supplierId} className="flex items-center justify-between bg-[#F7F6F5] rounded-lg px-3 py-2 gap-3">
                                      <div className="min-w-0">
                                        <p className="font-semibold text-[#0A0A0A] text-xs">{pkg.supplierName}</p>
                                        {isPaid && paidAt && (
                                          <p className="text-[10px] text-green-600">
                                            Pagado el {new Date(paidAt).toLocaleDateString('es-MX')}
                                          </p>
                                        )}
                                      </div>
                                      {isPaid ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                                            Saldado
                                          </span>
                                          <button
                                            onClick={() => { unmarkSupplierPaid(order.id, pkg.supplierId); refresh(); }}
                                            className="text-[10px] text-[#8F8780] hover:text-red-500 transition-colors underline"
                                          >
                                            Deshacer
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => { markSupplierPaid(order.id, pkg.supplierId); refresh(); }}
                                          className="flex-shrink-0 text-[10px] font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                          Marcar pagado
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Status control — contextual */}
                          <div className="space-y-2 pt-1">
                            {/* Primary action */}
                            {primary && order.status !== 'delivered' && order.status !== 'returned' && (
                              <button
                                onClick={() => { updateOrderStatus(order.id, primary.next); refresh(); }}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${primary.color}`}
                              >
                                {primary.label}
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* Return action */}
                            {order.status !== 'returned' && (
                              <button
                                onClick={() => { updateOrderStatus(order.id, 'returned'); refresh(); }}
                                className="w-full py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50 transition-colors"
                              >
                                Marcar como Devuelto
                              </button>
                            )}

                            {/* Override libre (colapsable) */}
                            <button
                              onClick={() => setShowOverride(showOverride === order.id ? null : order.id)}
                              className="text-[10px] text-[#8F8780] hover:text-[#0A0A0A] transition-colors flex items-center gap-1 mx-auto"
                            >
                              <ChevronDown className={`h-3 w-3 transition-transform ${showOverride === order.id ? 'rotate-180' : ''}`} />
                              Cambio de estado manual
                            </button>
                            {showOverride === order.id && (
                              <div className="flex gap-2 flex-wrap pt-1">
                                {ALL_STATUSES.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => { updateOrderStatus(order.id, s); refresh(); setShowOverride(null); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                      order.status === s
                                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                                        : 'border-[#EDEBE8] text-[#6B6359] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                                    }`}
                                  >
                                    {STATUS_LABELS[s]}
                                  </button>
                                ))}
                              </div>
                            )}

                            <Link href={`/tracking/${order.id}`} target="_blank" className="block text-center text-xs text-[#00C9B1] hover:underline mt-1">
                              Ver tracking →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {filteredLocal.length === 0 && (
          <div className="text-center py-16 text-[#8F8780] font-body border border-[#EDEBE8] rounded-2xl bg-white">
            <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
            Sin pedidos con ese filtro.
          </div>
        )}

      </main>
    </div>
  );
}
