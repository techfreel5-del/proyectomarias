'use client';

// Almacén de precios administrado exclusivamente por el admin.
// Los proveedores NO tienen acceso a este módulo ni a sus datos.
// Los precios se persisten en Supabase via /api/admin/pricing.

import { useState, useEffect } from 'react';

export interface ProductPricing {
  price: number;
}

export interface SupplierPricingConfig {
  wholesaleRate: number;
}

export interface PricingData {
  products:  Record<string, ProductPricing>;
  suppliers: Record<string, SupplierPricingConfig>;
}

const DEFAULT_WHOLESALE_RATES: Record<string, number> = {
  'fashion-hogar-zamora': 70,
  'deportes-tech-zamora': 70,
};

// Cache de módulo — compartido entre todos los componentes en la misma sesión
let cachePromise: Promise<PricingData> | null = null;
let cache: PricingData = { products: {}, suppliers: {} };

function ensureLoaded(): Promise<PricingData> {
  if (typeof window === 'undefined') return Promise.resolve({ products: {}, suppliers: {} });
  if (!cachePromise) {
    cachePromise = fetch('/api/admin/pricing')
      .then((r) => r.json())
      .then((data: PricingData) => { cache = data; return data; })
      .catch(() => cache);
  }
  return cachePromise;
}

function invalidateCache(): void {
  cachePromise = null;
  cache = { products: {}, suppliers: {} };
}

async function patchPricing(body: object): Promise<void> {
  await fetch('/api/admin/pricing', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  invalidateCache();
  await ensureLoaded();
}

// ─── Lectura ────────────────────────────────────────────────────

export function getPricing(): PricingData {
  return cache;
}

export async function loadPricing(): Promise<PricingData> {
  return ensureLoaded();
}

/** Precio efectivo para un producto (usa cache — puede ser basePrice si el cache aún no cargó). */
export function getEffectivePrice(productId: string, basePrice: number): number {
  return cache.products[productId]?.price ?? basePrice;
}

/** Tarifa de mayoreo de un proveedor (usa cache — retorna default si aún no cargó). */
export function getSupplierWholesaleRate(supplierId: string): number {
  return cache.suppliers[supplierId]?.wholesaleRate ?? DEFAULT_WHOLESALE_RATES[supplierId] ?? 70;
}

// ─── Escritura (async — persiste en DB) ─────────────────────────

export async function setProductPrice(productId: string, price: number): Promise<void> {
  await patchPricing({ type: 'product', productId, price: Math.round(price * 100) / 100 });
}

export async function applySupplierBulkAdjustment(
  productEntries: Array<{ id: string; basePrice: number }>,
  percent: number,
): Promise<void> {
  const updates = productEntries.map(({ id, basePrice }) => {
    const current = cache.products[id]?.price ?? basePrice;
    const next = Math.max(0, Math.round(current * (1 + percent / 100) * 100) / 100);
    return { productId: id, price: next };
  });
  await patchPricing({ type: 'products_batch', updates });
}

export async function resetSupplierPrices(productIds: string[]): Promise<void> {
  await patchPricing({ type: 'products_reset', productIds });
}

export async function setSupplierWholesaleRate(supplierId: string, rate: number): Promise<void> {
  await patchPricing({
    type: 'wholesale',
    supplierId,
    rate: Math.min(100, Math.max(0, rate)),
  });
}

// ─── Hook React ─────────────────────────────────────────────────

/** Hook React: precio efectivo de un producto. Carga desde DB en el primer render. */
export function useEffectivePrice(productId: string, basePrice: number): number {
  const [price, setPrice] = useState(() => getEffectivePrice(productId, basePrice));
  useEffect(() => {
    ensureLoaded().then((data) => {
      setPrice(data.products[productId]?.price ?? basePrice);
    });
  }, [productId, basePrice]);
  return price;
}
