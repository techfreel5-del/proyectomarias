'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

const panels = [
  {
    label: 'Moda',
    sub: 'Colección',
    href: '/shop/fashion',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=85',
    bg: '#EBEBEB',
  },
  {
    label: 'Deportes',
    sub: 'Colección',
    href: '/shop/sports-fitness',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85',
    bg: '#E0E0E0',
  },
];

export function CategorySplit() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const panelEls = sectionRef.current?.querySelectorAll('a');
    if (!panelEls?.length) return;

    // Left panel slides from left
    gsap.from(panelEls[0], {
      x: -60, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    });
    // Right panel slides from right
    gsap.from(panelEls[1], {
      x: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    });

    // Labels reveal after panels
    const labels = sectionRef.current?.querySelectorAll('.panel-label');
    gsap.from(labels ?? [], {
      y: 20, opacity: 0, stagger: 0.2, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="flex flex-col sm:flex-row gap-1 px-4 sm:px-8 lg:px-12 py-1">
      {panels.map((panel) => (
        <Link
          key={panel.label}
          href={panel.href}
          className="group relative flex-1 overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]"
          style={{ backgroundColor: panel.bg }}
        >
          {/* Label — top-left */}
          <div className="panel-label absolute top-6 left-6 z-10">
            <p
              className="font-black text-[#111111] uppercase leading-none"
              style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', letterSpacing: '-0.02em' }}
            >
              {panel.label}
            </p>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#555555] mt-0.5">
              {panel.sub}
            </p>
          </div>

          {/* Model image */}
          <div className="absolute inset-0">
            <Image
              src={panel.image}
              alt={panel.label}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
        </Link>
      ))}
    </section>
  );
}
