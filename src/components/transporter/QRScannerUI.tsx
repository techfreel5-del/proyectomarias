'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Flashlight, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

const recentScans = [
  { id: 'PKG-4821', product: 'Pro Blender 1200W', customer: 'Juan Pérez', time: '11:32 AM' },
  { id: 'PKG-4820', product: 'SmartWatch Pro', customer: 'Carlos Rios', time: '10:15 AM' },
  { id: 'PKG-4818', product: 'Linen Jacket', customer: 'María García', time: '09:48 AM' },
];

export function QRScannerUI() {
  const frameRef = useRef<HTMLDivElement>(null);
  const cornerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Animate corner brackets in on mount
    const corners = cornerRefs.current.filter(Boolean);
    gsap.from(corners, {
      scale: 0,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'back.out(2)',
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/60">Carlos R. (3)</span>
          <span className="text-xs text-white/60">☰</span>
        </div>
      </div>

      {/* Camera area */}
      <div className="flex-1 relative flex items-center justify-center px-8 py-6">
        {/* Camera background (dark grid) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Scan frame */}
        <div ref={frameRef} className="relative w-56 h-56 sm:w-64 sm:h-64">
          {/* Corners */}
          {[
            'top-0 left-0 border-t-2 border-l-2 rounded-tl-sm',
            'top-0 right-0 border-t-2 border-r-2 rounded-tr-sm',
            'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm',
            'bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm',
          ].map((cls, i) => (
            <div
              key={i}
              ref={(el) => { cornerRefs.current[i] = el; }}
              className={`absolute w-8 h-8 border-[#00C9B1] ${cls}`}
            />
          ))}

          {/* Animated scan line */}
          <div className="absolute inset-x-2 top-0 bottom-0 overflow-hidden">
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00C9B1] to-transparent"
              style={{ animation: 'scan-line 2s linear infinite' }}
            />
          </div>

          {/* QR placeholder */}
          <div className="absolute inset-6 grid grid-cols-5 grid-rows-5 gap-0.5 opacity-20">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-sm"
                style={{ opacity: Math.random() > 0.4 ? 1 : 0 }}
              />
            ))}
          </div>
        </div>

        <p className="absolute bottom-8 text-xs text-white/60 text-center px-8">
          Apunta la cámara al código QR del paquete
        </p>

        {/* Flashlight button */}
        <button className="absolute top-4 right-6 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
          <Flashlight className="h-4 w-4 text-white/70" />
        </button>
      </div>

      {/* Bottom panel */}
      <div className="bg-white rounded-t-2xl text-[#0A0A0A] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body text-base font-bold">Escáner QR de Paquetes</h2>
          <button className="text-xs text-[#00C9B1] font-semibold">Ingresar Código</button>
        </div>

        <div className="space-y-3">
          {recentScans.map((scan) => (
            <div key={scan.id} className="flex items-center gap-3 py-2 border-b border-[#EDEBE8] last:border-0">
              <div className="w-8 h-8 bg-[#F7F6F5] rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-[#D9D5CF] rounded-[1px]" />
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold font-body">{scan.product}</p>
                <p className="text-[10px] text-[#8F8780] font-body">{scan.id} · {scan.customer}</p>
              </div>
              <span className="text-[10px] text-[#8F8780] flex-shrink-0">{scan.time}</span>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 h-11 bg-[#0A0A0A] text-white text-sm font-semibold rounded-xl hover:bg-[#00C9B1] transition-colors">
          Confirmación
        </button>
      </div>
    </div>
  );
}
