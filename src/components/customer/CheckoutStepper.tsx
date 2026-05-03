'use client';

import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2, MapPin, CreditCard, Package, LogIn,
  Truck, Store, ChevronRight, Copy, Check, Clock,
  MessageCircle, X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { saveOrder, generateOrderId, SupplierPackage } from '@/lib/orders-store';
import {
  getMCStoreConfig, type MCStoreConfig, type ShippingMethod, type BankInfo,
} from '@/lib/mc-store-config';
import { buildWhatsAppUrl } from '@/lib/supplier-pdf';

// ─── Helpers ──────────────────────────────────────────────────

function getCPZone(cp: string): 'local' | 'regional' | 'centro' | 'lejano' {
  if (!cp || cp.length < 2) return 'lejano';
  const p = parseInt(cp.substring(0, 2), 10);
  if ([44,45,46,47,48,49,58,59,60,61,28,63].includes(p)) return 'local';
  if ([20,34,35,36,37,38,76,78,79,80,81,82,98,99].includes(p)) return 'regional';
  if ((p >= 1 && p <= 16) || [42,43,50,51,52,53,54,55,56,57,62,72,73,74,75,90,91].includes(p)) return 'centro';
  return 'lejano';
}

function getShippingCost(method: ShippingMethod, postalCode: string): number {
  if (method.type === 'paqueteria' && method.zonedPricing) {
    return method.zonedPricing[getCPZone(postalCode)] ?? 0;
  }
  return method.cost;
}

const SHIPPING_ICONS: Record<string, React.ReactNode> = {
  pickup:     <Store   className="h-5 w-5" />,
  paqueteria: <Truck   className="h-5 w-5" />,
  rappi:      <Package className="h-5 w-5" />,
};

const SUPPLIER_EMAILS: Record<string, string> = {
  'fashion-hogar-zamora': 'proveedor@mariasclub.com',
  'deportes-tech-zamora': 'proveedor2@mariasclub.com',
};

function buildSupplierPackages(items: ReturnType<typeof useCart>['items']): SupplierPackage[] {
  const map = new Map<string, SupplierPackage>();
  for (const item of items) {
    const sid = item.product.supplierId;
    if (!sid) continue;
    if (!map.has(sid)) {
      map.set(sid, {
        supplierId: sid,
        supplierName: item.product.supplierName,
        supplierEmail: SUPPLIER_EMAILS[sid] ?? '',
        itemIds: [],
        status: 'pending',
      });
    }
    map.get(sid)!.itemIds.push(item.product.id);
  }
  return Array.from(map.values());
}

// ─── Copy button ──────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex-shrink-0 px-2.5 py-1 rounded-lg border border-[#EDEBE8] text-xs font-medium text-[#6B6359] hover:bg-[#F7F6F5] flex items-center gap-1 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-[#00C9B1]" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}

// ─── Bank info popup ───────────────────────────────────────────

function BankInfoPopup({ bankInfo, total, onClose }: { bankInfo: BankInfo; total: number; onClose: () => void }) {
  const rows: { label: string; key: keyof BankInfo }[] = [
    { label: 'Beneficiario', key: 'beneficiary' },
    { label: 'Banco',        key: 'bank'         },
    { label: 'N° de cuenta', key: 'accountNumber' },
    { label: 'CLABE',        key: 'clabe'        },
    { label: 'Concepto',     key: 'concept'      },
  ];
  return (
    <div className="absolute inset-0 z-10 bg-white rounded-2xl flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEBE8] flex-shrink-0">
        <p className="font-bold text-[#0A0A0A] text-sm">Datos para transferencia bancaria</p>
        <button onClick={onClose} className="text-[#8F8780] hover:text-[#0A0A0A] p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {rows.map(({ label, key }) => bankInfo[key] && (
          <div key={key} className="flex items-center justify-between gap-3 p-3 bg-[#F7F6F5] rounded-xl">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8780]">{label}</p>
              <p className="text-sm font-bold text-[#0A0A0A] mt-0.5 font-mono">{bankInfo[key]}</p>
            </div>
            <CopyButton value={bankInfo[key] as string} />
          </div>
        ))}
        <div className="p-4 rounded-2xl text-center border-2 border-[#00C9B1] bg-[#00C9B1]/5">
          <p className="text-xs text-[#6B6359] mb-1">Monto a transferir</p>
          <p className="text-2xl font-black text-[#00C9B1] mb-2">${total.toFixed(2)} MXN</p>
          <CopyButton value={total.toFixed(2)} />
        </div>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Confirmación en máximo 6 horas</p>
            <p className="text-xs text-amber-700 mt-1">
              Las transferencias se verifican en un lapso de 6 horas hábiles. Una vez confirmada, tu pedido será surtido.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step definitions ─────────────────────────────────────────

const steps = [
  { label: 'Datos',    icon: MapPin      },
  { label: 'Envío',    icon: Truck       },
  { label: 'Pago',     icon: CreditCard  },
  { label: 'Confirmar', icon: Package    },
];

// ─── Main component ───────────────────────────────────────────

export function CheckoutStepper() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isAdvance, setIsAdvance] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const [bankPopupOpen, setBankPopupOpen] = useState(false);
  const stepsRef  = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<MCStoreConfig | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', postalCode: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const cfg = getMCStoreConfig();
    setConfig(cfg);
    // Pre-select first enabled payment method
    const firstPay = cfg.paymentMethods.find((m) => m.enabled);
    if (firstPay) setPaymentMethod(firstPay.id);
  }, []);

  const shippingCost = selectedShipping ? getShippingCost(selectedShipping, form.postalCode) : 0;
  const grandTotal   = total + shippingCost;
  const amountPaid   = isAdvance ? grandTotal * 0.5 : grandTotal;

  const enabledShipping  = config?.shippingMethods.filter((m) => m.enabled) ?? [];
  const enabledPayments  = config?.paymentMethods.filter((m) => m.enabled) ?? [];
  const bankInfo         = config?.bankInfo ?? { beneficiary: '', bank: '', accountNumber: '', clabe: '', concept: '' };

  // GSAP step transition
  const animateStep = (dir: 1 | -1) => {
    requestAnimationFrame(() => {
      gsap.fromTo(contentRef.current, { x: dir * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
    });
  };

  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;
    const nodes = stepsRef.current?.querySelectorAll('.step-node');
    if (nodes?.length) gsap.fromTo(nodes[step], { scale: 0.82 }, { scale: 1, duration: 0.35, ease: 'back.out(1.5)' });
  }, [step]);

  function goNext() {
    if (step === 0) {
      if (!form.name.trim() || !form.phone.trim()) {
        setFormError('Nombre y teléfono son obligatorios.');
        return;
      }
      setFormError('');
    }
    if (step === 1 && !selectedShipping) return;

    if (step === 2) {
      // Save order
      const orderId = generateOrderId();
      saveOrder({
        id: orderId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        customer: {
          name: form.name,
          email: form.email || undefined,
          phone: form.phone,
          address: form.address,
          zone: selectedShipping?.label ?? '',
        },
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          qty: i.qty,
          image: i.product.images[0] ?? '',
          size: i.size,
          color: i.color,
          supplierId: i.product.supplierId,
          supplierName: i.product.supplierName,
        })),
        total: grandTotal,
        paymentMethod,
        isAdvance,
        amountPaid,
        supplierPackages: buildSupplierPackages(items),
      });
      setConfirmedOrderId(orderId);
      clearCart();
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'order_placed', orderId }),
      }).catch(() => {});
    }

    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      animateStep(1);
    }
  }

  function goPrev() {
    if (step > 0) {
      setStep((s) => s - 1);
      animateStep(-1);
    }
  }

  function handleWhatsApp() {
    if (!config?.whatsappNumber) return;
    const url = buildWhatsAppUrl({
      whatsappNumber: config.whatsappNumber,
      orderId: confirmedOrderId,
      storeName: 'MARIASCLUB™',
      customer: { name: form.name, phone: form.phone, email: form.email, address: form.address },
      items: items.map((i) => ({ name: i.product.name, qty: i.qty, price: i.product.price })),
      shippingMethod: selectedShipping?.label ?? '',
      shippingCost,
      subtotal: total,
      total: grandTotal,
      bankInfo,
      paymentMethod: paymentMethod as 'transfer' | 'cash',
    });
    window.open(url, '_blank');
  }

  // Empty cart
  if (items.length === 0 && step === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Package className="h-12 w-12 text-[#D9D5CF] mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-2">Tu carrito está vacío</h2>
        <p className="text-[#6B6359] font-body mb-6">Agrega productos antes de continuar.</p>
        <Link href="/shop" className="inline-flex items-center justify-center px-6 py-3 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#00C9B1] transition-colors">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* Step indicator */}
      <div ref={stepsRef} className="flex items-center justify-center mb-10 gap-0">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done   = i < step;
          const active = i === step;
          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`step-node w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  done   ? 'bg-[#00C9B1] border-[#00C9B1] text-white' :
                  active ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' :
                           'border-[#EDEBE8] text-[#D9D5CF]'
                }`}>
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-[#0A0A0A]' : 'text-[#8F8780]'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-14 sm:w-24 h-px mx-2 mb-5 transition-all duration-500"
                  style={{ background: i < step ? '#00C9B1' : '#EDEBE8' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div ref={contentRef} className="relative">

        {/* ── Step 0: Datos de contacto ── */}
        {step === 0 && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Datos de contacto</h2>

            {!user && (
              <div className="flex items-center justify-between gap-3 bg-[#F0FDF9] border border-[#00C9B1]/30 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-[#00C9B1] flex-shrink-0" />
                  <p className="text-xs text-[#6B6359] font-body">Inicia sesión para rastrear tu pedido desde tu cuenta.</p>
                </div>
                <Link href="/login" className="text-xs font-semibold text-[#0A0A0A] whitespace-nowrap border border-[#EDEBE8] px-3 py-1.5 rounded-lg hover:border-[#0A0A0A] transition-colors">
                  Iniciar sesión
                </Link>
              </div>
            )}

            {/* Cart summary */}
            <div className="bg-[#F7F6F5] rounded-xl p-3 space-y-2">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body text-[#0A0A0A] truncate">{item.product.name} × {item.qty}</p>
                    {(item.size || item.color) && (
                      <p className="text-xs text-[#8F8780]">{[item.color, item.size].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                  <span className="text-sm font-semibold flex-shrink-0">${(item.product.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {[
              { key: 'name',       label: 'Nombre Completo',    placeholder: 'María García',         type: 'text'  },
              { key: 'email',      label: 'Correo electrónico', placeholder: 'tucorreo@ejemplo.com', type: 'email', optional: true },
              { key: 'phone',      label: 'Teléfono',           placeholder: '+52 351 000 0000',     type: 'tel'   },
              { key: 'address',    label: 'Calle y Número',     placeholder: 'Calle Hidalgo 45',     type: 'text'  },
              { key: 'postalCode', label: 'Código Postal',      placeholder: '59690',                type: 'text', optional: true },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  {field.label}
                  {field.optional && <span className="ml-1 text-[#C0BAB2] normal-case font-normal">(opcional)</span>}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-[#EDEBE8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9B1] font-body"
                />
              </div>
            ))}
            {formError && <p className="text-xs text-red-600 font-body">{formError}</p>}
          </div>
        )}

        {/* ── Step 1: Método de envío ── */}
        {step === 1 && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Método de envío</h2>

            {enabledShipping.length === 0 ? (
              <p className="text-sm text-[#8F8780] font-body">No hay métodos de envío configurados.</p>
            ) : (
              <div className="space-y-2">
                {enabledShipping.map((method) => {
                  const cost = getShippingCost(method, form.postalCode);
                  const active = selectedShipping?.type === method.type;
                  return (
                    <button
                      key={method.type}
                      onClick={() => setSelectedShipping(method)}
                      className={`w-full flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all text-left ${
                        active ? 'border-[#0A0A0A] bg-[#F7F6F5]' : 'border-[#EDEBE8] hover:border-[#D9D5CF]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#0A0A0A] text-white' : 'bg-[#F7F6F5] text-[#6B6359]'}`}>
                        {SHIPPING_ICONS[method.type]}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0A0A0A]">{method.label}</p>
                        <p className="text-xs text-[#8F8780] font-body mt-0.5">{method.description}</p>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${cost === 0 ? 'text-[#00C9B1]' : 'text-[#0A0A0A]'}`}>
                        {cost === 0 ? 'Gratis' : `$${cost.toFixed(2)}`}
                      </span>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${active ? 'border-[#0A0A0A] bg-[#0A0A0A]' : 'border-[#D9D5CF]'}`} />
                    </button>
                  );
                })}
              </div>
            )}

            <Separator className="bg-[#EDEBE8]" />
            <div className="flex justify-between text-sm font-body">
              <span className="text-[#6B6359]">Subtotal productos</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-body">
              <span className="text-[#6B6359]">Envío</span>
              <span className={`font-semibold ${shippingCost === 0 ? 'text-[#00C9B1]' : ''}`}>
                {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
          </div>
        )}

        {/* ── Step 2: Pago ── */}
        {step === 2 && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-5 relative overflow-hidden">

            {bankPopupOpen && (
              <BankInfoPopup
                bankInfo={bankInfo}
                total={amountPaid}
                onClose={() => setBankPopupOpen(false)}
              />
            )}

            <h2 className="font-display text-2xl font-bold text-[#0A0A0A]">Pago</h2>

            {/* Order summary */}
            <div className="bg-[#F7F6F5] rounded-xl p-4 space-y-2">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm font-body gap-2">
                  <span className="text-[#6B6359] truncate">{item.product.name} × {item.qty}</span>
                  <span className="font-semibold flex-shrink-0">${(item.product.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Envío — {selectedShipping?.label}</span>
                <span className={`font-semibold ${shippingCost === 0 ? 'text-[#00C9B1]' : ''}`}>
                  {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <Separator className="bg-[#EDEBE8] my-1" />
              <div className="flex justify-between font-body font-bold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0EEEB] rounded-xl">
              <button onClick={() => setIsAdvance(false)} className={`py-3 px-3 rounded-lg text-xs font-body font-semibold transition-all text-center ${!isAdvance ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B6359]'}`}>
                Pago Completo
                <div className="text-base font-bold mt-0.5">${grandTotal.toFixed(2)}</div>
              </button>
              <button onClick={() => setIsAdvance(true)} className={`py-3 px-3 rounded-lg text-xs font-body font-semibold transition-all text-center ${isAdvance ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B6359]'}`}>
                Anticipo (50%)
                <div className="text-base font-bold text-[#00C9B1] mt-0.5">${(grandTotal * 0.5).toFixed(2)}</div>
              </button>
            </div>

            {/* Payment methods */}
            <div className="space-y-2">
              {enabledPayments.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id ? 'border-[#0A0A0A] bg-[#F7F6F5]' : 'border-[#EDEBE8] hover:border-[#D9D5CF]'
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm font-body font-medium text-[#0A0A0A] flex-1 text-left">{method.label}</span>
                  <div className={`w-4 h-4 rounded-full border-2 transition-all ${paymentMethod === method.id ? 'border-[#0A0A0A] bg-[#0A0A0A]' : 'border-[#D9D5CF]'}`} />
                </button>
              ))}
            </div>

            {/* Bank info CTA */}
            {paymentMethod === 'transfer' && (
              <button
                onClick={() => setBankPopupOpen(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#00C9B1]/40 bg-[#00C9B1]/5 hover:bg-[#00C9B1]/10 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#0A0A0A]">Ver datos bancarios</p>
                  <p className="text-xs text-[#6B6359] font-body mt-0.5">CLABE, número de cuenta y más</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#00C9B1]" />
              </button>
            )}
          </div>
        )}

        {/* ── Step 3: Confirmado ── */}
        {step === 3 && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-[#00C9B1]/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-[#00C9B1]" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-2">¡Pedido Confirmado!</h2>
              <p className="text-sm text-[#6B6359] font-body">
                Tu pedido <strong>{confirmedOrderId}</strong> ha sido registrado.
              </p>
              {isAdvance && (
                <p className="text-xs text-[#8F8780] mt-1">Anticipo de <strong>${(grandTotal * 0.5).toFixed(2)}</strong> pendiente.</p>
              )}
              {form.email && (
                <p className="text-xs text-[#8F8780] mt-1">Confirmación enviada a {form.email}</p>
              )}
            </div>

            <div className="bg-[#F7F6F5] rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Pedido</span>
                <span className="font-semibold font-mono">{confirmedOrderId}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Método de entrega</span>
                <span className="font-semibold">{selectedShipping?.label}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Forma de pago</span>
                <span className="font-semibold capitalize">{paymentMethod === 'transfer' ? 'Transferencia' : paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}</span>
              </div>
              <Separator className="bg-[#EDEBE8]" />
              <div className="flex justify-between font-body font-bold">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* WhatsApp */}
            {config?.whatsappNumber && (
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold bg-[#25D366] text-white hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-4 w-4" />
                Enviar pedido por WhatsApp
              </button>
            )}

            <Link
              href={`/tracking/${confirmedOrderId}`}
              className="flex items-center justify-center w-full h-12 rounded-xl bg-[#0A0A0A] text-white hover:bg-[#00C9B1] transition-colors text-sm font-semibold"
            >
              Rastrear mi pedido
            </Link>
            <Link href="/shop" className="block text-sm text-[#8F8780] hover:text-[#0A0A0A] transition-colors font-body">
              Seguir comprando →
            </Link>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 3 && (
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={goPrev}
              className="flex-1 h-10 rounded-xl border border-[#EDEBE8] text-[#6B6359] text-sm font-semibold hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors"
            >
              ← Regresar
            </button>
          )}
          <button
            onClick={goNext}
            disabled={
              (step === 0 && (!form.name || !form.phone)) ||
              (step === 1 && !selectedShipping) ||
              (step === 2 && !paymentMethod)
            }
            className="flex-1 h-10 rounded-xl bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#00C9B1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {step === 2
              ? `Realizar Pedido — $${amountPaid.toFixed(2)}`
              : 'Continuar →'}
          </button>
        </div>
      )}
    </div>
  );
}
