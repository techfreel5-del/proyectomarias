'use client';

import type { ShippingMethod, BankInfo } from './supplier-context';

export type { ShippingMethod, BankInfo };

export interface MCPaymentMethod {
  id: 'cash' | 'transfer' | 'card';
  label: string;
  icon: string;
  enabled: boolean;
}

export interface MCStoreConfig {
  shippingMethods: ShippingMethod[];
  bankInfo: BankInfo;
  whatsappNumber: string;
  paymentMethods: MCPaymentMethod[];
}

const KEY = 'mc_store_config';

export const DEFAULT_MC_CONFIG: MCStoreConfig = {
  shippingMethods: [
    {
      type: 'pickup',
      label: 'Recoger en tienda',
      enabled: true,
      cost: 0,
      description: 'El cliente pasa a recoger su pedido en nuestro punto de venta',
    },
    {
      type: 'rappi',
      label: 'Entrega local (Zamora)',
      enabled: true,
      cost: 50,
      description: 'Entrega el mismo día en Zamora y municipios cercanos',
    },
    {
      type: 'paqueteria',
      label: 'Paquetería nacional',
      enabled: false,
      cost: 0,
      description: 'Envío a domicilio — costo varía según zona del país',
      zonedPricing: { local: 80, regional: 120, centro: 160, lejano: 200 },
    },
  ],
  bankInfo: {
    beneficiary: '',
    bank: '',
    accountNumber: '',
    clabe: '',
    concept: 'Pedido MARIASCLUB™',
  },
  whatsappNumber: '',
  paymentMethods: [
    { id: 'cash',     label: 'Pago en Efectivo',             icon: '💵', enabled: true  },
    { id: 'transfer', label: 'Transferencia Bancaria',       icon: '🏦', enabled: true  },
    { id: 'card',     label: 'Tarjeta de Crédito / Débito',  icon: '💳', enabled: false },
  ],
};

export function getMCStoreConfig(): MCStoreConfig {
  if (typeof window === 'undefined') return DEFAULT_MC_CONFIG;
  try {
    const s = localStorage.getItem(KEY);
    if (s) {
      const p = JSON.parse(s) as Partial<MCStoreConfig>;
      return {
        ...DEFAULT_MC_CONFIG,
        ...p,
        paymentMethods: p.paymentMethods ?? DEFAULT_MC_CONFIG.paymentMethods,
        shippingMethods: p.shippingMethods ?? DEFAULT_MC_CONFIG.shippingMethods,
      };
    }
  } catch { /* ignore */ }
  return DEFAULT_MC_CONFIG;
}

export function saveMCStoreConfig(config: MCStoreConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(config));
}
