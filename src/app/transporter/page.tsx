'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, Search, CheckCircle2, Package, Truck,
  Clock, TrendingUp, QrCode, FileText, MapPin,
  AlertTriangle, RefreshCw, Navigation, Warehouse,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/lib/auth-context';
import {
  getOrders, updateOrderStatus, updateSupplierPackage, allPackagesPickedUp, subscribeOrders,
  LocalOrder, OrderStatus, STATUS_LABELS, STATUS_COLORS,
} from '@/lib/orders-store';

type Tab = 'escaner' | 'manifiesto' | 'ruta' | 'stats';

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

  // Orders ready for transporter action: have at least one package in 'ready' status
  const manifestOrders = orders.filter((o) =>
    o.status === 'pending' || o.status === 'processing' ||
    o.supplierPackages?.some((p) => p.status === 'ready' || p.status === 'picked_up')
  );

  const shipped   = orders.filter((o) => o.status === 'shipped');
  const atHub     = orders.filter((o) => o.status === 'at_hub');
  const delivered = orders.filter((o) => o.status === 'delivered');

  const confirmPickup = (order: LocalOrder, supplierId: string) => {
    updateSupplierPackage(order.id, supplierId, 'picked_up');
    refresh();
    // Re-fetch fresh order after update
    const updated = getOrders().find((o) => o.id === order.id);
    if (found?.id === order.id && updated) setFound(updated);
  };

  const markAtHub = (orderId: string) => {
    updateOrderStatus(orderId, 'at_hub');
    refresh();
    const order = getOrders().find((o) => o.id === orderId);
    if (order) {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'at_hub', order }),
      }).catch(() => {});
    }
    if (found?.id === orderId) setFound({ ...found!, status: 'at_hub' });
  };

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
          <button onClick={refresh} className="p-2 text-white/50 hover:text-white border border-white/20 rounded-lg transition-colors" title="Actualizar">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Tab nav — dark */}
      <div className="bg-[#0A0A0A] border-b border-white/10 px-4 sm:px-6">
        <div className="flex gap-0 max-w-5xl mx-auto overflow-x-auto">
          {([
            { id: 'escaner' as Tab,    label: 'Escáner',      icon: QrCode,     badge: 0 },
            { id: 'manifiesto' as Tab, label: 'Manifiesto',   icon: FileText,   badge: manifestOrders.length },
            { id: 'ruta' as Tab,       label: 'Ruta',         icon: MapPin,     badge: shipped.length + atHub.length },
            { id: 'stats' as Tab,      label: 'Estadísticas', icon: TrendingUp, badge: 0 },
          ]).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === id ? 'border-[#00C9B1] text-[#00C9B1]' : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge > 0 && (
                <span className="bg-[#00C9B1] text-[#0A0A0A] text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">{badge}</span>
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
              <p className="text-xs text-[#8F8780] font-body mt-0.5">Busca un pedido por ID para verificar y actualizar su estado</p>
            </div>

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
                <button onClick={handleSearch} className="px-5 h-10 bg-[#0A0A0A] text-white text-xs font-semibold rounded-xl hover:bg-[#00C9B1] transition-colors flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" /> Buscar
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

                  {/* Package breakdown */}
                  {found.supplierPackages && found.supplierPackages.length > 0 && (
                    <PackageBreakdown
                      order={found}
                      onPickup={(sid) => confirmPickup(found, sid)}
                      onAtHub={() => markAtHub(found.id)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Recent orders list */}
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] mb-3">Pedidos recientes</h3>
              {orders.length === 0 ? (
                <div className="bg-white border border-[#EDEBE8] rounded-2xl p-8 text-center text-xs text-[#8F8780] font-body">
                  Sin pedidos registrados.
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
                <p className="text-xs text-[#8F8780] font-body mt-0.5">Confirma la recepción de cada paquete por proveedor</p>
              </div>
              <button onClick={refresh} className="flex items-center gap-1.5 text-xs border border-[#EDEBE8] px-3 py-1.5 rounded-lg bg-white text-[#6B6359] hover:text-[#0A0A0A] transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Actualizar
              </button>
            </div>

            {/* Status counters */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Pendientes',   value: orders.filter((o) => o.status === 'pending').length,    color: '#F97316' },
                { label: 'Preparando',   value: orders.filter((o) => o.status === 'processing').length, color: '#3B82F6' },
                { label: 'En hub',       value: atHub.length,                                            color: '#6366F1' },
                { label: 'En camino',    value: shipped.length,                                          color: '#8B5CF6' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-[#EDEBE8] rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-[#8F8780] font-body mt-1">{label}</p>
                </div>
              ))}
            </div>

            {manifestOrders.length === 0 ? (
              <div className="bg-white border border-[#EDEBE8] rounded-2xl p-10 text-center">
                <Package className="h-10 w-10 text-[#D9D5CF] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0A0A0A]">Manifiesto vacío</p>
                <p className="text-xs text-[#8F8780] font-body mt-1">No hay pedidos pendientes de recibir.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {manifestOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-[#EDEBE8] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-sm font-bold text-[#0A0A0A]">{order.id}</span>
                        <span className="ml-2 text-sm font-body text-[#6B6359]">{order.customer.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    {order.supplierPackages && order.supplierPackages.length > 0 ? (
                      <PackageBreakdown
                        order={order}
                        onPickup={(sid) => { updateSupplierPackage(order.id, sid, 'picked_up'); refresh(); }}
                        onAtHub={() => markAtHub(order.id)}
                      />
                    ) : (
                      <p className="text-xs text-[#8F8780] font-body">
                        {order.items.length} producto(s) · ${order.total.toFixed(2)} · {order.customer.zone}
                      </p>
                    )}
                  </div>
                ))}
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

            <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#0A0A0A]">Zamora → Jiquilpan</h3>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">En ruta</span>
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

            {/* En hub */}
            {atHub.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] mb-3 flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-indigo-600" />
                  En centro de distribución ({atHub.length})
                </h3>
                <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
                  <div className="divide-y divide-[#F7F6F5]">
                    {atHub.map((order) => (
                      <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                        <Warehouse className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#0A0A0A]">{order.id}</p>
                          <p className="text-xs text-[#6B6359] font-body">{order.customer.name} · {order.customer.zone}</p>
                        </div>
                        <span className="text-xs font-bold text-[#0A0A0A]">${order.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
              <textarea
                value={incidence}
                onChange={(e) => setIncidence(e.target.value)}
                className="w-full h-20 px-3 py-2 text-xs border border-[#EDEBE8] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#00C9B1] font-body"
                placeholder="Describe el incidente..."
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total pedidos',  value: orders.length,    color: '#3B82F6', icon: Package },
                { label: 'En tránsito',    value: shipped.length,   color: '#8B5CF6', icon: Truck },
                { label: 'Entregados',     value: delivered.length, color: '#00C9B1', icon: CheckCircle2 },
                { label: 'Pendientes',     value: manifestOrders.length, color: '#F97316', icon: Clock },
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

            <div className="bg-white border border-[#EDEBE8] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0A0A0A]">Valor de carga</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'En tránsito',  value: shipped.reduce((s, o) => s + o.total, 0),  color: '#8B5CF6' },
                  { label: 'Entregado',    value: delivered.reduce((s, o) => s + o.total, 0), color: '#00C9B1' },
                  { label: 'Por procesar', value: manifestOrders.reduce((s, o) => s + o.total, 0), color: '#F97316' },
                  { label: 'Total general',value: orders.reduce((s, o) => s + o.total, 0),   color: '#0A0A0A' },
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

// ── PackageBreakdown component ─────────────────────────────────
function PackageBreakdown({
  order,
  onPickup,
  onAtHub,
}: {
  order: LocalOrder;
  onPickup: (supplierId: string) => void;
  onAtHub: () => void;
}) {
  const pkgs = order.supplierPackages ?? [];
  const allPickedUp = allPackagesPickedUp(order);
  const canMarkHub = allPickedUp && order.status !== 'at_hub' && order.status !== 'shipped' && order.status !== 'delivered';

  const PKG_STATUS_COLORS: Record<string, string> = {
    pending: 'text-orange-600 bg-orange-50 border-orange-200',
    preparing: 'text-blue-600 bg-blue-50 border-blue-200',
    ready: 'text-green-600 bg-green-50 border-green-200',
    picked_up: 'text-teal-600 bg-teal-50 border-teal-200',
  };
  const PKG_STATUS_LABELS: Record<string, string> = {
    pending: 'Esperando proveedor',
    preparing: 'Preparando',
    ready: 'Listo — recoger',
    picked_up: 'Recibido ✓',
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#0A0A0A]">Paquetes por proveedor:</p>
      {pkgs.map((pkg) => (
        <div key={pkg.supplierId} className="flex items-center justify-between gap-2 bg-[#F7F6F5] rounded-xl px-3 py-2.5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#0A0A0A] truncate">{pkg.supplierName}</p>
            <p className="text-[10px] text-[#8F8780] font-body">{pkg.itemIds.length} artículo(s)</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PKG_STATUS_COLORS[pkg.status] ?? ''}`}>
              {PKG_STATUS_LABELS[pkg.status] ?? pkg.status}
            </span>
            {pkg.status === 'ready' && (
              <button
                onClick={() => onPickup(pkg.supplierId)}
                className="text-[10px] font-semibold px-2.5 py-1.5 bg-[#0A0A0A] text-white rounded-lg hover:bg-[#00C9B1] transition-colors"
              >
                Confirmar recepción
              </button>
            )}
          </div>
        </div>
      ))}
      {canMarkHub && (
        <button
          onClick={onAtHub}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <Warehouse className="h-3.5 w-3.5" />
          Marcar en centro de distribución
        </button>
      )}
      {order.status === 'at_hub' && (
        <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 text-center">
          Pedido registrado en el hub. Admin asignará repartidor.
        </p>
      )}
    </div>
  );
}
