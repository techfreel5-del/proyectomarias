'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { posProducts } from './mock-data';

/* ── Types ────────────────────────────────────��─────────────── */

export interface SupplierProfile {
  storeName: string;
  slug: string;
  logo: string | null;        // base64 data URL
  brandColor: string;         // hex
  accentColor: string;        // hex
  description: string;
  email: string;
  phone: string;
  address: string;
  bannerUrl: string;
  showPoweredBy: boolean;
}

export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description: string;
  active: boolean;
  lowStockThreshold: number;
}

interface SupplierContextType {
  profile: SupplierProfile;
  inventory: InventoryProduct[];
  updateProfile: (patch: Partial<SupplierProfile>) => void;
  addProduct: (product: Omit<InventoryProduct, 'id'>) => void;
  updateProduct: (id: string, patch: Partial<InventoryProduct>) => void;
  removeProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  lowStockCount: number;
}

/* ── Defaults ───────────────────────────────────────────────── */

const DEFAULT_PROFILE: SupplierProfile = {
  storeName: 'Proveedor Zamora S.A.',
  slug: 'proveedor-zamora',
  logo: null,
  brandColor: '#1E3A5F',
  accentColor: '#E8A020',
  description: 'Distribuidor mayorista en Zamora, Michoacán. Productos de calidad para toda la región.',
  email: 'ventas@proveedorzamora.mx',
  phone: '+52 351 123 4567',
  address: 'Av. Morelos 245, Zamora, Michoacán',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=70',
  showPoweredBy: true,
};

const DEFAULT_INVENTORY: InventoryProduct[] = posProducts.map((p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  price: Math.round((p.stock * 0.8 + 20) * 10) / 10,  // derived mock price
  stock: p.stock,
  image: p.image,
  description: `Producto ${p.category.toLowerCase()} de alta calidad.`,
  active: p.stock > 0,
  lowStockThreshold: 10,
}));

/* ── Context ────────────────────────────────────────────────── */

const SupplierContext = createContext<SupplierContextType | null>(null);

const LS_PROFILE = 'mc_supplier_profile';
const LS_INVENTORY = 'mc_supplier_inventory';

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<SupplierProfile>(DEFAULT_PROFILE);
  const [inventory, setInventory] = useState<InventoryProduct[]>(DEFAULT_INVENTORY);
  const [hydrated, setHydrated] = useState(false);

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(LS_PROFILE);
      const savedInventory = localStorage.getItem(LS_INVENTORY);
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedInventory) setInventory(JSON.parse(savedInventory));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  /* Persist profile changes */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
  }, [profile, hydrated]);

  /* Persist inventory changes */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_INVENTORY, JSON.stringify(inventory));
  }, [inventory, hydrated]);

  const updateProfile = useCallback((patch: Partial<SupplierProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const addProduct = useCallback((product: Omit<InventoryProduct, 'id'>) => {
    const id = `p-${Date.now()}`;
    setInventory((prev) => [...prev, { ...product, id }]);
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<InventoryProduct>) => {
    setInventory((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setInventory((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const adjustStock = useCallback((id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((p) => p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
    );
  }, []);

  const lowStockCount = inventory.filter(
    (p) => p.active && p.stock <= p.lowStockThreshold
  ).length;

  return (
    <SupplierContext.Provider value={{
      profile, inventory,
      updateProfile, addProduct, updateProduct, removeProduct, adjustStock,
      lowStockCount,
    }}>
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error('useSupplier debe usarse dentro de SupplierProvider');
  return ctx;
}
