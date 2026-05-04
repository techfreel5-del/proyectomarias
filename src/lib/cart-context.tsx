'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Product } from './mock-data';

export interface CartItem {
  product: Product;
  qty: number;
  size: string;
  color: string;
  key: string; // `${product.id}-${size}-${color}`
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size: string, color: string) => void;
  updateQty: (key: string, delta: number) => void;
  clearCart: () => void;
  total: number;
  totalQty: number;
}

const CartContext = createContext<CartContextType | null>(null);
const STORAGE_KEY = 'mc_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { data: session } = useSession();

  // Cargar desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  // Sincronizar localStorage cuando cambien los items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items]);

  // Merge a BD cuando el usuario inicia sesión
  useEffect(() => {
    if (!session?.user?.email || items.length === 0) return;
    const payload = items.map((i) => ({
      productId: i.product.id,
      size: i.size,
      color: i.color,
      qty: i.qty,
    }));
    fetch('/api/cart/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: payload }),
    }).catch(() => { /* no bloquear si falla */ });
  }, [session?.user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = (product: Product, size: string, color: string) => {
    const key = `${product.id}-${size}-${color}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { product, qty: 1, size, color, key }];
    });

    // Sync a BD si está autenticado
    if (session?.user?.email) {
      fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size, color, qty: 1 }),
      }).catch(() => { /* no bloquear */ });
    }
  };

  const updateQty = (key: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => i.key === key ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, clearCart, total, totalQty }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
