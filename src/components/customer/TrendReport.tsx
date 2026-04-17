'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { getFeaturedProducts } from '@/lib/mock-data';

gsap.registerPlugin(ScrollTrigger);

export function TrendReport() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const products = getFeaturedProducts().slice(3, 6);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from(headingRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: headingRef.current, start: 'top 88%' },
    });

    const cards = gridRef.current?.querySelectorAll('article');
    if (cards?.length) {
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: gridRef.current, start: 'top 82%' },
      });
    }
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section header: title + rule + Browse All */}
        <div ref={headingRef} className="flex items-center gap-6 mb-10">
          <h2
            className="font-black text-[#111111] uppercase whitespace-nowrap"
            style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.02em' }}
          >
            Más Vendidos
          </h2>
          <div className="flex-1 h-px bg-[#E0E0E0]" />
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] uppercase text-[#222222] border border-[#222222] px-4 h-8 hover:bg-[#222222] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Ver Todo <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3-column product grid */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
