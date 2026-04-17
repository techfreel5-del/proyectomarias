'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText } from '@/lib/gsap';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(SplitText);

const slides = [
  {
    id: '01',
    badge: 'Venta de Fin de Año',
    headline: 'MARIASCLUB\nSIGNATURES\n25% OFF',
    sub: 'Redefine tu estilo con 25% de descuento en toda la colección Signatures de MARIASCLUB.',
    bg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=85',
    cta: '/shop/fashion',
  },
  {
    id: '02',
    badge: 'Nueva Colección',
    headline: 'HOGAR Y\nCOCINA\nESENCIALES',
    sub: 'Diseñado para vivir. Piezas cuidadosamente seleccionadas que unen estilo y funcionalidad.',
    bg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=85',
    cta: '/shop/home-kitchen',
  },
  {
    id: '03',
    badge: 'Alto Rendimiento',
    headline: 'DEPORTES Y\nFITNESS\nGEAR',
    sub: 'Equipamiento de alto rendimiento que se mueve contigo. Diseñado para cada atleta.',
    bg: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85',
    cta: '/shop/sports-fitness',
  },
];

const AUTOPLAY_INTERVAL = 5000;

export function HeroSection() {
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const isHovered = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slide = slides[active];

  /* ── GSAP entrance animation ──────────────────────────────── */
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const split = new SplitText(headlineRef.current, { type: 'lines' });
    gsap.set(split.lines, { overflow: 'hidden' });

    tl
      .from(badgeRef.current, { y: 16, opacity: 0, duration: 0.4 }, 0)
      .from(split.lines, { y: '100%', opacity: 0, stagger: 0.1, duration: 0.8 }, 0.15)
      .from(subRef.current, { y: 16, opacity: 0, duration: 0.5 }, 0.55)
      .from(ctaRef.current, { y: 12, opacity: 0, duration: 0.4 }, 0.7);

    return () => split.revert();
  }, { scope: containerRef, dependencies: [active] });

  /* ── Auto-play ────────────────────────────────────────────── */
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isHovered.current) {
        setActive((prev) => (prev + 1) % slides.length);
      }
    }, AUTOPLAY_INTERVAL);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startInterval]);

  /* ── Manual navigation ────────────────────────────────────── */
  const goToSlide = useCallback((i: number) => {
    if (i === active) return;
    startInterval(); // reset timer on manual click
    const bg = containerRef.current?.querySelector('.hero-bg') ?? null;
    if (!bg) { setActive(i); return; }
    gsap.to(bg, {
      opacity: 0, duration: 0.25, onComplete: () => {
        setActive(i);
        const bg2 = containerRef.current?.querySelector('.hero-bg') ?? null;
        if (bg2) gsap.to(bg2, { opacity: 1, duration: 0.4 });
      }
    });
  }, [active, startInterval]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen min-h-[600px] max-h-[920px] overflow-hidden bg-[#111111]"
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      {/* Background image */}
      <div className="hero-bg absolute inset-0">
        <Image
          src={slide.bg}
          alt={slide.headline}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/85 via-black/40 to-black/20" />
      </div>

      {/* Giant background brand text */}
      <div
        className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        <span
          className="font-black uppercase leading-none text-white/[0.06] pr-4"
          style={{ fontSize: 'clamp(80px, 16vw, 220px)', letterSpacing: '-0.04em' }}
        >
          MARIASCLUB
        </span>
      </div>

      {/* Content — bottom-left */}
      <div className="relative z-10 h-full flex flex-col justify-end max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20 sm:pb-24">
        <span
          ref={badgeRef}
          className="inline-block bg-[#C0392B] text-white text-[10px] font-bold tracking-[0.14em] uppercase px-3 py-1.5 mb-5 w-fit"
        >
          {slide.badge}
        </span>

        <h1
          ref={headlineRef}
          className="font-black text-white leading-[0.88] mb-5 uppercase whitespace-pre-line"
          style={{ fontSize: 'clamp(40px, 7vw, 90px)' }}
        >
          {slide.headline}
        </h1>

        <p
          ref={subRef}
          className="text-white/65 text-sm sm:text-base max-w-sm mb-7 leading-relaxed font-body"
        >
          {slide.sub}
        </p>

        <div ref={ctaRef} className="flex items-center gap-3">
          <Link
            href={slide.cta}
            className="inline-flex items-center gap-2 h-11 px-7 bg-white text-[#222222] text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-[#F2F2F2] transition-colors"
          >
            Comprar Ahora <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 h-11 px-7 border border-white/40 text-white text-[11px] font-medium tracking-[0.1em] uppercase hover:border-white hover:bg-white/10 transition-colors"
          >
            Ver Todo
          </Link>
        </div>
      </div>

      {/* Slide indicators — bottom-right (with animated progress) */}
      <div className="absolute bottom-8 right-8 z-10 flex items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goToSlide(i)}
            aria-label={`Slide ${i + 1}`}
            className={`relative h-[2px] overflow-hidden transition-all duration-300 ${
              i === active ? 'w-10 bg-white/25' : 'w-5 bg-white/30 hover:bg-white/50'
            }`}
          >
            {i === active && (
              <span
                key={active}
                className="absolute inset-y-0 left-0 bg-white"
                style={{ animation: `slideProgress ${AUTOPLAY_INTERVAL}ms linear forwards` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide counter — bottom-left */}
      <div className="absolute bottom-8 left-6 sm:left-8 lg:left-12 z-10">
        <span className="font-mono text-xs text-white/40 tracking-widest">
          {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>
      </div>

      <style>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
