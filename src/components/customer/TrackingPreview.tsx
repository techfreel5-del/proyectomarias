'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { CheckCircle2, Circle, Package, Truck, MapPin, Home } from 'lucide-react';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const phases = [
  { icon: Package, label: 'Confirmado', sub: 'Pedido recibido', color: '#3B82F6', done: true },
  { icon: Package, label: 'Preparando', sub: 'En proceso', color: '#8B5CF6', done: true },
  { icon: Truck, label: 'En camino', sub: 'En tránsito', color: '#EC4899', done: false, active: true },
  { icon: Home, label: 'Entregado', sub: 'En tu puerta', color: '#F97316', done: false },
];

export function TrackingPreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Progress bar animation on scroll
    gsap.from(progressRef.current, {
      scaleX: 0,
      duration: 1.2,
      ease: 'power3.out',
      transformOrigin: 'left center',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
      },
    });

    gsap.from(cardRef.current, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 75%',
      },
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div>
            <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-3">
              Logística en Tiempo Real
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-[#0A0A0A] mb-5 leading-tight">
              Rastrea Cada Paso de Tu Pedido
            </h2>
            <p className="text-base text-[#6B6359] mb-6 leading-relaxed">
              Desde nuestro almacén en Zamora hasta tu puerta — evidencia fotográfica, firma digital y rastreo GPS en cada etapa.
            </p>
            <div className="flex gap-3">
              <Link href="/tracking" className="inline-flex items-center h-8 gap-1.5 px-4 rounded-lg bg-[#0A0A0A] text-white hover:bg-[#00C9B1] transition-colors text-sm font-medium">
                Rastrear Mi Pedido
              </Link>
            </div>
          </div>

          {/* Right: Tracking card */}
          <div ref={cardRef} className="bg-white border border-[#EDEBE8] rounded-2xl p-6 shadow-lg max-w-md mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-[#8F8780] font-body">Pedido #ORD-002</p>
                <p className="font-body font-semibold text-sm text-[#0A0A0A] mt-0.5">Pro Blender 1200W × 2</p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wide bg-[#00C9B1]/10 text-[#009E8C] px-2.5 py-1 rounded-full">
                En Camino
              </span>
            </div>

            {/* Gradient progress track */}
            <div className="relative mb-6">
              <div className="h-1.5 rounded-full bg-[#EDEBE8] overflow-hidden">
                <div
                  ref={progressRef}
                  className="h-full rounded-full"
                  style={{
                    width: '65%',
                    background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899)',
                  }}
                />
              </div>
            </div>

            {/* Phase nodes */}
            <div className="flex justify-between">
              {phases.map((phase, i) => {
                const Icon = phase.icon;
                return (
                  <div key={phase.label} className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        phase.done
                          ? 'border-transparent'
                          : phase.active
                          ? 'border-[#EC4899] bg-[#EC4899]/10'
                          : 'border-[#EDEBE8] bg-[#F7F6F5]'
                      }`}
                      style={phase.done ? { background: phase.color } : {}}
                    >
                      {phase.done ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : phase.active ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899] animate-pulse" />
                      ) : (
                        <Circle className="h-4 w-4 text-[#D9D5CF]" />
                      )}
                    </div>
                    <span className="text-[10px] font-body font-semibold text-[#0A0A0A] text-center">
                      {phase.label}
                    </span>
                    <span className="text-[9px] text-[#8F8780] text-center">{phase.sub}</span>
                  </div>
                );
              })}
            </div>

            {/* Photo evidence row */}
            <div className="mt-5 pt-4 border-t border-[#EDEBE8]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-2">Evidencia de Entrega</p>
              <div className="flex gap-2">
                {['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=80&q=60',
                  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=80&q=60'].map((src, i) => (
                  <div key={i} className="w-14 h-14 rounded-lg overflow-hidden bg-[#F7F6F5] border border-[#EDEBE8]">
                    <img src={src} alt="evidence" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-14 h-14 rounded-lg border-2 border-dashed border-[#EDEBE8] flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-[#D9D5CF]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
