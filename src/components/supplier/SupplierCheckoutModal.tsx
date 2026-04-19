'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Download, MessageCircle, Truck, Store, Package } from 'lucide-react';
import { SupplierProfile, ShippingMethod } from '@/lib/supplier-context';
import { InventoryProduct } from '@/lib/supplier-context';
import { saveOrder, generateOrderId } from '@/lib/orders-store';
import { downloadOrderPDF, buildWhatsAppUrl } from '@/lib/supplier-pdf';

interface CartItem { product: InventoryProduct; qty: number; }

interface Props {
  cart: CartItem[];
  profile: SupplierProfile;
  onClose: () => void;
  onSuccess: () => void;
}

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const SHIPPING_ICONS = {
  pickup:     <Store className="h-5 w-5" />,
  centro:     <Package className="h-5 w-5" />,
  paqueteria: <Truck className="h-5 w-5" />,
};

export function SupplierCheckoutModal({ cart, profile, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [form, setForm] = useState<CustomerForm>({ name: '', phone: '', email: '', address: '' });
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [formError, setFormError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shippingCost = selectedShipping?.cost ?? 0;
  const total = subtotal + shippingCost;
  const enabledMethods = profile.storeConfig?.shippingMethods?.filter((m) => m.enabled) ?? [];

  const handleStep0Next = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Nombre y teléfono son obligatorios.');
      return;
    }
    setFormError('');
    setStep(1);
  };

  const handleStep1Next = () => {
    if (!selectedShipping) return;
    setStep(2);
  };

  const handleConfirm = () => {
    const orderId = generateOrderId();
    const createdAt = new Date().toISOString();

    saveOrder({
      id: orderId,
      status: 'pending',
      createdAt,
      customer: {
        name: form.name,
        phone: form.phone,
        address: form.address || '—',
        zone: selectedShipping?.label ?? '',
      },
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        qty: i.qty,
        image: i.product.image,
      })),
      total,
      paymentMethod: 'transfer',
      isAdvance: false,
      amountPaid: 0,
      supplierSlug: profile.slug,
      shippingMethod: selectedShipping?.label ?? '',
      shippingCost,
    });

    setConfirmedOrderId(orderId);
    onSuccess(); // limpia carrito en el padre
    setStep(3);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await downloadOrderPDF({
        orderId: confirmedOrderId,
        createdAt: new Date().toISOString(),
        storeName: profile.storeName,
        storeAddress: profile.address,
        storePhone: profile.phone,
        storeEmail: profile.email,
        customer: { name: form.name, phone: form.phone, email: form.email, address: form.address },
        items: cart.map((i) => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
        subtotal,
        shippingMethod: selectedShipping?.label ?? '',
        shippingCost,
        total,
        bankInfo: profile.storeConfig?.bankInfo ?? { beneficiary: '', bank: '', accountNumber: '', clabe: '', concept: '' },
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const wa = profile.storeConfig?.whatsappNumber || profile.phone;
    const url = buildWhatsAppUrl({
      whatsappNumber: wa,
      orderId: confirmedOrderId,
      storeName: profile.storeName,
      customer: { name: form.name, phone: form.phone, address: form.address },
      items: cart.map((i) => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
      shippingMethod: selectedShipping?.label ?? '',
      shippingCost,
      total,
      bankInfo: profile.storeConfig?.bankInfo ?? { beneficiary: '', bank: '', accountNumber: '', clabe: '', concept: '' },
    });
    window.open(url, '_blank');
  };

  const brand = profile.brandColor;
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="font-bold text-gray-900 text-base">
              {step === 0 && 'Datos de contacto'}
              {step === 1 && 'Método de entrega'}
              {step === 2 && 'Resumen del pedido'}
              {step === 3 && 'Pedido confirmado'}
            </p>
            {step < 3 && (
              <p className="text-xs text-gray-400 mt-0.5">Paso {step + 1} de 3</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        {step < 3 && (
          <div className="h-1 bg-gray-100 flex-shrink-0">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${((step + 1) / 3) * 100}%`, backgroundColor: brand }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── Paso 0: Datos del cliente ─────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Mini resumen carrito */}
              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <p className="text-gray-500 mb-1">{cart.length} producto{cart.length !== 1 ? 's' : ''} en el carrito</p>
                <p className="font-black text-lg" style={{ color: brand }}>
                  Subtotal: ${subtotal.toFixed(2)} MXN
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Nombre completo *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Tu nombre"
                  style={{ '--tw-ring-color': brand } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Teléfono *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                  placeholder="351 000 0000"
                  style={{ '--tw-ring-color': brand } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                  placeholder="correo@ejemplo.com"
                  style={{ '--tw-ring-color': brand } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Dirección</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputCls}
                  placeholder="Calle, número, colonia…"
                  style={{ '--tw-ring-color': brand } as React.CSSProperties}
                />
              </div>

              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}
            </div>
          )}

          {/* ── Paso 1: Método de envío ───────────────────────── */}
          {step === 1 && (
            <div className="space-y-3">
              {enabledMethods.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  El proveedor no tiene métodos de entrega configurados aún.
                </p>
              )}
              {enabledMethods.map((method) => {
                const isSelected = selectedShipping?.type === method.type;
                return (
                  <button
                    key={method.type}
                    onClick={() => setSelectedShipping(method)}
                    className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: isSelected ? brand : '#E5E7EB',
                      backgroundColor: isSelected ? `${brand}08` : 'white',
                    }}
                  >
                    <div
                      className="mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? `${brand}15` : '#F3F4F6', color: isSelected ? brand : '#6B7280' }}
                    >
                      {SHIPPING_ICONS[method.type]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {method.cost === 0 ? (
                        <span className="text-sm font-bold text-green-600">Gratis</span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: brand }}>${method.cost.toFixed(2)}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Paso 2: Resumen ───────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Productos */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Productos</p>
                <div className="divide-y divide-gray-100">
                  {cart.map(({ product, qty }) => (
                    <div key={product.id} className="flex justify-between py-2.5 text-sm">
                      <span className="text-gray-700">{product.name} <span className="text-gray-400">×{qty}</span></span>
                      <span className="font-bold text-gray-900">${(product.price * qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{selectedShipping?.label}</span>
                  {shippingCost === 0 ? (
                    <span className="font-medium text-green-600">Gratis</span>
                  ) : (
                    <span className="font-medium text-gray-900">${shippingCost.toFixed(2)}</span>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-black text-lg" style={{ color: brand }}>${total.toFixed(2)} MXN</span>
                </div>
              </div>

              {/* Datos bancarios */}
              {(() => {
                const b = profile.storeConfig?.bankInfo;
                if (!b?.bank && !b?.clabe) return null;
                return (
                  <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">Pago por transferencia bancaria</p>
                    <div className="space-y-1.5 text-sm">
                      {b.beneficiary  && <Row label="Beneficiario" value={b.beneficiary} />}
                      {b.bank         && <Row label="Banco"        value={b.bank} />}
                      {b.accountNumber && <Row label="Cuenta"      value={b.accountNumber} />}
                      {b.clabe        && <Row label="CLABE"        value={b.clabe} />}
                      {b.concept      && <Row label="Concepto"     value={b.concept} />}
                    </div>
                  </div>
                );
              })()}

              <p className="text-xs text-gray-400 text-center">
                Al confirmar, recibirás un PDF y podrás enviar tu pedido por WhatsApp.
              </p>
            </div>
          )}

          {/* ── Paso 3: Confirmación ──────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col items-center py-4 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${brand}15` }}
              >
                <Check className="h-8 w-8" style={{ color: brand }} />
              </div>
              <p className="font-black text-xl text-gray-900 mb-1">Pedido registrado</p>
              <p className="text-sm text-gray-500 mb-1">Número de orden</p>
              <p className="font-mono font-bold text-lg mb-5" style={{ color: brand }}>{confirmedOrderId}</p>

              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-sm text-amber-800 mb-6">
                <p className="font-bold mb-1">¿Cómo confirmar tu pedido?</p>
                <ol className="space-y-1 list-decimal list-inside text-xs">
                  <li>Descarga el PDF con los detalles del pedido.</li>
                  <li>Realiza la transferencia a los datos bancarios del proveedor.</li>
                  <li>Envía el PDF y el comprobante de pago por WhatsApp.</li>
                  <li>El proveedor confirmará tu pedido al recibir el pago.</li>
                </ol>
              </div>

              <div className="w-full space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all disabled:opacity-60"
                  style={{ borderColor: brand, color: brand }}
                >
                  <Download className="h-4 w-4" />
                  {downloading ? 'Generando PDF…' : 'Descargar PDF del pedido'}
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar por WhatsApp
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Buttons */}
        {step < 3 && (
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Atrás
              </button>
            )}
            <button
              onClick={step === 0 ? handleStep0Next : step === 1 ? handleStep1Next : handleConfirm}
              disabled={step === 1 && !selectedShipping}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: brand }}
            >
              {step === 2 ? (
                <>
                  <Check className="h-4 w-4" />
                  Confirmar pedido
                </>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-amber-700 shrink-0">{label}:</span>
      <span className="font-bold text-amber-900 text-right break-all">{value}</span>
    </div>
  );
}
