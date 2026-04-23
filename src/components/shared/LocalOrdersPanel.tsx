'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOrders, updateOrderStatus, LocalOrder, OrderStatus, STATUS_LABELS, STATUS_COLORS, subscribeOrders } from '@/lib/orders-store';
import { Package, ChevronDown } from 'lucide-react';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: 'Marcar en proceso',
  processing: 'Marcar en camino',
  shipped: 'Marcar entregado',
};

interface Props {
  title?: string;
  filterStatus?: OrderStatus[];
  allowAdvance?: boolean;
  compact?: boolean;
}

export function LocalOrdersPanel({ title = 'Pedidos recientes', filterStatus, allowAdvance = false, compact = false }: Props) {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(() => {
    let all = getOrders();
    if (filterStatus) all = all.filter((o) => filterStatus.includes(o.status));
    setOrders(all);
  }, [filterStatus]);

  useEffect(() => {
    refresh();
    return subscribeOrders(refresh);
  }, [refresh]);

  const advance = (id: string, current: OrderStatus) => {
    const next = NEXT_STATUS[current];
    if (next) { updateOrderStatus(id, next); refresh(); }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 text-center">
        <p className="text-sm font-semibold text-[#0A0A0A] mb-3">{title}</p>
        <Package className="h-8 w-8 text-[#D9D5CF] mx-auto mb-2" />
        <p className="text-xs text-[#8F8780] font-body">Sin pedidos nuevos por ahora.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EDEBE8] flex items-center justify-between">
        <p className="font-semibold text-[#0A0A0A] text-sm">{title}</p>
        <span className="text-xs font-bold bg-[#0A0A0A] text-white px-2 py-0.5 rounded-full">{orders.length}</span>
      </div>
      <div className="divide-y divide-[#F7F6F5]">
        {orders.map((order) => (
          <div key={order.id} className="px-5 py-3">
            <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-xs font-bold text-[#0A0A0A] flex-shrink-0">{order.id}</span>
                <span className="text-sm font-body text-[#6B6359] truncate">{order.customer.name || 'Sin nombre'}</span>
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
              <div className="mt-3 space-y-2 text-xs font-body text-[#6B6359]">
                <p><span className="font-semibold text-[#0A0A0A]">Dirección:</span> {order.customer.address}, {order.customer.zone}</p>
                <p><span className="font-semibold text-[#0A0A0A]">Teléfono:</span> {order.customer.phone || '—'}</p>
                <div>
                  <span className="font-semibold text-[#0A0A0A]">Productos:</span>
                  <ul className="mt-1 space-y-0.5 ml-2">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} × {item.qty} — ${(item.price * item.qty).toFixed(2)}
                        {(item.color || item.size) && (
                          <span className="text-[#8F8780] ml-1">({[item.color, item.size].filter(Boolean).join(' · ')})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <p><span className="font-semibold text-[#0A0A0A]">Pago:</span> {order.isAdvance ? `Anticipo $${order.amountPaid.toFixed(2)} — Saldo $${(order.total - order.amountPaid).toFixed(2)}` : `Completo $${order.total.toFixed(2)}`}</p>
                {allowAdvance && NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => advance(order.id, order.status)}
                    className="mt-2 w-full py-2 bg-[#0A0A0A] text-white rounded-lg text-xs font-semibold hover:bg-[#00C9B1] transition-colors"
                  >
                    {NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
