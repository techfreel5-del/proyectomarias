'use client';

import { useEffect, useState, useCallback } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  getOrders, updateOrderStatus, LocalOrder, OrderStatus,
  STATUS_LABELS, STATUS_COLORS, subscribeOrders,
} from '@/lib/orders-store';
import { Package, ChevronDown, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'returned'];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

export default function AdminOrdersPage() {
  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(() => setLocalOrders(getOrders()), []);

  useEffect(() => {
    refresh();
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { s: 'pending', label: 'Pendientes', color: '#F97316', bg: 'bg-orange-50' },
            { s: 'processing', label: 'Procesando', color: '#3B82F6', bg: 'bg-blue-50' },
            { s: 'shipped', label: 'En camino', color: '#8B5CF6', bg: 'bg-purple-50' },
            { s: 'delivered', label: 'Entregados', color: '#00C9B1', bg: 'bg-teal-50' },
            { s: 'returned', label: 'Devueltos', color: '#C0392B', bg: 'bg-red-50' },
          ].map(({ s, label, color, bg }) => (
            <div key={s} className={`${bg} border border-[#EDEBE8] rounded-xl p-4`}>
              <p className="text-2xl font-black font-body" style={{ color }}>{counts[s as OrderStatus]}</p>
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
                {filteredLocal.map((order) => (
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
                                <span>{item.name} × {item.qty}</span>
                                <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between font-bold text-[#0A0A0A] border-t border-[#F7F6F5] pt-1 mt-1">
                              <span>Total</span>
                              <span>${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status control */}
                        <div className="flex items-center gap-2 pt-1">
                          <span className="font-semibold text-[#0A0A0A]">Cambiar estatus:</span>
                          <div className="flex gap-2 flex-wrap">
                            {ALL_STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => { updateOrderStatus(order.id, s); refresh(); }}
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
                          <Link
                            href={`/tracking/${order.id}`}
                            target="_blank"
                            className="ml-auto text-xs text-[#00C9B1] hover:underline"
                          >
                            Ver tracking →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
