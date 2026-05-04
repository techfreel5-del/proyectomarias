// Shared orders store — híbrido localStorage + API (Phase 2)
// API pública sin cambios para no romper componentes existentes

export type OrderStatus = 'pending' | 'processing' | 'at_hub' | 'shipped' | 'delivered' | 'returned';

export interface SupplierPackage {
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  itemIds: string[];
  status: 'pending' | 'preparing' | 'ready' | 'picked_up';
}

export interface LocalOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  size?: string;
  color?: string;
  supplierId?: string;
  supplierName?: string;
}

export interface LocalOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    zone: string;
  };
  items: LocalOrderItem[];
  total: number;
  paymentMethod: string;
  isAdvance: boolean;
  amountPaid: number;
  supplierSlug?: string;
  shippingMethod?: string;
  shippingCost?: number;
  deliveryType?: 'domicilio' | 'punto_acordado';
  paymentCollectedMethod?: 'cash' | 'card';
  supplierPackages?: SupplierPackage[];
  supplierPayments?: Record<string, { status: 'pending' | 'paid'; paidAt?: string }>;
}

const KEY = 'mc_orders';

// ─── Cache en memoria + observer pattern ──────────────────────

let _cache: LocalOrder[] = [];
let _listeners: Array<() => void> = [];

export function subscribeOrders(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

function notify() {
  _listeners.forEach((fn) => fn());
}

function _setCache(orders: LocalOrder[]) {
  _cache = orders;
  try { localStorage.setItem(KEY, JSON.stringify(orders)); } catch { /* ignore */ }
  notify();
}

// ─── Lectura sincrónica (desde cache) ─────────────────────────

export function getOrders(): LocalOrder[] {
  if (_cache.length > 0) return _cache;
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
    _cache = stored;
    return stored;
  } catch { return []; }
}

export function getOrder(id: string): LocalOrder | null {
  return getOrders().find((o) => o.id === id) ?? null;
}

// ─── Fetch desde API (refresca cache) ─────────────────────────

export async function fetchOrders(): Promise<LocalOrder[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) return getOrders();
    const orders: LocalOrder[] = await res.json();
    _setCache(orders);
    return orders;
  } catch {
    return getOrders();
  }
}

export async function fetchOrder(id: string): Promise<LocalOrder | null> {
  try {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return getOrder(id);
  }
}

// ─── Guardar orden → API + cache local ───────────────────────

export async function saveOrder(order: LocalOrder): Promise<LocalOrder> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (res.ok) {
      const saved: LocalOrder = await res.json();
      const orders = getOrders();
      _setCache([saved, ...orders]);
      return saved;
    }
  } catch { /* fallback a localStorage */ }

  // Fallback: guardar solo en localStorage si la API falla
  const orders = getOrders();
  orders.unshift(order);
  _setCache(orders);
  return order;
}

// ─── Actualizar orden → API + cache local ────────────────────

export async function updateOrder(id: string, patch: Partial<LocalOrder>): Promise<void> {
  try {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  } catch { /* continuar con localStorage */ }

  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...patch };
    _setCache(orders);
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  return updateOrder(id, { status });
}

export async function updateSupplierPackage(
  orderId: string,
  supplierId: string,
  status: SupplierPackage['status']
): Promise<void> {
  try {
    await fetch(`/api/orders/${orderId}/package`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId, status }),
    });
  } catch { /* continuar */ }

  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  const order = orders[idx];
  if (!order.supplierPackages) return;
  const pkgIdx = order.supplierPackages.findIndex((p) => p.supplierId === supplierId);
  if (pkgIdx === -1) return;
  order.supplierPackages[pkgIdx].status = status;
  if (status === 'preparing' && order.status === 'pending') {
    order.status = 'processing';
  }
  orders[idx] = order;
  _setCache(orders);
}

export function allPackagesPickedUp(order: LocalOrder): boolean {
  if (!order.supplierPackages || order.supplierPackages.length === 0) return false;
  return order.supplierPackages.every((p) => p.status === 'picked_up');
}

export function generateOrderId(): string {
  const existing = getOrders().map((o) => o.id);
  let n = 6;
  while (existing.includes(`ORD-${String(n).padStart(3, '0')}`)) n++;
  return `ORD-${String(n).padStart(3, '0')}`;
}

export async function markSupplierPaid(orderId: string, supplierId: string): Promise<void> {
  try {
    await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId, status: 'paid' }),
    });
  } catch { /* continuar */ }

  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  orders[idx] = {
    ...orders[idx],
    supplierPayments: {
      ...(orders[idx].supplierPayments ?? {}),
      [supplierId]: { status: 'paid', paidAt: new Date().toISOString() },
    },
  };
  _setCache(orders);
}

export async function unmarkSupplierPaid(orderId: string, supplierId: string): Promise<void> {
  try {
    await fetch(`/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supplierId, status: 'pending' }),
    });
  } catch { /* continuar */ }

  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  const payments = { ...(orders[idx].supplierPayments ?? {}) };
  delete payments[supplierId];
  orders[idx] = { ...orders[idx], supplierPayments: payments };
  _setCache(orders);
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pedido recibido',
  processing: 'Preparando pedido',
  at_hub: 'En centro de distribución',
  shipped: 'En camino',
  delivered: 'Entregado',
  returned: 'Devuelto',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-orange-600 bg-orange-50 border-orange-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  at_hub: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-teal-600 bg-teal-50 border-teal-200',
  returned: 'text-red-600 bg-red-50 border-red-200',
};
