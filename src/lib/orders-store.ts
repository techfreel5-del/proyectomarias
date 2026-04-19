// Shared orders store — localStorage based (Phase 2 will replace with DB)

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';

export interface LocalOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface LocalOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    zone: string;
  };
  items: LocalOrderItem[];
  total: number;
  paymentMethod: string;
  isAdvance: boolean;
  amountPaid: number;
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

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = status;
    localStorage.setItem(KEY, JSON.stringify(orders));
    notify();
  }
}

export function generateOrderId(): string {
  const existing = getOrders().map((o) => o.id);
  // Find next available ORD-NNN above 005 (mock data uses 001-005)
  let n = 6;
  while (existing.includes(`ORD-${String(n).padStart(3, '0')}`)) n++;
  return `ORD-${String(n).padStart(3, '0')}`;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  shipped: 'En camino',
  delivered: 'Entregado',
  returned: 'Devuelto',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-orange-600 bg-orange-50 border-orange-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  shipped: 'text-purple-600 bg-purple-50 border-purple-200',
  delivered: 'text-teal-600 bg-teal-50 border-teal-200',
  returned: 'text-red-600 bg-red-50 border-red-200',
};
