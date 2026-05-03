'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingCart, Save, Truck, Store, Package, CreditCard,
  Banknote, MessageCircle, ToggleLeft, ToggleRight, CheckCircle2,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  getMCStoreConfig, saveMCStoreConfig,
  type MCStoreConfig, type MCPaymentMethod,
} from '@/lib/mc-store-config';
import type { ShippingMethod } from '@/lib/supplier-context';

const SHIPPING_ICONS: Record<string, React.ReactNode> = {
  pickup:     <Store   className="h-4 w-4" />,
  paqueteria: <Truck   className="h-4 w-4" />,
  rappi:      <Package className="h-4 w-4" />,
};

export default function AdminCheckoutPage() {
  const [config, setConfig] = useState<MCStoreConfig | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getMCStoreConfig());
  }, []);

  function handleSave() {
    if (!config) return;
    saveMCStoreConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateShipping(idx: number, patch: Partial<ShippingMethod>) {
    if (!config) return;
    const methods = config.shippingMethods.map((m, i) => i === idx ? { ...m, ...patch } : m);
    setConfig({ ...config, shippingMethods: methods });
  }

  function updateZonedPrice(idx: number, zone: string, value: string) {
    if (!config) return;
    const m = config.shippingMethods[idx];
    const zoned = { ...(m.zonedPricing ?? { local: 0, regional: 0, centro: 0, lejano: 0 }) };
    (zoned as Record<string, number>)[zone] = parseFloat(value) || 0;
    updateShipping(idx, { zonedPricing: zoned });
  }

  function updatePayment(idx: number, patch: Partial<MCPaymentMethod>) {
    if (!config) return;
    const methods = config.paymentMethods.map((m, i) => i === idx ? { ...m, ...patch } : m);
    setConfig({ ...config, paymentMethods: methods });
  }

  if (!config) return null;

  const inputCls = 'w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] rounded-lg focus:outline-none focus:border-[#0A0A0A] transition-colors bg-white';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5';

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-3xl">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">MARIASCLUB™</p>
            <h1 className="font-display text-3xl font-black text-[#0A0A0A] flex items-center gap-2">
              <ShoppingCart className="h-7 w-7" />
              Configuración de Checkout
            </h1>
            <p className="text-sm text-[#8F8780] font-body mt-1">
              Todo lo que aparece en el proceso de compra de la tienda principal.
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              saved ? 'bg-[#00C9B1] text-white' : 'bg-[#0A0A0A] text-white hover:bg-[#222]'
            }`}
          >
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>

        {/* ── Métodos de envío ── */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F6F5] flex items-center gap-2">
            <Truck className="h-4 w-4 text-[#3B82F6]" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Métodos de envío</h2>
          </div>
          <div className="divide-y divide-[#F7F6F5]">
            {config.shippingMethods.map((method, idx) => (
              <div key={method.type} className="px-6 py-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${method.enabled ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#F7F6F5] text-[#C0BAB2]'}`}>
                      {SHIPPING_ICONS[method.type]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A0A0A]">{method.label}</p>
                      <p className="text-xs text-[#8F8780] font-body">{method.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateShipping(idx, { enabled: !method.enabled })}
                    className="flex-shrink-0"
                  >
                    {method.enabled
                      ? <ToggleRight className="h-7 w-7 text-[#00C9B1]" />
                      : <ToggleLeft  className="h-7 w-7 text-[#C0BAB2]" />}
                  </button>
                </div>

                {method.enabled && (
                  <div className="grid sm:grid-cols-2 gap-4 pl-12">
                    <div>
                      <label className={labelCls}>Etiqueta visible al cliente</label>
                      <input
                        type="text"
                        value={method.label}
                        onChange={(e) => updateShipping(idx, { label: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Descripción breve</label>
                      <input
                        type="text"
                        value={method.description}
                        onChange={(e) => updateShipping(idx, { description: e.target.value })}
                        className={inputCls}
                      />
                    </div>

                    {method.type !== 'paqueteria' && (
                      <div>
                        <label className={labelCls}>Costo de envío ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={method.cost}
                          onChange={(e) => updateShipping(idx, { cost: parseFloat(e.target.value) || 0 })}
                          className={inputCls}
                        />
                        {method.cost === 0 && (
                          <p className="text-[11px] text-[#00C9B1] mt-1 font-body">Se mostrará como "Gratis"</p>
                        )}
                      </div>
                    )}

                    {method.type === 'paqueteria' && method.zonedPricing && (
                      <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(method.zonedPricing).map(([zone, cost]) => (
                          <div key={zone}>
                            <label className={labelCls}>{zone.charAt(0).toUpperCase() + zone.slice(1)} ($)</label>
                            <input
                              type="number"
                              min="0"
                              value={cost}
                              onChange={(e) => updateZonedPrice(idx, zone, e.target.value)}
                              className={inputCls}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Métodos de pago ── */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F6F5] flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#8B5CF6]" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Métodos de pago</h2>
          </div>
          <div className="divide-y divide-[#F7F6F5]">
            {config.paymentMethods.map((method, idx) => (
              <div key={method.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A]">{method.label}</p>
                    <p className="text-[11px] text-[#8F8780] font-body">
                      {method.id === 'card' ? 'Requiere integración con pasarela de pago (Stripe/Conekta)' : 'Disponible para todos los clientes'}
                    </p>
                  </div>
                </div>
                <button onClick={() => updatePayment(idx, { enabled: !method.enabled })}>
                  {method.enabled
                    ? <ToggleRight className="h-7 w-7 text-[#00C9B1]" />
                    : <ToggleLeft  className="h-7 w-7 text-[#C0BAB2]" />}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Datos bancarios ── */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F6F5] flex items-center gap-2">
            <Banknote className="h-4 w-4 text-[#10B981]" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Datos bancarios para transferencias</h2>
          </div>
          <div className="px-6 py-5 grid sm:grid-cols-2 gap-4">
            {[
              { key: 'beneficiary',   label: 'Beneficiario / Nombre en cuenta' },
              { key: 'bank',          label: 'Banco'                           },
              { key: 'accountNumber', label: 'Número de cuenta'               },
              { key: 'clabe',         label: 'CLABE interbancaria'             },
              { key: 'concept',       label: 'Concepto de pago'               },
            ].map(({ key, label }) => (
              <div key={key} className={key === 'concept' ? 'sm:col-span-2' : ''}>
                <label className={labelCls}>{label}</label>
                <input
                  type="text"
                  value={(config.bankInfo as unknown as Record<string, string>)[key] ?? ''}
                  onChange={(e) =>
                    setConfig({ ...config, bankInfo: { ...config.bankInfo, [key]: e.target.value } })
                  }
                  className={inputCls}
                  placeholder={
                    key === 'clabe' ? '18 dígitos' :
                    key === 'accountNumber' ? 'Número de cuenta' :
                    key === 'concept' ? 'Pedido MARIASCLUB™' : ''
                  }
                />
              </div>
            ))}
            <p className="sm:col-span-2 text-[11px] text-[#8F8780] font-body">
              Estos datos se muestran al cliente cuando elige Transferencia Bancaria en el checkout.
              Se puede copiar cada campo individualmente.
            </p>
          </div>
        </section>

        {/* ── WhatsApp ── */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F7F6F5] flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Notificaciones WhatsApp</h2>
          </div>
          <div className="px-6 py-5">
            <label className={labelCls}>Número de WhatsApp (para recibir pedidos)</label>
            <input
              type="tel"
              value={config.whatsappNumber}
              onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
              placeholder="+52 351 000 0000"
              className={`${inputCls} max-w-xs`}
            />
            <p className="text-[11px] text-[#8F8780] mt-2 font-body">
              Al confirmar un pedido, el cliente verá un botón para enviarte el detalle por WhatsApp.
              Incluir código de país (+52 para México).
            </p>
          </div>
        </section>

        {/* Save button bottom */}
        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all ${
              saved ? 'bg-[#00C9B1] text-white' : 'bg-[#0A0A0A] text-white hover:bg-[#222]'
            }`}
          >
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? '¡Cambios guardados!' : 'Guardar cambios'}
          </button>
        </div>

      </main>
    </div>
  );
}
