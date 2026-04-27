'use client';

import { useState } from 'react';
import {
  X, ChevronRight, ChevronLeft, Check, Download, MessageCircle,
  Truck, Store, Package, Copy, Clock, Banknote, CreditCard,
} from 'lucide-react';
import { SupplierProfile, ShippingMethod, ZonedPricing } from '@/lib/supplier-context';
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
  postalCode: string;
}

type PaymentMethod = 'transfer' | 'cash';

/* ── Mapeo CP → zona (distancia desde Guadalajara) ───────────────── */
function getCPZone(cp: string): keyof ZonedPricing {
  if (!cp || cp.length < 2) return 'lejano';
  const prefix = parseInt(cp.substring(0, 2), 10);
  // Local: Jalisco (44-49), Michoacán (58-61), Colima (28), Nayarit (63)
  if ([44, 45, 46, 47, 48, 49, 58, 59, 60, 61, 28, 63].includes(prefix)) return 'local';
  // Regional: Aguascalientes (20), Durango (34-35), Guanajuato (36-38),
  //           Querétaro (76), SLP (78-79), Sinaloa (80-82), Zacatecas (98-99)
  if ([20, 34, 35, 36, 37, 38, 76, 78, 79, 80, 81, 82, 98, 99].includes(prefix)) return 'regional';
  // Centro: CDMX (01-16), Hidalgo (42-43), EdoMex (50-57),
  //         Morelos (62), Puebla (72-75), Tlaxcala (90-91)
  if (
    (prefix >= 1 && prefix <= 16) ||
    [42, 43, 50, 51, 52, 53, 54, 55, 56, 57, 62, 72, 73, 74, 75, 90, 91].includes(prefix)
  ) return 'centro';
  return 'lejano';
}

const ZONE_NAMES: Record<keyof ZonedPricing, string> = {
  local:    'Zona local (Jalisco, Michoacán, Colima…)',
  regional: 'Zona regional (Bajío, Sinaloa, SLP…)',
  centro:   'Zona centro (CDMX, Puebla, EdoMex…)',
  lejano:   'Zona lejana (Norte, Sur, Sureste…)',
};

function getShippingCost(method: ShippingMethod, postalCode: string): number {
  if (method.type === 'paqueteria' && method.zonedPricing) {
    return method.zonedPricing[getCPZone(postalCode)];
  }
  return method.cost;
}

const SHIPPING_ICONS: Record<string, React.ReactNode> = {
  pickup:     <Store   className="h-5 w-5" />,
  paqueteria: <Truck   className="h-5 w-5" />,
  rappi:      <Package className="h-5 w-5" />,
};

/* ── Botón copiar al portapapeles ────────────────────────────────── */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex-shrink-0 px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 flex items-center gap-1 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

/* ── Componente principal ─────────────────────────────────────────── */
export function SupplierCheckoutModal({ cart, profile, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [form, setForm] = useState<CustomerForm>({
    name: '', phone: '', email: '', address: '', postalCode: '',
  });
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [transferPopupOpen, setTransferPopupOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [confirmedCart, setConfirmedCart] = useState<CartItem[]>([]);
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(0);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [formError, setFormError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shippingCost = selectedShipping ? getShippingCost(selectedShipping, form.postalCode) : 0;
  const total = subtotal + shippingCost;
  const enabledMethods = profile.storeConfig?.shippingMethods?.filter((m) => m.enabled) ?? [];
  const bankInfo = profile.storeConfig?.bankInfo ?? {
    beneficiary: '', bank: '', accountNumber: '', clabe: '', concept: '',
  };

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
    if (!paymentMethod) return;
    const orderId = generateOrderId();

    // Guardar snapshot del carrito ANTES de que onSuccess lo limpie
    setConfirmedCart([...cart]);
    setConfirmedSubtotal(subtotal);
    setConfirmedTotal(total);

    saveOrder({
      id: orderId,
      status: 'pending',
      createdAt: new Date().toISOString(),
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
      paymentMethod,
      isAdvance: false,
      amountPaid: 0,
      supplierSlug: profile.slug,
      shippingMethod: selectedShipping?.label ?? '',
      shippingCost,
    });

    setConfirmedOrderId(orderId);
    onSuccess();
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
        items: confirmedCart.map((i) => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
        subtotal: confirmedSubtotal,
        shippingMethod: selectedShipping?.label ?? '',
        shippingCost,
        total: confirmedTotal,
        bankInfo,
        paymentMethod: paymentMethod ?? 'transfer',
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
      customer: { name: form.name, phone: form.phone, email: form.email, address: form.address },
      items: confirmedCart.map((i) => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
      shippingMethod: selectedShipping?.label ?? '',
      shippingCost,
      subtotal: confirmedSubtotal,
      total: confirmedTotal,
      bankInfo,
      paymentMethod: paymentMethod ?? 'transfer',
    });
    window.open(url, '_blank');
  };

  const brand = profile.brandColor;
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white text-gray-900';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5';
  const stepTitles = ['Datos de contacto', 'Método de entrega', 'Pago y resumen', 'Pedido confirmado'];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden">

        {/* ── Popup datos de transferencia ──────────────────────── */}
        {transferPopupOpen && (
          <div className="absolute inset-0 z-10 bg-white rounded-t-3xl sm:rounded-3xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <p className="font-bold text-gray-900">Datos para transferencia bancaria</p>
              <button onClick={() => setTransferPopupOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {/* Filas de datos bancarios con botón copiar */}
              {bankInfo.beneficiary && (
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Beneficiario</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{bankInfo.beneficiary}</p>
                  </div>
                  <CopyButton value={bankInfo.beneficiary} />
                </div>
              )}
              {bankInfo.bank && (
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Banco</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{bankInfo.bank}</p>
                  </div>
                  <CopyButton value={bankInfo.bank} />
                </div>
              )}
              {bankInfo.accountNumber && (
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Número de cuenta</p>
                    <p className="text-sm font-bold font-mono text-gray-900 mt-0.5">{bankInfo.accountNumber}</p>
                  </div>
                  <CopyButton value={bankInfo.accountNumber} />
                </div>
              )}
              {bankInfo.clabe && (
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">CLABE interbancaria</p>
                    <p className="text-sm font-bold font-mono text-gray-900 mt-0.5">{bankInfo.clabe}</p>
                  </div>
                  <CopyButton value={bankInfo.clabe} />
                </div>
              )}
              {bankInfo.concept && (
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Concepto</p>
                    <p className="text-sm font-bold text-gray-900 mt-0.5">{bankInfo.concept}</p>
                  </div>
                  <CopyButton value={bankInfo.concept} />
                </div>
              )}

              {/* Monto a transferir */}
              <div
                className="p-4 rounded-2xl text-center border-2"
                style={{ borderColor: brand, backgroundColor: `${brand}08` }}
              >
                <p className="text-xs text-gray-500 mb-1">Monto a transferir</p>
                <p className="text-2xl font-black mb-2" style={{ color: brand }}>${total.toFixed(2)} MXN</p>
                <CopyButton value={total.toFixed(2)} />
              </div>

              {/* Aviso 6 horas */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Confirmación en máximo 6 horas</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Las transferencias bancarias se verifican y confirman en un lapso de 6 horas hábiles.
                    Una vez confirmada, tu pedido será procesado y surtido.
                  </p>
                </div>
              </div>

              {/* Aviso WhatsApp */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-sm font-bold text-green-800 mb-1">Envía tu comprobante</p>
                <p className="text-xs text-green-700">
                  Después de hacer la transferencia, envía la captura de tu comprobante al proveedor
                  por WhatsApp para agilizar la confirmación.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => setTransferPopupOpen(false)}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brand }}
              >
                Entendido — continuar
              </button>
            </div>
          </div>
        )}

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p className="font-bold text-gray-900 text-base">{stepTitles[step]}</p>
            {step < 3 && <p className="text-xs text-gray-400 mt-0.5">Paso {step + 1} de 3</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de progreso */}
        {step < 3 && (
          <div className="h-1 bg-gray-100 flex-shrink-0">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${((step + 1) / 3) * 100}%`, backgroundColor: brand }}
            />
          </div>
        )}

        {/* ── Contenido ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Paso 0: Datos de contacto */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                <p className="text-gray-500 mb-1">{cart.length} producto{cart.length !== 1 ? 's' : ''} en el carrito</p>
                <p className="font-black text-lg" style={{ color: brand }}>Subtotal: ${subtotal.toFixed(2)} MXN</p>
              </div>

              <div>
                <label className={labelCls}>Nombre completo *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="Tu nombre"
                  style={{ '--tw-ring-color': brand } as React.CSSProperties}
                />
              </div>
              <div>
                <label className={labelCls}>Teléfono *</label>
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
                <label className={labelCls}>Correo electrónico</label>
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
                <label className={labelCls}>Dirección</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputCls}
                  placeholder="Calle, número, colonia…"
                  style={{ '--tw-ring-color': brand } as React.CSSProperties}
                />
              </div>
              <div>
                <label className={labelCls}>Código postal</label>
                <input
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                  className={inputCls}
                  placeholder="59600"
                  maxLength={5}
                  style={{ '--tw-ring-color': brand } as React.CSSProperties}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Necesario para calcular el costo de envío por paquetería
                </p>
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}
            </div>
          )}

          {/* Paso 1: Método de entrega */}
          {step === 1 && (
            <div className="space-y-3">
              {enabledMethods.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  El proveedor no tiene métodos de entrega configurados aún.
                </p>
              )}
              {enabledMethods.map((method) => {
                const isSelected = selectedShipping?.type === method.type;
                const cost = getShippingCost(method, form.postalCode);
                const zone = method.type === 'paqueteria' && method.zonedPricing && form.postalCode.length === 5
                  ? getCPZone(form.postalCode)
                  : null;

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
                      style={{
                        backgroundColor: isSelected ? `${brand}15` : '#F3F4F6',
                        color: isSelected ? brand : '#6B7280',
                      }}
                    >
                      {SHIPPING_ICONS[method.type]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                      {zone && (
                        <p className="text-xs mt-1 font-medium" style={{ color: brand }}>
                          {ZONE_NAMES[zone]}
                        </p>
                      )}
                      {method.type === 'paqueteria' && form.postalCode.length < 5 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Ingresa tu CP en el paso anterior para ver el costo exacto
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {cost === 0 ? (
                        <span className="text-sm font-bold text-green-600">Gratis</span>
                      ) : (
                        <span className="text-sm font-bold" style={{ color: brand }}>
                          ${cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Paso 2: Pago y resumen */}
          {step === 2 && (
            <div className="space-y-5">

              {/* Método de pago */}
              <div>
                <p className={labelCls}>Método de pago</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setPaymentMethod('transfer'); setTransferPopupOpen(true); }}
                    className="p-4 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: paymentMethod === 'transfer' ? brand : '#E5E7EB',
                      backgroundColor: paymentMethod === 'transfer' ? `${brand}08` : 'white',
                    }}
                  >
                    <CreditCard className="h-5 w-5 mb-2" style={{ color: paymentMethod === 'transfer' ? brand : '#6B7280' }} />
                    <p className="text-sm font-bold text-gray-900">Transferencia</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Datos bancarios</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className="p-4 rounded-2xl border-2 transition-all text-left"
                    style={{
                      borderColor: paymentMethod === 'cash' ? brand : '#E5E7EB',
                      backgroundColor: paymentMethod === 'cash' ? `${brand}08` : 'white',
                    }}
                  >
                    <Banknote className="h-5 w-5 mb-2" style={{ color: paymentMethod === 'cash' ? brand : '#6B7280' }} />
                    <p className="text-sm font-bold text-gray-900">Efectivo</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Pago en tienda</p>
                  </button>
                </div>

                {/* Acceso rápido a datos bancarios si ya eligió transferencia */}
                {paymentMethod === 'transfer' && (
                  <button
                    onClick={() => setTransferPopupOpen(true)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Ver datos bancarios para copiar
                  </button>
                )}

                {/* Aviso efectivo */}
                {paymentMethod === 'cash' && (
                  <div className="mt-3 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <Banknote className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">Pago en efectivo en tienda</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Tu pedido será surtido y entregado al momento de realizar el pago en
                        efectivo en la tienda del proveedor.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Resumen de productos */}
              <div>
                <p className={labelCls}>Productos</p>
                <div className="divide-y divide-gray-100">
                  {cart.map(({ product, qty }) => (
                    <div key={product.id} className="flex justify-between py-2.5 text-sm">
                      <span className="text-gray-700">
                        {product.name} <span className="text-gray-400">×{qty}</span>
                      </span>
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
                  <span className="font-black text-lg" style={{ color: brand }}>
                    ${total.toFixed(2)} MXN
                  </span>
                </div>
              </div>

              {!paymentMethod && (
                <p className="text-xs text-center text-amber-600 font-medium">
                  Selecciona un método de pago para continuar
                </p>
              )}
            </div>
          )}

          {/* Paso 3: Pedido confirmado */}
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
              <p className="font-mono font-bold text-lg mb-5" style={{ color: brand }}>
                {confirmedOrderId}
              </p>

              {paymentMethod === 'transfer' ? (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-sm text-amber-800 mb-6">
                  <p className="font-bold mb-2">¿Cómo confirmar tu pedido?</p>
                  <ol className="space-y-1.5 list-decimal list-inside text-xs">
                    <li>Realiza la transferencia a los datos bancarios del proveedor.</li>
                    <li>Descarga el PDF con el resumen de tu pedido.</li>
                    <li>Haz clic en &quot;Enviar por WhatsApp&quot; y adjunta el PDF y tu comprobante de transferencia.</li>
                    <li>El proveedor confirmará tu pedido en máximo 6 horas hábiles.</li>
                  </ol>
                </div>
              ) : (
                <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left text-sm text-blue-800 mb-6">
                  <p className="font-bold mb-1">Pago en efectivo en tienda</p>
                  <p className="text-xs">
                    Tu pedido será surtido y entregado cuando pagues en efectivo en la tienda.
                    Puedes enviar los detalles al proveedor por WhatsApp para coordinar.
                  </p>
                </div>
              )}

              <div className="w-full space-y-3">
                {paymentMethod === 'transfer' && (
                  <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all disabled:opacity-60"
                    style={{ borderColor: brand, color: brand }}
                  >
                    <Download className="h-4 w-4" />
                    {downloading ? 'Generando PDF…' : 'Descargar PDF del pedido'}
                  </button>
                )}

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar pedido por WhatsApp al proveedor
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

        {/* ── Botones de navegación ──────────────────────────────── */}
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
              onClick={
                step === 0 ? handleStep0Next
                : step === 1 ? handleStep1Next
                : handleConfirm
              }
              disabled={(step === 1 && !selectedShipping) || (step === 2 && !paymentMethod)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: brand }}
            >
              {step === 2 ? (
                <><Check className="h-4 w-4" />Confirmar pedido</>
              ) : (
                <>Siguiente<ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
