'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Flashlight, Search, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import {
  getOrders, updateOrderStatus, subscribeOrders,
  LocalOrder, STATUS_LABELS, STATUS_COLORS, OrderStatus,
} from '@/lib/orders-store';

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

export function QRScannerUI() {
  const frameRef = useRef<HTMLDivElement>(null);
  const cornerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [searchId, setSearchId] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [found, setFound] = useState<LocalOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  const refresh = useCallback(() => setOrders(getOrders()), []);
  useEffect(() => { refresh(); return subscribeOrders(refresh); }, [refresh]);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const corners = cornerRefs.current.filter(Boolean);
    gsap.from(corners, { scale: 0, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(2)' });
  }, []);

  const handleSearch = () => {
    const order = orders.find((o) => o.id.toLowerCase() === searchId.trim().toLowerCase());
    if (order) { setFound(order); setNotFound(false); }
    else { setFound(null); setNotFound(true); }
  };

  const handleAdvance = () => {
    if (!found) return;
    const next = NEXT_STATUS[found.status];
    if (next) {
      updateOrderStatus(found.id, next);
      setFound({ ...found, status: next });
      refresh();
    }
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60">Transportista</span>
        </div>
      </div>

      {/* Camera area */}
      <div className="flex-1 relative flex items-center justify-center px-8 py-6">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div ref={frameRef} className="relative w-56 h-56 sm:w-64 sm:h-64">
          {[
            'top-0 left-0 border-t-2 border-l-2 rounded-tl-sm',
            'top-0 right-0 border-t-2 border-r-2 rounded-tr-sm',
            'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm',
            'bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm',
          ].map((cls, i) => (
            <div key={i} ref={(el) => { cornerRefs.current[i] = el; }} className={`absolute w-8 h-8 border-[#00C9B1] ${cls}`} />
          ))}
          <div className="absolute inset-x-2 top-0 bottom-0 overflow-hidden">
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00C9B1] to-transparent" style={{ animation: 'scan-line 2s linear infinite' }} />
          </div>
          <div className="absolute inset-6 grid grid-cols-5 grid-rows-5 gap-0.5 opacity-20">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="bg-white rounded-sm" style={{ opacity: Math.random() > 0.4 ? 1 : 0 }} />
            ))}
          </div>
        </div>
        <p className="absolute bottom-8 text-xs text-white/60 text-center px-8">
          Apunta al código QR o busca el ID manualmente
        </p>
        <button className="absolute top-4 right-6 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <Flashlight className="h-4 w-4 text-white/70" />
        </button>
      </div>

      {/* Bottom panel */}
      <div className="bg-white rounded-t-2xl text-[#0A0A0A] p-5 max-h-[55%] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body text-base font-bold">Escáner de Pedidos</h2>
          <button
            onClick={() => { setShowInput(!showInput); setFound(null); setNotFound(false); }}
            className="flex items-center gap-1 text-xs text-[#00C9B1] font-semibold"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar por ID
          </button>
        </div>

        {/* Manual search */}
        {showInput && (
          <div className="mb-4 flex gap-2">
            <input
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="ej: ORD-006"
              className="flex-1 h-9 px-3 text-sm border border-[#EDEBE8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9B1] font-body"
            />
            <button
              onClick={handleSearch}
              className="px-4 h-9 bg-[#0A0A0A] text-white text-xs font-semibold rounded-lg hover:bg-[#00C9B1] transition-colors"
            >
              Buscar
            </button>
          </div>
        )}

        {/* Search result */}
        {notFound && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-body">
            No se encontró el pedido <strong>{searchId}</strong>.
          </div>
        )}
        {found && (
          <div className="mb-4 p-4 bg-[#F7F6F5] border border-[#EDEBE8] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">{found.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[found.status]}`}>
                {STATUS_LABELS[found.status]}
              </span>
            </div>
            <div className="text-xs font-body text-[#6B6359] space-y-1">
              <p><span className="font-semibold text-[#0A0A0A]">Cliente:</span> {found.customer.name}</p>
              <p><span className="font-semibold text-[#0A0A0A]">Dirección:</span> {found.customer.address}, {found.customer.zone}</p>
              <p><span className="font-semibold text-[#0A0A0A]">Total:</span> ${found.total.toFixed(2)}</p>
            </div>
            {NEXT_STATUS[found.status] && (
              <button
                onClick={handleAdvance}
                className="w-full h-9 bg-[#0A0A0A] text-white text-xs font-semibold rounded-lg hover:bg-[#00C9B1] transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {NEXT_LABEL[found.status]}
              </button>
            )}
          </div>
        )}

        {/* Recent orders list */}
        {recentOrders.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8F8780] mb-2">Pedidos recientes</p>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => { setFound(order); setNotFound(false); setShowInput(false); }}
                className="flex items-center gap-3 py-2.5 px-3 border border-[#EDEBE8] rounded-xl cursor-pointer hover:bg-[#F7F6F5] transition-colors"
              >
                <div className="w-8 h-8 bg-[#F7F6F5] rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-[#D9D5CF] rounded-[1px]" />)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold font-body">{order.customer.name || 'Sin nombre'}</p>
                  <p className="text-[10px] text-[#8F8780] font-body">{order.id} · {order.customer.zone}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#8F8780] font-body text-center py-4">
            Sin pedidos registrados aún. Haz una compra en la tienda para verlos aquí.
          </p>
        )}
      </div>
    </div>
  );
}
