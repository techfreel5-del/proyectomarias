'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText, ScrollTrigger } from '@/lib/gsap';

gsap.registerPlugin(SplitText, ScrollTrigger);

const stats = [
  { label: 'Fundada', value: '2021' },
  { label: 'Productos', value: '30+' },
  { label: 'Zonas de Entrega', value: '6' },
  { label: 'Con sede en', value: 'Zamora' },
];

const categories = [
  { label: 'Moda', href: '/shop/fashion', desc: 'Esenciales de guardarropa cuidadosamente seleccionados' },
  { label: 'Hogar y Cocina', href: '/shop/home-kitchen', desc: 'Objetos que elevan la vida cotidiana' },
  { label: 'Deportes y Fitness', href: '/shop/sports-fitness', desc: 'Equipamiento de rendimiento, bien elegido' },
  { label: 'Electrónica', href: '/shop/electronics', desc: 'Tecnología que trabaja para ti' },
];

export function AboutContent() {
  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLElement>(null);
  const missionHeadRef = useRef<HTMLParagraphElement>(null);
  const parasRef = useRef<HTMLDivElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLElement>(null);

  /* ── Hero entrance ────────────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const split = new SplitText(headlineRef.current, { type: 'lines,words' });
    gsap.set(split.lines, { overflow: 'hidden' });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(eyebrowRef.current, { y: 14, opacity: 0, duration: 0.4 })
      .from(split.words, { y: '110%', opacity: 0, stagger: 0.04, duration: 0.7 }, 0.15)
      .from(statsRef.current?.querySelectorAll('.stat-card') ?? [], {
        y: 20, opacity: 0, scale: 0.95, stagger: 0.08, duration: 0.5, ease: 'back.out(1.4)',
      }, 0.5);

    return () => split.revert();
  }, { scope: heroRef });

  /* ── Mission section ──────────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    gsap.from(missionHeadRef.current, {
      y: 24, opacity: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: missionHeadRef.current, start: 'top 85%' },
    });

    const paras = parasRef.current?.querySelectorAll('p');
    paras?.forEach((p) => {
      gsap.from(p, {
        y: 18, opacity: 0, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 88%' },
      });
    });
  }, { scope: missionRef });

  /* ── Categories grid ──────────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    gsap.from(catsRef.current?.querySelectorAll('a') ?? [], {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.55, ease: 'power3.out',
      scrollTrigger: { trigger: catsRef.current, start: 'top 82%' },
    });
  }, { scope: catsRef });

  /* ── Location section ─────────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    gsap.from(locationRef.current?.querySelector('div') ?? null, {
      x: -24, opacity: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: locationRef.current, start: 'top 85%' },
    });
  }, { scope: locationRef });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <section ref={heroRef} className="bg-[#0A0A0A] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <p ref={eyebrowRef} className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-4">
            Nosotros
          </p>
          <h1 ref={headlineRef} className="font-body text-5xl sm:text-7xl font-black leading-tight mb-10">
            Diseñado para tu estilo de vida.
          </h1>
          <div ref={statsRef} className="flex flex-wrap gap-4">
            {stats.map((s) => (
              <div key={s.label} className="stat-card bg-white/10 px-5 py-3">
                <p className="stat-value text-2xl font-bold font-body">{s.value}</p>
                <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section ref={missionRef} className="py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-6 text-[#6B6359] leading-relaxed text-base">
          <p ref={missionHeadRef} className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1]">Nuestra Misión</p>
          <p className="font-body text-3xl font-black text-[#0A0A0A] leading-tight">
            Menos, pero mejores. Entregados con cuidado.
          </p>
          <div ref={parasRef} className="space-y-6">
            <p>
              MARIASCLUB™ nació de una observación simple: la mayoría de las personas no necesitan más cosas — necesitan las cosas correctas. Cubrimos una selección enfocada de productos en moda, hogar, fitness y electrónica, eligiendo cada artículo por su calidad, durabilidad y valor honesto.
            </p>
            <p>
              Con sede en Zamora, Michoacán, operamos nuestra propia red de entrega de última milla en seis zonas. Cada pedido se rastrea en tiempo real, y cada transportista lleva nuestro compromiso de cuidado desde el almacén hasta tu puerta.
            </p>
            <p>
              Creemos que los buenos objetos, adquiridos con criterio y entregados de forma confiable, mejoran la vida diaria de manera tangible. Esa es toda la idea.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white border-t border-[#EDEBE8]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Tienda</p>
          <h2 className="font-body text-4xl font-black text-[#0A0A0A] mb-10">Lo que ofrecemos</h2>
          <div ref={catsRef} className="grid sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex items-center justify-between bg-[#F7F6F5] px-6 py-5 hover:bg-[#0A0A0A] transition-colors duration-300"
              >
                <div>
                  <p className="font-body text-xl font-bold text-[#0A0A0A] group-hover:text-white transition-colors">{cat.label}</p>
                  <p className="text-sm text-[#6B6359] group-hover:text-white/60 transition-colors mt-0.5">{cat.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#D9D5CF] group-hover:text-white transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section ref={locationRef} className="py-16 px-4 bg-[#F7F6F5] border-t border-[#EDEBE8]">
        <div className="max-w-3xl mx-auto flex items-start gap-4">
          <div className="w-10 h-10 bg-[#00C9B1]/10 flex items-center justify-center flex-shrink-0 mt-1">
            <MapPin className="h-5 w-5 text-[#00C9B1]" />
          </div>
          <div>
            <p className="font-body font-bold text-[#0A0A0A] mb-1">MARIASCLUB™ — Zamora, Michoacán</p>
            <p className="text-sm text-[#6B6359] mb-3">Entregamos en Zamora y municipios cercanos. ¿Tienes preguntas? Aquí estamos.</p>
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00C9B1] hover:text-[#0A0A0A] transition-colors">
              Contáctanos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
