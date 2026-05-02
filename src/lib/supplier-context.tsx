'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import {
  getSupplier,
  updateSupplierProfile as storeUpdateProfile,
  updateSupplierInventory as storeUpdateInventory,
  DEFAULT_STORE_CONFIG,
  type ShippingMethodType,
  type ZonedPricing,
  type ShippingMethod,
  type BankInfo,
  type StoreConfig,
  type SupplierProfile,
  type InventoryProduct,
  type VariantType,
  type ProductVariant,
  type StoreTheme,
  type CardStyle,
} from './suppliers-store';

// ─── Re-export types for backward compatibility ─────────────────
export type { ShippingMethodType, ZonedPricing, ShippingMethod, BankInfo, StoreConfig, SupplierProfile, InventoryProduct, VariantType, ProductVariant, StoreTheme, CardStyle };
export { DEFAULT_STORE_CONFIG };

// ─── Context type ──────────────────────────────────────────────

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

// ─── Fallback defaults (used when supplier not found in store) ──

const FALLBACK_PROFILE: SupplierProfile = {
  storeName: 'Mi Tienda',
  slug: 'mi-tienda',
  logo: null,
  brandColor: '#1E3A5F',
  accentColor: '#E8A020',
  description: '',
  email: '',
  phone: '',
  address: '',
  bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=70',
  showPoweredBy: true,
  storeConfig: DEFAULT_STORE_CONFIG,
  storeTheme: 'moderno',
  heroCtaText: 'Ver colección',
  announcementText: '',
  announcementBg: '',
  cardStyle: 'rounded',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
};

// ─── Context ───────────────────────────────────────────────────

const SupplierContext = createContext<SupplierContextType | null>(null);

export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const supplierId = user?.supplierId ?? '';

  const [profile, setProfile] = useState<SupplierProfile>(FALLBACK_PROFILE);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load supplier data from store on mount or when supplierId changes
  useEffect(() => {
    if (!supplierId) {
      setHydrated(true);
      return;
    }
    const record = getSupplier(supplierId);
    if (record) {
      // Merge shipping methods defensively (same logic as before)
      const mergedMethods = DEFAULT_STORE_CONFIG.shippingMethods.map((def) => {
        const saved = (record.profile.storeConfig?.shippingMethods ?? []).find(
          (m) => m.type === def.type,
        );
        if (!saved) return def;
        return { ...def, ...saved, zonedPricing: saved.zonedPricing ?? def.zonedPricing };
      });
      setProfile({
        ...FALLBACK_PROFILE,
        ...record.profile,
        storeConfig: {
          ...DEFAULT_STORE_CONFIG,
          ...(record.profile.storeConfig ?? {}),
          bankInfo: {
            ...DEFAULT_STORE_CONFIG.bankInfo,
            ...(record.profile.storeConfig?.bankInfo ?? {}),
          },
          shippingMethods: mergedMethods,
        },
      });
      setInventory(record.inventory);
    }
    setHydrated(true);
  }, [supplierId]);

  // Persist profile changes to suppliers-store
  useEffect(() => {
    if (!hydrated || !supplierId) return;
    storeUpdateProfile(supplierId, profile);
  }, [profile, hydrated, supplierId]);

  // Persist inventory changes to suppliers-store
  useEffect(() => {
    if (!hydrated || !supplierId) return;
    storeUpdateInventory(supplierId, inventory);
  }, [inventory, hydrated, supplierId]);

  const updateProfile = useCallback((patch: Partial<SupplierProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const addProduct = useCallback((product: Omit<InventoryProduct, 'id'>) => {
    const id = `p-${Date.now()}`;
    setInventory((prev) => [...prev, { ...product, id }]);
  }, []);

  const updateProduct = useCallback((id: string, patch: Partial<InventoryProduct>) => {
    setInventory((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setInventory((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const adjustStock = useCallback((id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
  }, []);

  const lowStockCount = inventory.filter(
    (p) => p.active && p.stock <= p.lowStockThreshold,
  ).length;

  return (
    <SupplierContext.Provider
      value={{
        profile,
        inventory,
        updateProfile,
        addProduct,
        updateProduct,
        removeProduct,
        adjustStock,
        lowStockCount,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
}

export function useSupplier() {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error('useSupplier debe usarse dentro de SupplierProvider');
  return ctx;
}
