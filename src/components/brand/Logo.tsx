'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useRef } from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'lg' | 'xl';
  variant?: 'full' | 'mark-only' | 'light' | 'dark';
  className?: string;
}

const sizeMap = {
  sm: { svg: 'h-8 w-8', text: 'text-sm', gap: 'gap-1.5' },
  lg: { svg: 'h-12 w-12', text: 'text-2xl', gap: 'gap-2' },
  xl: { svg: 'h-20 w-20', text: 'text-4xl', gap: 'gap-3' },
};

export function Logo({ size = 'sm', variant = 'dark', className = '' }: LogoProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const s = sizeMap[size];

  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white group-hover:text-[#00C9B1]' : 'text-[#0A0A0A] group-hover:text-[#C0392B]';

  useGSAP(() => {
    if (!pathRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const length = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.inOut',
      delay: 0.3,
    });
  }, []);

  return (
    <Link
      href="/"
      className={`inline-flex items-center ${s.gap} group select-none ${className}`}
      aria-label="MARIASCLUB — Home"
    >
      {/* Calligraphic M */}
      <div className={`${s.svg} flex-shrink-0`}>
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            ref={pathRef}
            d="M10 68 C10 68 10 20 10 16 C10 12 12 10 16 10 C20 10 22 13 24 18 L40 50 L56 18 C58 13 60 10 64 10 C68 10 70 12 70 16 C70 20 70 68 70 68 M10 38 C18 30 28 26 40 26 C52 26 62 30 70 38 M24 18 L24 62 M56 18 L56 62"
            stroke="#C0392B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {variant !== 'mark-only' && (
        <span
          className={`font-body font-bold tracking-[0.12em] uppercase ${s.text} leading-none transition-colors duration-300 ${textColor}`}
        >
          ARIASCLUB<sup className="text-[0.5em] align-super">™</sup>
        </span>
      )}
    </Link>
  );
}
