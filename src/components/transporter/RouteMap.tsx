'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Navigation, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function RouteMap() {
  const routeRef = useRef<SVGPolylineElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !routeRef.current) return;

    const length = routeRef.current.getTotalLength?.() ?? 300;
    gsap.set(routeRef.current, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(routeRef.current, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      delay: 0.5,
    });
  }, []);

  return (
    <div className="relative w-full h-[55vh] bg-[#F0EDE8] overflow-hidden">
      {/* Map grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* SVG route */}
      <svg
        viewBox="0 0 375 350"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Streets (gray) */}
        <line x1="60" y1="0" x2="60" y2="350" stroke="#C8B89A" strokeWidth="12" opacity="0.4" />
        <line x1="160" y1="0" x2="160" y2="350" stroke="#C8B89A" strokeWidth="12" opacity="0.4" />
        <line x1="270" y1="0" x2="270" y2="350" stroke="#C8B89A" strokeWidth="12" opacity="0.4" />
        <line x1="0" y1="80" x2="375" y2="80" stroke="#C8B89A" strokeWidth="12" opacity="0.4" />
        <line x1="0" y1="180" x2="375" y2="180" stroke="#C8B89A" strokeWidth="12" opacity="0.4" />
        <line x1="0" y1="270" x2="375" y2="270" stroke="#C8B89A" strokeWidth="12" opacity="0.4" />

        {/* Block fills */}
        {[[70, 90, 80, 80], [170, 90, 90, 80], [70, 190, 80, 70], [170, 190, 90, 70]].map((r, i) => (
          <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill="white" opacity="0.6" rx="2" />
        ))}

        {/* Route path */}
        <polyline
          ref={routeRef}
          points="60,270 60,180 160,180 160,80 270,80"
          stroke="#3B82F6"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 4"
          fill="none"
        />

        {/* Current position (blue circle) */}
        <circle cx="60" cy="270" r="8" fill="#3B82F6" stroke="white" strokeWidth="2.5">
          <animate attributeName="r" values="8;11;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="270" r="18" fill="#3B82F6" opacity="0.15">
          <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Destination pin (teal) */}
        <circle cx="270" cy="80" r="10" fill="#00C9B1" stroke="white" strokeWidth="2.5" />
        <text x="270" y="75" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">✓</text>
      </svg>

      {/* Street labels */}
      <span className="absolute text-[9px] text-[#8F8780] font-body" style={{ bottom: '76px', left: '8px', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
        Av. Morelos
      </span>
      <span className="absolute text-[9px] text-[#8F8780] font-body" style={{ top: '12px', left: '64px' }}>
        Calle Hidalgo
      </span>

      {/* Navigation overlay */}
      <div className="absolute top-4 right-4 bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2">
        <Navigation className="h-3.5 w-3.5 text-[#3B82F6]" />
        <span className="text-xs font-semibold font-body">2.3 km · ~8 min</span>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        {['+', '−'].map((btn) => (
          <button
            key={btn}
            className="w-8 h-8 bg-white rounded-lg shadow flex items-center justify-center text-sm font-bold text-[#6B6359] hover:bg-[#F7F6F5]"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
