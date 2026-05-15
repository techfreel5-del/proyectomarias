'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import {
  updateSupplierProfile as storeUpdateProfile,
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
  addProduct: (product: Omit<InventoryProduct, 'id'>) => Promise<void>;
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

  // Load supplier data from DB on mount or when supplierId changes
  useEffect(() => {
    if (!supplierId) {
      setHydrated(true);
      return;
    }
    fetch(`/api/admin/suppliers/${supplierId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          // Map DB inventory format → InventoryProduct
          const inv: InventoryProduct[] = (data.inventory ?? []).map((p: {
            id: string; sku?: string; name: string; category?: string; price: number;
            stock: number; image?: string; images?: string[]; description?: string;
            active: boolean; lowStockThreshold?: number; pendingApproval?: boolean;
            videoUrl?: string; hasVariants?: boolean; variantType?: string; variants?: unknown[];
          }) => ({
            id: p.id,
            sku: p.sku ?? '',
            name: p.name,
            category: p.category ?? '',
            price: p.price,
            stock: p.stock,
            image: p.image ?? (p.images?.[0] ?? ''),
            images: p.images ?? [],
            description: p.description ?? '',
            active: p.active,
            lowStockThreshold: p.lowStockThreshold ?? 5,
            pendingApproval: p.pendingApproval ?? false,
            videoUrl: p.videoUrl ?? '',
            hasVariants: p.hasVariants ?? false,
            variantType: (p.variantType ?? 'none') as InventoryProduct['variantType'],
            variants: (p.variants ?? []) as InventoryProduct['variants'],
          }));
          setInventory(inv);

          // Merge profile from DB supplier data
          if (data.profile) {
            setProfile((prev) => ({
              ...prev,
              storeName: data.profile.storeName ?? prev.storeName,
              brandColor: data.profile.brandColor ?? prev.brandColor,
              slug: data.profile.slug ?? prev.slug,
            }));
          }
        }
      })
      .catch(() => { /* silently keep fallback */ })
      .finally(() => setHydrated(true));
  }, [supplierId]);

  // Persist profile changes to suppliers-store (legacy, keeps local UI in sync)
  useEffect(() => {
    if (!hydrated || !supplierId) return;
    storeUpdateProfile(supplierId, profile);
  }, [profile, hydrated, supplierId]);

  const updateProfile = useCallback((patch: Partial<SupplierProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const addProduct = useCallback(async (product: Omit<InventoryProduct, 'id'>) => {
    // Optimistic update con id temporal
    const tempId = `p-${Date.now()}`;
    const optimistic: InventoryProduct = { ...product, id: tempId, pendingApproval: true, active: false };
    setInventory((prev) => [...prev, optimistic]);

    try {
      const res = await fetch('/api/supplier/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          image: product.image,
          description: product.description,
          lowStockThreshold: product.lowStockThreshold,
          sku: product.sku,
          sizes: product.variants?.map((v) => v.size).filter(Boolean) ?? [],
          colors: product.variants?.map((v) => v.color).filter(Boolean) ?? [],
          videoUrl: product.videoUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.productId) {
        // Reemplazar id temporal con el real de la DB
        setInventory((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: data.productId } : p)),
        );
      }
    } catch {
      // El producto ya está en la UI con id temporal — se perderá al recargar,
      // pero el usuario al menos ve el resultado inmediato.
    }
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
