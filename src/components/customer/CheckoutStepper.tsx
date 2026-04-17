'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, MapPin, CreditCard, Package } from 'lucide-react';

const steps = [
  { label: 'Dirección', icon: MapPin },
  { label: 'Pago', icon: CreditCard },
  { label: 'Confirmar', icon: Package },
];

const ZONES = ['Zamora Centro', 'Zamora Norte', 'Zamora Sur', 'Jacona', 'Jiquilpan'];
const PAYMENT_METHODS = [
  { id: 'card', label: 'Tarjeta de Crédito / Débito', icon: '💳' },
  { id: 'transfer', label: 'Transferencia Bancaria', icon: '🏦' },
  { id: 'cash', label: 'Pago en Efectivo', icon: '💵' },
];

export function CheckoutStepper() {
  const [step, setStep] = useState(0);
  const [isAdvance, setIsAdvance] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const stepsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const orderTotal = 378.00;

  const goNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      requestAnimationFrame(() => {
        gsap.fromTo(contentRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
      });
    }
  };
  const goPrev = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      requestAnimationFrame(() => {
        gsap.fromTo(contentRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
      });
    }
  };

  /* ── Step node pulse on advance ───────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;
    const nodes = stepsRef.current?.querySelectorAll('.step-node');
    if (!nodes?.length) return;
    gsap.fromTo(nodes[step], { scale: 0.82 }, { scale: 1, duration: 0.35, ease: 'back.out(1.5)' });
  }, [step]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Step indicator */}
      <div ref={stepsRef} className="flex items-center justify-center mb-10 gap-0">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i < step;
          const active = i === step;
          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`step-node w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done ? 'bg-[#00C9B1] border-[#00C9B1] text-white' :
                    active ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white' :
                    'border-[#EDEBE8] text-[#D9D5CF]'
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-[#0A0A0A]' : 'text-[#8F8780]'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-20 sm:w-32 h-px mx-2 mb-5 transition-all duration-500" style={{
                  background: i < step
                    ? 'linear-gradient(to right, #00C9B1, #00C9B1)'
                    : '#EDEBE8'
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div ref={contentRef}>
        {step === 0 && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-5">Dirección de Entrega</h2>
            {[
              { label: 'Nombre Completo', placeholder: 'María García', type: 'text' },
              { label: 'Teléfono', placeholder: '+52 351 000 0000', type: 'tel' },
              { label: 'Calle y Número', placeholder: 'Calle Hidalgo 45', type: 'text' },
              { label: 'Ciudad', placeholder: 'Zamora', type: 'text' },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="w-full h-10 px-3 text-sm border border-[#EDEBE8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9B1] font-body"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                Zona de Entrega
              </label>
              <select className="w-full h-10 px-3 text-sm border border-[#EDEBE8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9B1] bg-white font-body">
                {ZONES.map((z) => <option key={z}>{z}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-5">
            <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-5">Pago</h2>

            {/* Resumen del pedido */}
            <div className="bg-[#F7F6F5] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Pro Blender 1200W × 2</span>
                <span className="font-semibold">$378.00</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Envío (Zamora Centro)</span>
                <span className="font-semibold text-[#00C9B1]">Gratis</span>
              </div>
              <Separator className="my-2 bg-[#EDEBE8]" />
              <div className="flex justify-between font-body font-bold">
                <span>Total</span>
                <span>${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Opción de pago */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2.5">Opción de Pago</p>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F6F5] rounded-xl">
                <button
                  onClick={() => setIsAdvance(false)}
                  className={`py-3 px-3 rounded-lg text-xs font-semibold transition-all ${!isAdvance ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B6359]'}`}
                >
                  Pago Completo
                  <div className="text-base font-bold mt-0.5">${orderTotal.toFixed(2)}</div>
                </button>
                <button
                  onClick={() => setIsAdvance(true)}
                  className={`py-3 px-3 rounded-lg text-xs font-semibold transition-all ${isAdvance ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B6359]'}`}
                >
                  Anticipo (50%)
                  <div className="text-base font-bold text-[#00C9B1] mt-0.5">${(orderTotal * 0.5).toFixed(2)}</div>
                </button>
              </div>
            </div>

            {/* Method */}
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                    paymentMethod === method.id ? 'border-[#0A0A0A] bg-[#F7F6F5]' : 'border-[#EDEBE8] hover:border-[#D9D5CF]'
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm font-body font-medium text-[#0A0A0A]">{method.label}</span>
                  <div className={`ml-auto w-4 h-4 rounded-full border-2 transition-all ${
                    paymentMethod === method.id ? 'border-[#0A0A0A] bg-[#0A0A0A]' : 'border-[#D9D5CF]'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 text-center">
            {/* Animated check */}
            <div className="w-20 h-20 rounded-full bg-[#00C9B1]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-[#00C9B1]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#0A0A0A] mb-2">¡Pedido Confirmado!</h2>
            <p className="text-sm text-[#6B6359] mb-6">
              Tu pedido <strong>#ORD-004</strong> ha sido registrado.{' '}
              {isAdvance && <span>Anticipo de <strong>${(orderTotal * 0.5).toFixed(2)}</strong> recibido. Saldo pendiente al entregar.</span>}
            </p>

            <div className="bg-[#F7F6F5] rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Pedido</span>
                <span className="font-semibold">#ORD-004</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Entrega estimada</span>
                <span className="font-semibold text-[#00C9B1]">4-6 hrs · Zamora Centro</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-[#6B6359]">Total cobrado</span>
                <span className="font-bold">${isAdvance ? (orderTotal * 0.5).toFixed(2) : orderTotal.toFixed(2)}</span>
              </div>
            </div>

            <a href="/tracking/ORD-004" className="inline-flex w-full items-center justify-center h-8 rounded-lg bg-[#0A0A0A] text-white hover:bg-[#00C9B1] transition-colors text-sm font-medium">
              Rastrear Mi Pedido
            </a>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 2 && (
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="outline" onClick={goPrev} className="flex-1 border-[#EDEBE8] text-[#6B6359]">
              ← Regresar
            </Button>
          )}
          <Button
            onClick={goNext}
            className={`flex-1 bg-[#0A0A0A] text-white hover:bg-[#00C9B1] transition-colors ${step === 0 ? 'w-full' : ''}`}
          >
            {step === 1 ? `Realizar Pedido — $${isAdvance ? (orderTotal * 0.5).toFixed(2) : orderTotal.toFixed(2)}` : 'Continuar →'}
          </Button>
        </div>
      )}
    </div>
  );
}
