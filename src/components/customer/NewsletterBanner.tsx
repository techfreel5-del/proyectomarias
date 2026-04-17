'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText, ScrollTrigger } from '@/lib/gsap';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function NewsletterBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const split = new SplitText(titleRef.current, { type: 'chars' });
    const tl = gsap.timeline({
      defaults: { ease: 'power4.out' },
      scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
    });

    tl.from(eyebrowRef.current, { y: 10, opacity: 0, duration: 0.35 })
      .from(split.chars, { y: '120%', opacity: 0, stagger: 0.02, duration: 0.55 }, 0.1)
      .from(descRef.current, { y: 16, opacity: 0, duration: 0.5 }, 0.4)
      .from(formRef.current, { y: 12, opacity: 0, duration: 0.4 }, 0.55);

    return () => split.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-16 bg-[#111111]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p ref={eyebrowRef} className="text-[10px] font-body font-medium tracking-[0.25em] uppercase text-[#828282] mb-3">
          Boletín
        </p>
        <h2
          ref={titleRef}
          className="font-black text-white mb-4 uppercase overflow-hidden"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.02em' }}
        >
          Únete a MARIASCLUB™
        </h2>
        <p ref={descRef} className="text-[#6B6359] text-sm mb-6 leading-relaxed font-body">
          Recibe acceso anticipado a nuevas colecciones, descuentos exclusivos para miembros y novedades de logística directo en tu bandeja.
        </p>
        <div ref={formRef} className="flex gap-0 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            className="flex-1 h-11 px-4 text-sm border border-[#333333] bg-[#1A1A1A] text-white placeholder:text-[#555555] focus:outline-none focus:border-white"
          />
          <button className="h-11 px-6 bg-white text-[#222222] text-[11px] font-bold tracking-[0.08em] uppercase hover:bg-[#F2F2F2] transition-colors shrink-0">
            Suscribirme
          </button>
        </div>
      </div>
    </section>
  );
}
