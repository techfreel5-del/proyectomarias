// Almacén de precios administrado exclusivamente por el admin.
// Los proveedores NO tienen acceso a este módulo ni a sus datos.

export interface ProductPricing {
  price: number; // Precio de menudeo en MariasClub (lo que ve el cliente)
}

export interface SupplierPricingConfig {
  wholesaleRate: number; // % del precio menudeo que recibe el proveedor (confidencial)
}

export interface PricingData {
  products:  Record<string, ProductPricing>;      // productId → precio admin
  suppliers: Record<string, SupplierPricingConfig>; // supplierId → config mayoreo
}

const KEY = 'mc_admin_pricing';

// Tarifas de mayoreo por defecto si el admin no las ha configurado
const DEFAULT_WHOLESALE_RATES: Record<string, number> = {
  'fashion-hogar-zamora':  70,
  'deportes-tech-zamora':  70,
};

export function getPricing(): PricingData {
  if (typeof window === 'undefined') return { products: {}, suppliers: {} };
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return { products: {}, suppliers: {} };
}

function savePricing(data: PricingData): void {
  localStorage.setItem(KEY, JSON.stringify(data));
}

/** Precio efectivo para un producto en MariasClub.
 *  Usa el precio admin si existe, si no usa el precio base del catálogo. */
export function getEffectivePrice(productId: string, basePrice: number): number {
  const data = getPricing();
  return data.products[productId]?.price ?? basePrice;
}

/** Sobreescribir el precio de un producto individual. */
export function setProductPrice(productId: string, price: number): void {
  const data = getPricing();
  data.products[productId] = { price: Math.round(price * 100) / 100 };
  savePricing(data);
}

/** Aplicar un ajuste porcentual a todos los productos de un proveedor.
 *  percent: 10 = +10%, -5 = -5%. Se aplica sobre el precio actual de MariasClub. */
export function applySupplierBulkAdjustment(
  productEntries: Array<{ id: string; basePrice: number }>,
  percent: number,
): void {
  const data = getPricing();
  for (const { id, basePrice } of productEntries) {
    const current = data.products[id]?.price ?? basePrice;
    const next    = Math.max(0, current * (1 + percent / 100));
    data.products[id] = { price: Math.round(next * 100) / 100 };
  }
  savePricing(data);
}

/** Restaurar precios de un proveedor a los precios base del catálogo. */
export function resetSupplierPrices(productIds: string[]): void {
  const data = getPricing();
  for (const id of productIds) {
    delete data.products[id];
  }
  savePricing(data);
}

/** Configurar la tarifa de mayoreo de un proveedor (solo admin). */
export function setSupplierWholesaleRate(supplierId: string, rate: number): void {
  const data = getPricing();
  data.suppliers[supplierId] = {
    ...(data.suppliers[supplierId] ?? {}),
    wholesaleRate: Math.min(100, Math.max(0, rate)),
  };
  savePricing(data);
}

/** Obtener la tarifa de mayoreo de un proveedor.
 *  Usada INTERNAMENTE para calcular cuentas por cobrar — nunca mostrar el % al proveedor. */
export function getSupplierWholesaleRate(supplierId: string): number {
  const data = getPricing();
  return data.suppliers[supplierId]?.wholesaleRate ?? DEFAULT_WHOLESALE_RATES[supplierId] ?? 70;
}
