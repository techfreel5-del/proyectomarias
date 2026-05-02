// Central store for all supplier accounts.
// Persists in localStorage under mc_suppliers_v2.
// Provides all shared types (re-exported from supplier-context for backward compat).

import { products as catalogProducts } from './mock-data';

// ─── Types ────────────────────────────────────────────────────

export type ShippingMethodType = 'pickup' | 'paqueteria' | 'rappi';

export interface ZonedPricing {
  local:    number;
  regional: number;
  centro:   number;
  lejano:   number;
}

export interface ShippingMethod {
  type: ShippingMethodType;
  label: string;
  enabled: boolean;
  cost: number;
  description: string;
  zonedPricing?: ZonedPricing;
}

export interface BankInfo {
  beneficiary: string;
  bank: string;
  accountNumber: string;
  clabe: string;
  concept: string;
}

export interface StoreConfig {
  shippingMethods: ShippingMethod[];
  bankInfo: BankInfo;
  whatsappNumber: string;
}

export interface SupplierProfile {
  storeName: string;
  slug: string;
  logo: string | null;
  brandColor: string;
  accentColor: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  bannerUrl: string;
  showPoweredBy: boolean;
  storeConfig: StoreConfig;
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

export interface SupplierRecord {
  id: string;           // supplierId — used as login key
  email: string;
  password: string;     // plain text (mock only — replace with hashed in production)
  displayName: string;  // shown in admin
  createdAt: string;
  active: boolean;
  profile: SupplierProfile;
  inventory: InventoryProduct[];
}

// ─── Defaults ─────────────────────────────────────────────────

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  shippingMethods: [
    {
      type: 'pickup',
      label: 'Recoger en tienda',
      enabled: true,
      cost: 0,
      description: 'El cliente pasa a recoger su pedido en la tienda',
    },
    {
      type: 'paqueteria',
      label: 'Paquetería',
      enabled: false,
      cost: 0,
      description: 'Envío a domicilio — costo varía según zona del país',
      zonedPricing: { local: 80, regional: 120, centro: 160, lejano: 200 },
    },
    {
      type: 'rappi',
      label: 'Entrega local (Rappi / moto)',
      enabled: false,
      cost: 99,
      description: 'Entrega el mismo día en tu localidad',
    },
  ],
  bankInfo: {
    beneficiary: '',
    bank: '',
    accountNumber: '',
    clabe: '',
    concept: 'Pedido tienda online',
  },
  whatsappNumber: '',
};

// ─── Seed helpers ──────────────────────────────────────────────

function makeInventoryFromCatalog(supplierId: string): InventoryProduct[] {
  return catalogProducts
    .filter((p) => p.supplierId === supplierId)
    .map((p, i) => ({
      id: p.id,
      sku: p.id.toUpperCase().replace(/([A-Z]+)(\d+)/, '$1-$2'),
      name: p.name,
      category: p.subcategory,
      price: p.price,
      stock: 10 + ((i * 13 + 7) % 45),   // varied mock stock
      image: p.images[0],
      description: p.description,
      active: p.inStock,
      lowStockThreshold: 10,
    }));
}

function buildSeed(): SupplierRecord[] {
  return [
    {
      id: 'fashion-hogar-zamora',
      email: 'proveedor@mariasclub.com',
      password: 'proveedor123',
      displayName: 'Moda & Hogar Zamora',
      createdAt: '2026-01-15T08:00:00Z',
      active: true,
      profile: {
        storeName: 'Moda & Hogar Zamora',
        slug: 'moda-hogar-zamora',
        logo: null,
        brandColor: '#1E3A5F',
        accentColor: '#E8A020',
        description: 'Distribuidor de moda y artículos para el hogar en Zamora, Michoacán.',
        email: 'ventas@modahogar.mx',
        phone: '+52 351 123 4567',
        address: 'Av. Morelos 245, Zamora, Michoacán',
        bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=70',
        showPoweredBy: true,
        storeConfig: DEFAULT_STORE_CONFIG,
      },
      inventory: makeInventoryFromCatalog('fashion-hogar-zamora'),
    },
    {
      id: 'deportes-tech-zamora',
      email: 'proveedor2@mariasclub.com',
      password: 'proveedor2123',
      displayName: 'Deportes & Tech Zamora',
      createdAt: '2026-02-01T08:00:00Z',
      active: true,
      profile: {
        storeName: 'Deportes & Tech Zamora',
        slug: 'deportes-tech-zamora',
        logo: null,
        brandColor: '#00C9B1',
        accentColor: '#FF6B35',
        description: 'Equipamiento deportivo y tecnología al mejor precio en Zamora.',
        email: 'ventas@deportestech.mx',
        phone: '+52 351 987 6543',
        address: 'Blvd. López Mateos 890, Zamora, Michoacán',
        bannerUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1200&q=70',
        showPoweredBy: true,
        storeConfig: DEFAULT_STORE_CONFIG,
      },
      inventory: makeInventoryFromCatalog('deportes-tech-zamora'),
    },
  ];
}

// ─── Persistence ──────────────────────────────────────────────

const LS_KEY = 'mc_suppliers_v2';

function load(): SupplierRecord[] {
  if (typeof window === 'undefined') return buildSeed();
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  const seed = buildSeed();
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}

function save(records: SupplierRecord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(records));
}

// ─── Public API ───────────────────────────────────────────────

/** All supplier records. */
export function getSuppliers(): SupplierRecord[] {
  return load();
}

/** Single supplier by id. */
export function getSupplier(id: string): SupplierRecord | undefined {
  return load().find((s) => s.id === id);
}

/** Find supplier by email (for login validation). */
export function findSupplierByEmail(email: string): SupplierRecord | undefined {
  return load().find((s) => s.email.toLowerCase() === email.toLowerCase());
}

/** Create a new supplier account. */
export function createSupplier(
  data: Pick<SupplierRecord, 'email' | 'password' | 'displayName'> & {
    storeName: string;
    brandColor?: string;
  },
): SupplierRecord {
  const records = load();

  const id = data.storeName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Date.now();

  const newRecord: SupplierRecord = {
    id,
    email: data.email,
    password: data.password,
    displayName: data.displayName,
    createdAt: new Date().toISOString(),
    active: true,
    profile: {
      storeName: data.storeName,
      slug: id,
      logo: null,
      brandColor: data.brandColor ?? '#1E3A5F',
      accentColor: '#E8A020',
      description: '',
      email: data.email,
      phone: '',
      address: '',
      bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=70',
      showPoweredBy: true,
      storeConfig: DEFAULT_STORE_CONFIG,
    },
    inventory: [],
  };

  save([...records, newRecord]);
  return newRecord;
}

/** Update a supplier's profile fields. */
export function updateSupplierProfile(id: string, patch: Partial<SupplierProfile>): void {
  const records = load();
  save(
    records.map((r) =>
      r.id === id ? { ...r, profile: { ...r.profile, ...patch } } : r,
    ),
  );
}

/** Replace a supplier's full inventory. */
export function updateSupplierInventory(id: string, inventory: InventoryProduct[]): void {
  const records = load();
  save(records.map((r) => (r.id === id ? { ...r, inventory } : r)));
}

/** Toggle supplier active/inactive. */
export function setSupplierActive(id: string, active: boolean): void {
  const records = load();
  save(records.map((r) => (r.id === id ? { ...r, active } : r)));
}

/** Update email or password for a supplier account. */
export function updateSupplierCredentials(
  id: string,
  patch: Partial<Pick<SupplierRecord, 'email' | 'password' | 'displayName'>>,
): void {
  const records = load();
  save(records.map((r) => (r.id === id ? { ...r, ...patch } : r)));
}
