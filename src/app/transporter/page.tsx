'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Search, CheckCircle2, Package, Truck,
  Clock, TrendingUp, QrCode, FileText, MapPin,
  AlertTriangle, RefreshCw, Navigation,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/lib/auth-context';
import {
  getOrders, updateOrderStatus, subscribeOrders,
  LocalOrder, OrderStatus, STATUS_LABELS, STATUS_COLORS,
} from '@/lib/orders-store';

type Tab = 'escaner' | 'manifiesto' | 'ruta' | 'stats';

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'processing',
  processing: 'shipped',
};
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: 'Marcar en proceso',
  processing: 'Marcar en camino',
};

export default function TransporterPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('escaner');
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [searchId, setSearchId] = useState('');
  const [found, setFound] = useState<LocalOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [incidence, setIncidence] = useState('');

  const refresh = useCallback(() => setOrders(getOrders()), []);

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    refresh();
    return subscribeOrders(refresh);
  }, [user, router, refresh]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  const handleSearch = () => {
    const order = orders.find((o) => o.id.toLowerCase() === searchId.trim().toLowerCase());
    if (order) { setFound(order); setNotFound(false); }
    else { setFound(null); setNotFound(true); }
  };

  const handleAdvance = (order: LocalOrder) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    updateOrderStatus(order.id, next);
    setFound({ ...order, status: next });
    refresh();
  };

  const pending   = orders.filter((o) => o.status === 'pending');
  const processing = orders.filter((o) => o.status === 'processing');
  const shipped   = orders.filter((o) => o.status === 'shipped');
  const delivered = orders.filter((o) => o.status === 'delivered');
  const manifest  = [...pending, ...processing];

  return (
    <div className="min-h-screen bg-[#F7F6F5]">
      {/* Header — dark */}
      <header className="bg-[#0A0A0A] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <p className="text-[10px] font-body text-white/40 uppercase tracking-widest">Portal Transportista</p>
            <p className="text-sm font-bold text-white">{user?.name ?? 'Transportista'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white font-body">En ruta</span>
          </div>
          <button
            onClick={refresh}
            className="p-2 text-white/50 hover:text-white border border-white/20 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Tab nav — dark */}
      <div className="bg-[#0A0A0A] border-b border-white/10 px-4 sm:px-6">
        <div className="flex gap-0 max-w-5xl mx-auto overflow-x-auto">
          {([
            { id: 'escaner' as Tab,   label: 'Escáner',       icon: QrCode,      badge: 0 },
            { id: 'manifiesto' as Tab, label: 'Manifiesto',   icon: FileText,    badge: manifest.length },
            { id: 'ruta' as Tab,      label: 'Ruta',          icon: MapPin,      badge: shipped.length },
            { id: 'stats' as Tab,     label: 'Estadísticas',  icon: TrendingUp,  badge: 0 },
          ]).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === id
                  ? 'border-[#00C9B1] text-[#00C9B1]'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge > 0 && (
                <span className="bg-[#00C9B1] text-[#0A0A0A] text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ── ESCÁNER TAB ── */}
        {tab === 'escaner' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-[#0A0A0A]">Escáner de Pedidos</h2>
              <p className="text-xs text-[#8F8780] font-body mt-0.5">
                Busca un pedido por ID para verificar y actualizar su estado
              </p>
            </div>

            {/* Search */}
            <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F8780]" />
                  <input
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Ej: ORD-006"
                    className="w-full h-10 pl-9 pr-3 text-sm border border-[#EDEBE8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C9B1] font-body"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-5 h-10 bg-[#0A0A0A] text-white text-xs font-semibold rounded-xl hover:bg-[#00C9B1] transition-colors flex items-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  Buscar
                </button>
              </div>

              {notFound && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-body">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  Pedido <strong>{searchId}</strong> no encontrado.
                </div>
              )}

              {found && (
                <div className="p-4 bg-[#F7F6F5] border border-[#EDEBE8] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base">{found.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[found.status]}`}>
                      {STATUS_LABELS[found.status]}
                    </span>
                  </div>
                  <div className="text-xs font-body text-[#6B6359] space-y-1">
                    <p><span className="font-semibold text-[#0A0A0A]">Cliente:</span> {found.customer.name}</p>
                    <p><span className="font-semibold text-[#0A0A0A]">Destino:</span> {found.customer.address}, {found.customer.zone}</p>
                    <p><span className="font-semibold text-[#0A0A0A]">Productos:</span> {found.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</p>
                    <p><span className="font-semibold text-[#0A0A0A]">Total:</span> ${found.total.toFixed(2)}</p>
                  </div>
                  {NEXT_STATUS[found.status] ? (
                    <button
                      onClick={() => handleAdvance(found)}
                      className="w-full h-10 bg-[#0A0A0A] text-white text-xs font-semibold rounded-xl hover:bg-[#00C9B1] transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {NEXT_LABEL[found.status]}
                    </button>
                  ) : (
                    <p className="text-center text-xs text-[#8F8780] font-body">
                      {found.status === 'shipped'
                        ? 'En camino — asignado al repartidor.'
                        : found.status === 'delivered'
                        ? 'Pedido entregado al cliente.'
                        : 'Sin acción disponible.'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recent orders list */}
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] mb-3">Pedidos recientes</h3>
              {orders.length === 0 ? (
                <div className="bg-white border border-[#EDEBE8] rounded-2xl p-8 text-center text-xs text-[#8F8780] font-body">
                  Sin pedidos registrados. Realiza una compra en la tienda para verlos aquí.
                </div>
              ) : (
                <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
                  <div className="divide-y divide-[#F7F6F5]">
                    {orders.slice(0, 10).map((order) => (
                      <div
                        key={order.id}
                        onClick={() => { setFound(order); setNotFound(false); setSearchId(order.id); }}
                        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-[#F7F6F5] transition-colors"
                      >
                        <div className="w-8 h-8 bg-[#F7F6F5] rounded-lg flex items-center justify-center flex-shrink-0">
                          <QrCode className="h-4 w-4 text-[#D9D5CF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0A0A0A]">{order.customer.name || 'Sin nombre'}</p>
                          <p className="text-[10px] text-[#8F8780] font-body">{order.id} · {order.customer.zone}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MANIFIESTO TAB ── */}
        {tab === 'manifiesto' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-[#0A0A0A]">Manifiesto de carga</h2>
                <p className="text-xs text-[#8F8780] font-body mt-0.5">Pedidos pendientes de procesar o enviar</p>
              </div>
              <button
                onClick={refresh}
                className="flex items-center gap-1.5 text-xs border border-[#EDEBE8] px-3 py-1.5 rounded-lg bg-white text-[#6B6359] hover:text-[#0A0A0A] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Actualizar
              </button>
            </div>

            {/* Status counters */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Pendientes',  value: pending.length,    color: '#F97316' },
                { label: 'En proceso',  value: processing.length, color: '#3B82F6' },
                { label: 'En camino',   value: shipped.length,    color: '#8B5CF6' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-[#EDEBE8] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-[#8F8780] font-body mt-1">{label}</p>
                </div>
              ))}
            </div>

            {manifest.length === 0 ? (
              <div className="bg-white border border-[#EDEBE8] rounded-2xl p-10 text-center">
                <Package className="h-10 w-10 text-[#D9D5CF] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0A0A0A]">Manifiesto vacío</p>
                <p className="text-xs text-[#8F8780] font-body mt-1">No hay pedidos pendientes de procesar.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
                <div className="divide-y divide-[#F7F6F5]">
                  {manifest.map((order) => (
                    <div key={order.id} className="px-5 py-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-[#0A0A0A]">{order.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>
                        <p className="text-sm font-body text-[#0A0A0A]">{order.customer.name}</p>
                        <p className="text-xs text-[#8F8780] font-body">
                          {order.customer.zone} · {order.items.length} producto(s) · ${order.total.toFixed(2)}
                        </p>
                      </div>
                      {NEXT_STATUS[order.status] && (
                        <button
                          onClick={() => { updateOrderStatus(order.id, NEXT_STATUS[order.status]!); refresh(); }}
                          className="text-[10px] font-semibold px-3 py-2 bg-[#0A0A0A] text-white rounded-xl hover:bg-[#00C9B1] transition-colors whitespace-nowrap flex-shrink-0"
                        >
                          {NEXT_LABEL[order.status]}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RUTA TAB ── */}
        {tab === 'ruta' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-[#0A0A0A]">Ruta activa</h2>
              <p className="text-xs text-[#8F8780] font-body mt-0.5">Estado del trayecto y pedidos en tránsito</p>
            </div>

            {/* Route card */}
            <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#0A0A0A]">Zamora → Jiquilpan</h3>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                  En ruta
                </span>
              </div>
              <div className="flex items-stretch gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#00C9B1] border-2 border-white shadow mt-1" />
                  <div className="flex-1 w-0.5 bg-[#EDEBE8] my-1.5" />
                  <div className="w-3 h-3 rounded-full bg-[#0A0A0A] border-2 border-white shadow mb-1" />
                </div>
                <div className="flex flex-col justify-between text-xs font-body gap-4">
                  <div>
                    <p className="font-semibold text-[#0A0A0A]">Origen — Zamora Centro</p>
                    <p className="text-[#8F8780]">Bodega MariasClub · Salida 10:00 AM</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A0A0A]">Destino — Jiquilpan</p>
                    <p className="text-[#8F8780]">ETA: 45 min · 32 km</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#EDEBE8]">
                {[
                  { label: 'Distancia', value: '32 km' },
                  { label: 'ETA', value: '~45 min' },
                  { label: 'En tránsito', value: `${shipped.length} pedido(s)` },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-base font-bold text-[#0A0A0A]">{value}</p>
                    <p className="text-[10px] text-[#8F8780] font-body">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* En tránsito */}
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-600" />
                Pedidos en tránsito ({shipped.length})
              </h3>
              {shipped.length === 0 ? (
                <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 text-center text-xs text-[#8F8780] font-body">
                  No hay pedidos en tránsito actualmente.
                </div>
              ) : (
                <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
                  <div className="divide-y divide-[#F7F6F5]">
                    {shipped.map((order) => (
                      <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                        <Navigation className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#0A0A0A]">{order.id}</p>
                          <p className="text-xs text-[#6B6359] font-body">{order.customer.name} · {order.customer.zone}</p>
                        </div>
                        <span className="text-xs font-bold text-[#0A0A0A]">${order.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Incidencias */}
            <div className="bg-white border border-[#EDEBE8] rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Reportar incidencia
              </h3>
              <p className="text-xs text-[#8F8780] font-body">¿Ocurrió algún problema durante el trayecto?</p>
              <textarea
                value={incidence}
                onChange={(e) => setIncidence(e.target.value)}
                className="w-full h-20 px-3 py-2 text-xs border border-[#EDEBE8] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#00C9B1] font-body"
                placeholder="Describe el incidente: retraso, accidente, pedido dañado, cliente no disponible..."
              />
              <button
                onClick={() => { alert('Reporte enviado (simulado)'); setIncidence(''); }}
                disabled={!incidence.trim()}
                className="w-full py-2 border border-[#EDEBE8] rounded-xl text-xs font-semibold text-[#6B6359] hover:border-orange-400 hover:text-orange-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enviar reporte
              </button>
            </div>
          </div>
        )}

        {/* ── ESTADÍSTICAS TAB ── */}
        {tab === 'stats' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-bold text-[#0A0A0A]">Estadísticas</h2>
              <p className="text-xs text-[#8F8780] font-body mt-0.5">Rendimiento de la jornada actual</p>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total pedidos',  value: orders.length,    color: '#3B82F6', icon: Package },
                { label: 'En tránsito',    value: shipped.length,   color: '#8B5CF6', icon: Truck },
                { label: 'Entregados',     value: delivered.length, color: '#00C9B1', icon: CheckCircle2 },
                { label: 'Pendientes',     value: manifest.length,  color: '#F97316', icon: Clock },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-white border border-[#EDEBE8] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-[#8F8780] font-body uppercase tracking-wider leading-tight">{label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="bg-white border border-[#EDEBE8] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0A0A0A]">Tasa de progreso</h3>
              {[
                { label: 'Entregados',  count: delivered.length,  color: '#00C9B1' },
                { label: 'En camino',   count: shipped.length,    color: '#8B5CF6' },
                { label: 'En proceso',  count: processing.length, color: '#3B82F6' },
                { label: 'Pendientes',  count: pending.length,    color: '#F97316' },
              ].map(({ label, count, color }) => {
                const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-body mb-1.5">
                      <span className="text-[#6B6359]">{label}</span>
                      <span className="font-semibold text-[#0A0A0A]">{count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 bg-[#F7F6F5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Valor de carga */}
            <div className="bg-white border border-[#EDEBE8] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0A0A0A]">Valor de carga</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'En tránsito',  value: shipped.reduce((s, o) => s + o.total, 0),    color: '#8B5CF6' },
                  { label: 'Entregado',    value: delivered.reduce((s, o) => s + o.total, 0),   color: '#00C9B1' },
                  { label: 'Por procesar', value: manifest.reduce((s, o) => s + o.total, 0),    color: '#F97316' },
                  { label: 'Total general',value: orders.reduce((s, o) => s + o.total, 0),      color: '#0A0A0A' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-[#F7F6F5] rounded-xl p-3">
                    <p className="text-[10px] text-[#8F8780] font-body uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-xl font-bold" style={{ color }}>${value.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
