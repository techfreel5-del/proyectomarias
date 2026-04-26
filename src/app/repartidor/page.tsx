'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut, MapPin, Phone, CheckCircle2, Package,
  DollarSign, Navigation, Clock, Home, RefreshCw,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useAuth } from '@/lib/auth-context';
import {
  getOrders, updateOrder, subscribeOrders,
  LocalOrder, STATUS_LABELS,
} from '@/lib/orders-store';
import { RouteMap } from '@/components/transporter/RouteMap';

type Tab = 'entregas' | 'mapa' | 'historial';
type DeliveryType = 'domicilio' | 'punto_acordado';
type PaymentMethod = 'cash' | 'card';

export default function RepartidorPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('entregas');
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [deliveryTypes, setDeliveryTypes] = useState<Record<string, DeliveryType>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, PaymentMethod>>({});
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => setOrders(getOrders()), []);

  useEffect(() => {
    if (!user) { router.replace('/login'); return; }
    refresh();
    return subscribeOrders(refresh);
  }, [user, router, refresh]);

  const handleLogout = () => { logout(); router.replace('/login'); };

  const shippedOrders = orders.filter((o) => o.status === 'shipped');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const totalPorCobrar = shippedOrders
    .filter((o) => o.isAdvance)
    .reduce((s, o) => s + (o.total - o.amountPaid), 0);

  const confirmDelivery = (order: LocalOrder) => {
    const type = deliveryTypes[order.id] ?? 'domicilio';
    const paymentCollectedMethod = order.isAdvance
      ? (paymentMethods[order.id] ?? 'cash')
      : undefined;
    updateOrder(order.id, { status: 'delivered', deliveryType: type, paymentCollectedMethod });
    setConfirmed((prev) => new Set([...prev, order.id]));
    refresh();
  };

  const setType = (id: string, type: DeliveryType) =>
    setDeliveryTypes((prev) => ({ ...prev, [id]: type }));

  const setPayment = (id: string, method: PaymentMethod) =>
    setPaymentMethods((prev) => ({ ...prev, [id]: method }));

  return (
    <div className="min-h-screen bg-[#F7F6F5]">
      {/* Header */}
      <header className="bg-white border-b border-[#EDEBE8] px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <div>
            <p className="text-[10px] font-body text-[#8F8780] uppercase tracking-widest">Portal Repartidor</p>
            <p className="text-sm font-bold text-[#0A0A0A]">{user?.name ?? 'Repartidor'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-[#6B6359] font-body">En línea</span>
          </div>
          <button
            onClick={refresh}
            className="p-2 text-[#6B6359] hover:text-[#0A0A0A] border border-[#EDEBE8] rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-[#6B6359] hover:text-[#C0392B] border border-[#EDEBE8] px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Tab nav */}
      <div className="bg-white border-b border-[#EDEBE8] px-4 sm:px-6">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {([
            { id: 'entregas' as Tab, label: 'Entregas', icon: Package, badge: shippedOrders.length },
            { id: 'mapa' as Tab, label: 'Mapa', icon: Navigation },
            { id: 'historial' as Tab, label: 'Historial', icon: Clock, badge: deliveredOrders.length },
          ]).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                tab === id
                  ? 'border-[#00C9B1] text-[#0A0A0A]'
                  : 'border-transparent text-[#8F8780] hover:text-[#0A0A0A]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {badge != null && badge > 0 && (
                <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── ENTREGAS TAB ── */}
        {tab === 'entregas' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Pendientes', value: shippedOrders.length, color: '#F97316', icon: Package },
                { label: 'Entregadas', value: deliveredOrders.length, color: '#00C9B1', icon: CheckCircle2 },
                { label: 'Por cobrar', value: `$${totalPorCobrar.toFixed(0)}`, color: '#8B5CF6', icon: DollarSign },
                { label: 'Total asignadas', value: orders.length, color: '#3B82F6', icon: Clock },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-white border border-[#EDEBE8] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-body text-[#8F8780] uppercase tracking-wider leading-tight">{label}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#0A0A0A]">{value}</p>
                </div>
              ))}
            </div>

            {/* Entregas activas */}
            <div>
              <h2 className="font-bold text-[#0A0A0A] mb-3 text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4 text-[#00C9B1]" />
                Entregas activas
              </h2>

              {shippedOrders.length === 0 ? (
                <div className="bg-white border border-[#EDEBE8] rounded-2xl p-12 text-center">
                  <Package className="h-10 w-10 text-[#D9D5CF] mx-auto mb-3" />
                  <p className="text-sm font-semibold text-[#0A0A0A]">Sin entregas pendientes</p>
                  <p className="text-xs text-[#8F8780] font-body mt-1">
                    Los pedidos marcados "En camino" aparecen aquí.
                  </p>
                  <p className="text-[10px] text-[#C0BAB2] font-body mt-2">
                    El proveedor o admin debe avanzar el pedido a "En camino" primero.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {shippedOrders.map((order) => {
                    const balance = order.isAdvance ? order.total - order.amountPaid : 0;
                    const isDone = confirmed.has(order.id);
                    const type = deliveryTypes[order.id] ?? 'domicilio';
                    return (
                      <div key={order.id} className="bg-white border border-[#EDEBE8] rounded-2xl p-5 space-y-4">
                        {/* Card header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-body text-[#8F8780] uppercase tracking-widest">{order.id}</p>
                            <p className="font-bold text-[#0A0A0A] text-base">{order.customer.name}</p>
                          </div>
                          {balance > 0 ? (
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#C0392B]">${balance.toFixed(2)}</p>
                              <p className="text-[10px] text-orange-500 font-body">Cobrar al entregar</p>
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-base font-bold text-[#00C9B1]">Pagado</p>
                              <p className="text-[10px] text-[#8F8780] font-body">Sin saldo</p>
                            </div>
                          )}
                        </div>

                        {/* Address + phone */}
                        <div className="space-y-1.5 text-xs font-body text-[#6B6359]">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#00C9B1] mt-0.5 flex-shrink-0" />
                            <span>{order.customer.address}, {order.customer.zone}</span>
                          </div>
                          {order.customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-[#00C9B1] flex-shrink-0" />
                              <a href={`tel:${order.customer.phone}`} className="hover:text-[#0A0A0A] transition-colors">
                                {order.customer.phone}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Products */}
                        <div className="bg-[#F7F6F5] rounded-xl px-3 py-2 text-xs font-body text-[#6B6359] space-y-0.5">
                          {order.items.map((item, i) => (
                            <p key={i}>
                              {item.name} × {item.qty}
                              {item.size && <span className="text-[#8F8780]"> ({item.size})</span>}
                            </p>
                          ))}
                        </div>

                        {/* Delivery type selector */}
                        <div>
                          <p className="text-[10px] font-body text-[#8F8780] uppercase tracking-widest mb-2">
                            Modalidad de entrega
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setType(order.id, 'domicilio')}
                              disabled={isDone}
                              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                type === 'domicilio'
                                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                                  : 'bg-white text-[#6B6359] border-[#EDEBE8] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                              } disabled:opacity-50`}
                            >
                              <Home className="h-3.5 w-3.5" />
                              A domicilio
                            </button>
                            <button
                              onClick={() => setType(order.id, 'punto_acordado')}
                              disabled={isDone}
                              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                type === 'punto_acordado'
                                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                                  : 'bg-white text-[#6B6359] border-[#EDEBE8] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                              } disabled:opacity-50`}
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Punto acordado
                            </button>
                          </div>
                        </div>

                        {/* Payment collection — only when isAdvance */}
                        {balance > 0 && !isDone && (
                          <div>
                            <p className="text-[10px] font-body text-[#8F8780] uppercase tracking-widest mb-2">
                              Cobrar ${balance.toFixed(2)} con:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {([
                                { id: 'cash' as PaymentMethod, label: 'Efectivo', icon: '💵' },
                                { id: 'card' as PaymentMethod, label: 'Tarjeta',  icon: '💳' },
                              ]).map((m) => {
                                const selected = (paymentMethods[order.id] ?? 'cash') === m.id;
                                return (
                                  <button
                                    key={m.id}
                                    onClick={() => setPayment(order.id, m.id)}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                                      selected
                                        ? 'bg-[#C0392B] text-white border-[#C0392B]'
                                        : 'bg-white text-[#6B6359] border-[#EDEBE8] hover:border-[#C0392B] hover:text-[#C0392B]'
                                    }`}
                                  >
                                    <span>{m.icon}</span> {m.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Confirm button */}
                        <button
                          onClick={() => confirmDelivery(order)}
                          disabled={isDone}
                          className={`w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.99] ${
                            isDone
                              ? 'bg-[#00C9B1] text-white cursor-default'
                              : 'bg-[#00C9B1] text-white hover:bg-[#009E8C]'
                          }`}
                        >
                          {isDone ? (
                            <span className="flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              ¡Entrega confirmada!
                            </span>
                          ) : (
                            `Confirmar — ${type === 'domicilio' ? 'A domicilio' : 'En punto acordado'}`
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── MAPA TAB ── */}
        {tab === 'mapa' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#0A0A0A]">Ruta activa</h2>
                <p className="text-xs text-[#8F8780] font-body mt-0.5">
                  {shippedOrders.length} entrega(s) pendiente(s) en la zona
                </p>
              </div>
              <div className="bg-white border border-[#EDEBE8] rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-body">
                <Navigation className="h-3.5 w-3.5 text-[#3B82F6]" />
                <span className="font-semibold">2.3 km · ~8 min</span>
              </div>
            </div>
            <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
              <RouteMap />
            </div>
            {shippedOrders.length > 0 && (
              <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#EDEBE8]">
                  <p className="text-xs font-bold text-[#0A0A0A]">Paradas en ruta</p>
                </div>
                <div className="divide-y divide-[#F7F6F5]">
                  {shippedOrders.map((order, i) => (
                    <div key={order.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0A0A0A]">{order.customer.name}</p>
                        <p className="text-[10px] text-[#8F8780] font-body truncate">{order.customer.address}, {order.customer.zone}</p>
                      </div>
                      {order.isAdvance && (
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          Cobrar ${(order.total - order.amountPaid).toFixed(0)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORIAL TAB ── */}
        {tab === 'historial' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-[#0A0A0A]">Historial de entregas</h2>
              <p className="text-xs text-[#8F8780] font-body mt-0.5">Pedidos confirmados como entregados</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Domicilio', value: deliveredOrders.filter((o) => o.deliveryType === 'domicilio').length, color: '#00C9B1' },
                { label: 'Punto acordado', value: deliveredOrders.filter((o) => o.deliveryType === 'punto_acordado').length, color: '#8B5CF6' },
                { label: 'Total', value: deliveredOrders.length, color: '#0A0A0A' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-[#EDEBE8] rounded-xl p-3 text-center">
                  <p className="text-xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-[10px] text-[#8F8780] font-body mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {deliveredOrders.length === 0 ? (
              <div className="bg-white border border-[#EDEBE8] rounded-2xl p-10 text-center">
                <Clock className="h-10 w-10 text-[#D9D5CF] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#0A0A0A]">Sin entregas completadas</p>
                <p className="text-xs text-[#8F8780] font-body mt-1">Aquí aparecerán los pedidos que confirmes.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
                <div className="divide-y divide-[#F7F6F5]">
                  {deliveredOrders.map((order) => (
                    <div key={order.id} className="px-5 py-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-[#0A0A0A]">{order.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
                            Entregado
                          </span>
                        </div>
                        <p className="text-sm font-body text-[#0A0A0A]">{order.customer.name}</p>
                        <p className="text-xs text-[#8F8780] font-body">{order.customer.address}, {order.customer.zone}</p>
                        {order.deliveryType && (
                          <p className="text-[10px] text-[#8F8780] font-body mt-0.5 flex items-center gap-1">
                            {order.deliveryType === 'domicilio'
                              ? <><Home className="h-2.5 w-2.5" /> A domicilio</>
                              : <><MapPin className="h-2.5 w-2.5" /> En punto acordado</>
                            }
                          </p>
                        )}
                        {order.paymentCollectedMethod && (
                          <p className="text-[10px] text-[#C0392B] font-body mt-0.5">
                            Cobrado en {order.paymentCollectedMethod === 'cash' ? 'efectivo 💵' : 'tarjeta 💳'}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#0A0A0A]">${order.total.toFixed(2)}</p>
                        <p className="text-[10px] text-[#8F8780] font-body mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
