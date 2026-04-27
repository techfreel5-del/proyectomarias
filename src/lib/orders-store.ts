// Shared orders store — localStorage based (Phase 2 will replace with DB)

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
  // Pagos del proveedor: Record<supplierId, {status, paidAt?}>
  // Solo visible para admin y el proveedor correspondiente
  supplierPayments?: Record<string, { status: 'pending' | 'paid'; paidAt?: string }>;
}

const KEY = 'mc_orders';

let _listeners: Array<() => void> = [];

export function subscribeOrders(fn: () => void) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

function notify() {
  _listeners.forEach((fn) => fn());
}

export function getOrders(): LocalOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch { return []; }
}

export function getOrder(id: string): LocalOrder | null {
  return getOrders().find((o) => o.id === id) ?? null;
}

export function saveOrder(order: LocalOrder): void {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(KEY, JSON.stringify(orders));
  notify();
}

export function updateOrder(id: string, patch: Partial<LocalOrder>): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx] = { ...orders[idx], ...patch };
    localStorage.setItem(KEY, JSON.stringify(orders));
    notify();
  }
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    localStorage.setItem(KEY, JSON.stringify(orders));
    notify();
  }
}

export function updateSupplierPackage(
  orderId: string,
  supplierId: string,
  status: SupplierPackage['status']
): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  const order = orders[idx];
  if (!order.supplierPackages) return;
  const pkgIdx = order.supplierPackages.findIndex((p) => p.supplierId === supplierId);
  if (pkgIdx === -1) return;
  order.supplierPackages[pkgIdx].status = status;
  // If first supplier starts preparing, bump order to processing
  if (status === 'preparing' && order.status === 'pending') {
    order.status = 'processing';
  }
  orders[idx] = order;
  localStorage.setItem(KEY, JSON.stringify(orders));
  notify();
}

export function allPackagesPickedUp(order: LocalOrder): boolean {
  if (!order.supplierPackages || order.supplierPackages.length === 0) return false;
  return order.supplierPackages.every((p) => p.status === 'picked_up');
}

export function generateOrderId(): string {
  const existing = getOrders().map((o) => o.id);
  // Find next available ORD-NNN above 005 (mock data uses 001-005)
  let n = 6;
  while (existing.includes(`ORD-${String(n).padStart(3, '0')}`)) n++;
  return `ORD-${String(n).padStart(3, '0')}`;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pedido recibido',
  processing: 'Preparando pedido',
  at_hub: 'En centro de distribución',
  shipped: 'En camino',
  delivered: 'Entregado',
  returned: 'Devuelto',
};

/** Marcar pago del proveedor como saldado (solo admin) */
export function markSupplierPaid(orderId: string, supplierId: string): void {
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
  localStorage.setItem(KEY, JSON.stringify(orders));
  notify();
}

/** Desmarcar pago del proveedor (solo admin) */
export function unmarkSupplierPaid(orderId: string, supplierId: string): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return;
  const payments = { ...(orders[idx].supplierPayments ?? {}) };
  delete payments[supplierId];
  orders[idx] = { ...orders[idx], supplierPayments: payments };
  localStorage.setItem(KEY, JSON.stringify(orders));
  notify();
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-orange-600 bg-orange-50 border-orange-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  at_hub: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-teal-600 bg-teal-50 border-teal-200',
  returned: 'text-red-600 bg-red-50 border-red-200',
};
