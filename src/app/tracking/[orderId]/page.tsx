'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TrackingTimeline } from '@/components/customer/TrackingTimeline';
import { trackingEvents, orders as mockOrders } from '@/lib/mock-data';
import { getOrder, LocalOrder, STATUS_LABELS } from '@/lib/orders-store';
import { Package, MapPin, Phone, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';

export default function TrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [localOrder, setLocalOrder] = useState<LocalOrder | null | undefined>(undefined);

  useEffect(() => {
    setLocalOrder(getOrder(orderId));
  }, [orderId]);

  // Still loading
  if (localOrder === undefined) return null;

  // Check mock-data orders
  const mockOrder = mockOrders.find((o) => o.id === orderId);

  // Not found in either
  if (!localOrder && !mockOrder) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 text-center">
        <Package className="h-16 w-16 text-[#D9D5CF] mb-4" />
        <h1 className="font-display text-2xl font-bold text-[#0A0A0A] mb-2">Pedido no encontrado</h1>
        <p className="text-[#6B6359] font-body mb-6">No existe ningún pedido con el ID <strong>{orderId}</strong>.</p>
        <Link href="/tracking" className="px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#00C9B1] transition-colors">
          Buscar otro pedido
        </Link>
      </div>
    );
  }

  // If it's a localStorage order, show custom timeline
  if (localOrder) {
    const PHASES = [
      { key: 'pending', label: 'Pedido recibido', sub: 'Tu pedido fue registrado correctamente' },
      { key: 'processing', label: 'Preparando pedido', sub: 'El proveedor está empacando tu pedido' },
      { key: 'shipped', label: 'En camino', sub: 'Tu pedido está en ruta hacia tu domicilio' },
      { key: 'delivered', label: 'Entregado', sub: '¡Tu pedido llegó a su destino!' },
    ] as const;

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(localOrder.status);

    const PAYMENT_LABELS: Record<string, string> = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      card: 'Tarjeta',
    };

    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Seguimiento</p>
            <h1 className="font-display text-4xl font-black text-[#0A0A0A] mb-1">{orderId}</h1>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${localOrder.status === 'delivered' ? 'text-teal-600 bg-teal-50 border-teal-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>
              {STATUS_LABELS[localOrder.status]}
            </span>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 mb-6">
            <div className="relative">
              {PHASES.map((phase, idx) => {
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                  <div key={phase.key} className="flex gap-4 mb-6 last:mb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all ${done ? 'bg-[#00C9B1] border-[#00C9B1]' : 'border-[#EDEBE8] bg-white'} ${active ? 'ring-4 ring-[#00C9B1]/20' : ''}`}>
                        {done ? (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#EDEBE8]" />
                        )}
                      </div>
                      {idx < PHASES.length - 1 && (
                        <div className={`w-0.5 h-10 mt-1 ${idx < currentIdx ? 'bg-[#00C9B1]' : 'bg-[#EDEBE8]'}`} />
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-semibold text-sm ${done ? 'text-[#0A0A0A]' : 'text-[#8F8780]'}`}>{phase.label}</p>
                      <p className={`text-xs font-body mt-0.5 ${done ? 'text-[#6B6359]' : 'text-[#C0BAB2]'}`}>{phase.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order details */}
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 mb-4">
            <h3 className="font-semibold text-[#0A0A0A] mb-4">Detalles del pedido</h3>
            <div className="space-y-3">
              {localOrder.items.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex justify-between text-sm font-body">
                  <div>
                    <span className="text-[#6B6359]">{item.name} × {item.qty}</span>
                    {(item.color || item.size) && (
                      <p className="text-xs text-[#8F8780] mt-0.5">{[item.color, item.size].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                  <span className="font-semibold flex-shrink-0 ml-4">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-[#EDEBE8] pt-3 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span>${localOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 grid grid-cols-2 gap-4 text-sm font-body">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#8F8780] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#8F8780] mb-0.5">Dirección</p>
                <p className="text-[#0A0A0A]">{localOrder.customer.address}</p>
                <p className="text-[#6B6359]">{localOrder.customer.zone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-[#8F8780] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#8F8780] mb-0.5">Contacto</p>
                <p className="text-[#0A0A0A]">{localOrder.customer.name}</p>
                <p className="text-[#6B6359]">{localOrder.customer.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-[#8F8780] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#8F8780] mb-0.5">Pago</p>
                <p className="text-[#0A0A0A]">{PAYMENT_LABELS[localOrder.paymentMethod] ?? localOrder.paymentMethod}</p>
                <p className="text-[#6B6359]">{localOrder.isAdvance ? `Anticipo $${localOrder.amountPaid.toFixed(2)}` : 'Pago completo'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-[#8F8780] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#8F8780] mb-0.5">Fecha</p>
                <p className="text-[#0A0A0A]">{new Date(localOrder.createdAt).toLocaleDateString('es-MX')}</p>
                <p className="text-[#6B6359]">{new Date(localOrder.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fall back to mock-data TrackingTimeline
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <TrackingTimeline events={trackingEvents} orderId={orderId} />
    </div>
  );
}
