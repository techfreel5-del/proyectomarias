'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, Phone, MapPin, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getOrders, updateOrderStatus, subscribeOrders, LocalOrder } from '@/lib/orders-store';

export function BalanceDue() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [confirmed, setConfirmed] = useState<string[]>([]);

  const refresh = useCallback(() => {
    setOrders(getOrders().filter((o) => o.status === 'shipped'));
  }, []);

  useEffect(() => {
    refresh();
    return subscribeOrders(refresh);
  }, [refresh]);

  const confirmDelivery = (id: string) => {
    updateOrderStatus(id, 'delivered');
    setConfirmed((prev) => [...prev, id]);
    refresh();
  };

  if (orders.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Package className="h-10 w-10 text-[#D9D5CF] mx-auto mb-3" />
        <p className="text-sm font-semibold text-[#0A0A0A]">Sin entregas pendientes</p>
        <p className="text-xs text-[#8F8780] font-body mt-1">Los pedidos en camino aparecen aquí.</p>
        <p className="text-[10px] text-[#C0BAB2] font-body mt-3">
          El admin debe marcar un pedido como "En camino" para que aparezca.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {orders.map((order) => {
        const isConfirmed = confirmed.includes(order.id);
        const balance = order.isAdvance ? order.total - order.amountPaid : 0;

        return (
          <div key={order.id} className="bg-white border border-[#EDEBE8] rounded-2xl shadow-sm p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-[#8F8780] mb-0.5">
                  Pedido {order.id}
                </p>
                {balance > 0 ? (
                  <>
                    <p className="text-2xl font-bold font-body text-[#0A0A0A]">${balance.toFixed(2)}</p>
                    <p className="text-[10px] text-orange-500 font-body font-semibold">Cobrar al entregar</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold font-body text-[#00C9B1]">Pagado</p>
                    <p className="text-[10px] text-[#8F8780] font-body">Sin saldo pendiente</p>
                  </>
                )}
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                En camino
              </span>
            </div>

            <Separator className="bg-[#EDEBE8]" />

            {/* Customer info */}
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-3.5 w-3.5 text-[#00C9B1] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold font-body text-[#0A0A0A]">{order.customer.name}</p>
                  <p className="text-xs text-[#8F8780] font-body">{order.customer.address}</p>
                  <p className="text-xs text-[#8F8780] font-body">{order.customer.zone}</p>
                </div>
              </div>
              {order.customer.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-3.5 w-3.5 text-[#00C9B1] flex-shrink-0" />
                  <p className="text-xs text-[#8F8780] font-body">{order.customer.phone}</p>
                </div>
              )}
            </div>

            <Separator className="bg-[#EDEBE8]" />

            {/* Products */}
            <div className="space-y-1.5">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs font-body">
                  <span className="text-[#8F8780]">{item.name} × {item.qty}</span>
                  <span className="font-semibold">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              {order.isAdvance && (
                <div className="flex justify-between text-xs font-body">
                  <span className="text-[#8F8780]">Anticipo pagado</span>
                  <span className="font-semibold text-[#00C9B1]">−${order.amountPaid.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold font-body border-t border-[#EDEBE8] pt-1.5">
                <span>{balance > 0 ? 'Saldo a cobrar' : 'Total pagado'}</span>
                <span className={balance > 0 ? 'text-[#C0392B]' : 'text-[#00C9B1]'}>
                  ${balance > 0 ? balance.toFixed(2) : order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={() => confirmDelivery(order.id)}
              disabled={isConfirmed}
              className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${
                isConfirmed
                  ? 'bg-[#00C9B1] text-white cursor-default'
                  : 'bg-[#00C9B1] text-white hover:bg-[#009E8C] active:scale-[0.98]'
              }`}
            >
              {isConfirmed ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  ¡Entrega Confirmada!
                </span>
              ) : 'Confirmar Entrega'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
