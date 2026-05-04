'use client';

import { useEffect, useState, useCallback } from 'react';
import { Package, ChevronDown, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  getOrders, fetchOrders, updateSupplierPackage, subscribeOrders,
  LocalOrder, OrderStatus, STATUS_LABELS, STATUS_COLORS,
} from '@/lib/orders-store';
import { useAuth } from '@/lib/auth-context';

const PKG_STATUS_LABELS = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo para recoger',
  picked_up: 'Transportista recibió',
};

const PKG_STATUS_COLORS = {
  pending: 'text-orange-600 bg-orange-50 border-orange-200',
  preparing: 'text-blue-600 bg-blue-50 border-blue-200',
  ready: 'text-green-600 bg-green-50 border-green-200',
  picked_up: 'text-teal-600 bg-teal-50 border-teal-200',
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'processing', 'at_hub', 'shipped', 'delivered', 'returned'];

export default function SupplierPedidosPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const supplierId = user?.supplierId ?? '';

  const refresh = useCallback(() => setOrders(getOrders()), []);

  useEffect(() => {
    refresh();
    fetchOrders();
    return subscribeOrders(refresh);
  }, [refresh]);

  // Only show orders that contain items from this supplier
  const myOrders = supplierId
    ? orders.filter((o) =>
        o.supplierPackages?.some((p) => p.supplierId === supplierId) ||
        o.items.some((i) => i.supplierId === supplierId)
      )
    : orders;

  const filtered = filterStatus === 'all'
    ? myOrders
    : myOrders.filter((o) => o.status === filterStatus);

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = myOrders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const advancePackage = async (order: LocalOrder, nextStatus: 'preparing' | 'ready') => {
    if (!supplierId) return;
    updateSupplierPackage(order.id, supplierId, nextStatus);
    refresh();

    if (nextStatus === 'ready') {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'package_ready', supplierId, order }),
      }).catch(() => {});
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-body text-[#8F8780] uppercase tracking-widest mb-1">Portal Proveedor</p>
          <h1 className="text-2xl font-bold text-[#0A0A0A]">Pedidos MariasClub</h1>
          <p className="text-sm text-[#6B6359] font-body mt-1">
            {user?.name ? `${user.name} — solo tus pedidos` : 'Pedidos realizados en la tienda'}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-xs text-[#6B6359] hover:text-[#0A0A0A] border border-[#EDEBE8] px-3 py-2 rounded-xl transition-colors bg-white"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </button>
      </div>

      {/* Contadores por estado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { s: 'pending',    label: 'Pendientes',     color: '#F97316', bg: 'bg-orange-50' },
          { s: 'processing', label: 'Preparando',     color: '#3B82F6', bg: 'bg-blue-50'   },
          { s: 'at_hub',     label: 'En hub',         color: '#6366F1', bg: 'bg-indigo-50' },
          { s: 'shipped',    label: 'En camino',      color: '#8B5CF6', bg: 'bg-purple-50' },
          { s: 'delivered',  label: 'Entregados',     color: '#00C9B1', bg: 'bg-teal-50'   },
          { s: 'returned',   label: 'Devueltos',      color: '#C0392B', bg: 'bg-red-50'    },
        ].map(({ s, label, color, bg }) => (
          <div key={s} className={`${bg} border border-[#EDEBE8] rounded-xl p-4`}>
            <p className="text-2xl font-black font-body" style={{ color }}>{counts[s as OrderStatus] ?? 0}</p>
            <p className="text-xs text-[#6B6359] font-body mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
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
            {s === 'all' ? `Todos (${myOrders.length})` : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#EDEBE8] rounded-2xl p-12 text-center">
          <Package className="h-10 w-10 text-[#D9D5CF] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#0A0A0A]">Sin pedidos</p>
          <p className="text-xs text-[#8F8780] font-body mt-1">
            {myOrders.length === 0
              ? 'Cuando un cliente compre productos de tu catálogo, aparecerán aquí.'
              : 'No hay pedidos con ese filtro.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#F7F6F5]">
            {filtered.map((order) => {
              const myPkg = order.supplierPackages?.find((p) => p.supplierId === supplierId);
              const myItems = supplierId
                ? order.items.filter((i) => i.supplierId === supplierId)
                : order.items;

              return (
                <div key={order.id} className="px-5 py-4">
                  {/* Row header */}
                  <div
                    className="flex items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#0A0A0A] flex-shrink-0">{order.id}</span>
                      <span className="text-sm font-body text-[#6B6359] truncate">{order.customer.name}</span>
                      <span className="text-xs text-[#8F8780] font-body hidden sm:block">
                        {new Date(order.createdAt).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                      {myPkg && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PKG_STATUS_COLORS[myPkg.status]}`}>
                          {PKG_STATUS_LABELS[myPkg.status]}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-[#0A0A0A]">${order.total.toFixed(2)}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-[#8F8780] transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === order.id && (
                    <div className="mt-4 space-y-3 text-xs font-body text-[#6B6359] border-t border-[#F7F6F5] pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <p className="font-semibold text-[#0A0A0A] mb-0.5">Cliente</p>
                          <p>{order.customer.name}</p>
                          <p>{order.customer.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#0A0A0A] mb-0.5">Dirección de entrega</p>
                          <p>{order.customer.address}</p>
                          <p>{order.customer.zone}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#0A0A0A] mb-0.5">Pago</p>
                          <p className="capitalize">{order.paymentMethod}</p>
                          <p>{order.isAdvance ? `Anticipo $${order.amountPaid.toFixed(2)}` : 'Pago completo'}</p>
                        </div>
                      </div>

                      {/* Mis productos */}
                      <div>
                        <p className="font-semibold text-[#0A0A0A] mb-1">
                          Productos a preparar {supplierId ? '(tus artículos)' : ''}
                        </p>
                        <div className="space-y-1 bg-[#F7F6F5] rounded-xl p-3">
                          {myItems.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span>
                                {item.name} × {item.qty}
                                {(item.size || item.color) && (
                                  <span className="text-[#8F8780] ml-1">({[item.size, item.color].filter(Boolean).join(' · ')})</span>
                                )}
                              </span>
                              <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold text-[#0A0A0A] border-t border-[#EDEBE8] pt-1 mt-1">
                            <span>Subtotal mi paquete</span>
                            <span>${myItems.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Gestión de paquete */}
                      {myPkg ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#0A0A0A]">Estado de tu paquete:</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PKG_STATUS_COLORS[myPkg.status]}`}>
                              {PKG_STATUS_LABELS[myPkg.status]}
                            </span>
                          </div>
                          {myPkg.status === 'pending' && (
                            <button
                              onClick={() => advancePackage(order, 'preparing')}
                              className="w-full py-2.5 bg-[#3B82F6] text-white rounded-xl text-xs font-semibold hover:bg-[#2563EB] transition-colors"
                            >
                              Comenzar preparación
                            </button>
                          )}
                          {myPkg.status === 'preparing' && (
                            <button
                              onClick={() => advancePackage(order, 'ready')}
                              className="w-full py-2.5 bg-[#0A0A0A] text-white rounded-xl text-xs font-semibold hover:bg-[#00C9B1] transition-colors"
                            >
                              Listo para transportista
                            </button>
                          )}
                          {myPkg.status === 'ready' && (
                            <p className="text-xs text-green-600 font-semibold bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                              Paquete marcado como listo. Esperando al transportista.
                            </p>
                          )}
                          {myPkg.status === 'picked_up' && (
                            <p className="text-xs text-teal-600 font-semibold bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Transportista recibió este paquete ✓
                            </p>
                          )}
                        </div>
                      ) : (
                        /* Pedidos sin supplierPackages (pedidos legacy) — mostrar avance básico */
                        (order.status === 'shipped' || order.status === 'delivered') ? (
                          <p className="text-center text-[#8F8780] text-[11px]">
                            {order.status === 'shipped' ? 'Pedido en camino.' : 'Pedido entregado al cliente.'}
                          </p>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
