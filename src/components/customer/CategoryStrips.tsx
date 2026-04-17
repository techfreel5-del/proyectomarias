'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

const collections = [
  {
    slug: 'fashion',
    label: 'Nueva Colección',
    title: 'Moda\nEsencial',
    description: 'Descubre las últimas incorporaciones a nuestra Colección de Moda — ropa, calzado y accesorios con estilos únicos y acabados artesanales.',
    href: '/shop/fashion',
    bg: '#F2F2F2',
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=85',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85',
    ],
    product: {
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&q=70',
      name: 'Blazer Signature Invierno',
      price: '$99',
      originalPrice: '$149',
    },
  },
  {
    slug: 'home-kitchen',
    label: 'Nueva Colección',
    title: 'Hogar y\nCocina',
    description: 'Diseñado para vivir. Piezas curadas para tu hogar — desde utensilios de cocina hasta decoración que combina calidez y funcionalidad.',
    href: '/shop/home-kitchen',
    bg: '#F2F2F2',
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=900&q=85',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=85',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=85',
    ],
    product: {
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=70',
      name: 'Set Cafetera Cerámica',
      price: '$45',
      originalPrice: '$69',
    },
  },
];

function CollectionFeature({ col }: { col: typeof collections[0] }) {
  const [imgIndex, setImgIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from(sectionRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    });
  }, { scope: sectionRef });

  const prev = () => setImgIndex((i) => (i - 1 + col.images.length) % col.images.length);
  const next = () => setImgIndex((i) => (i + 1) % col.images.length);

  return (
    <div ref={sectionRef} className="mx-4 sm:mx-8 lg:mx-12 mb-4" style={{ backgroundColor: col.bg }}>
      <div className="flex flex-col lg:flex-row">

        {/* Left panel — text */}
        <div className="flex-none lg:w-[38%] bg-white flex flex-col justify-center px-10 py-16 lg:py-24 min-h-[360px]">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C0392B] mb-4">
            {col.label}
          </p>
          <h2
            className="font-black text-[#111111] uppercase leading-[0.9] mb-5 whitespace-pre-line"
            style={{ fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.02em' }}
          >
            {col.title}
          </h2>
          <p className="text-sm text-[#555555] leading-relaxed mb-8 max-w-xs font-body">
            {col.description}
          </p>
          <Link
            href={col.href}
            className="inline-flex items-center gap-2 h-11 px-6 bg-[#222222] text-white text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-black transition-colors w-fit"
          >
            Ver Todo <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Right panel — image carousel */}
        <div className="flex-1 relative overflow-hidden min-h-[480px] lg:min-h-[560px]">
          {/* Progress indicators */}
          <div className="absolute top-5 left-5 right-5 z-10 flex gap-1.5">
            {col.images.map((_, i) => (
              <div
                key={i}
                className={`h-[2px] flex-1 transition-all duration-300 ${i === imgIndex ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>

          {/* Image */}
          <div className="relative w-full h-full" style={{ minHeight: 'inherit' }}>
            <Image
              src={col.images[imgIndex]}
              alt={col.title}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 1024px) 100vw, 62vw"
            />
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 text-[#222222]" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5 text-[#222222]" />
          </button>

          {/* Product info card — bottom */}
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white flex items-center gap-4 p-3 pr-4">
            <div className="relative w-16 h-16 flex-shrink-0 bg-[#F2F2F2] overflow-hidden">
              <Image
                src={col.product.image}
                alt={col.product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#222222] font-body truncate">{col.product.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-[#222222] font-body">{col.product.price}</span>
                <span className="text-sm text-[#828282] line-through font-body">{col.product.originalPrice}</span>
              </div>
            </div>
            <Link href={col.href} className="flex-shrink-0 w-8 h-8 bg-[#222222] flex items-center justify-center hover:bg-black transition-colors">
              <ChevronRight className="h-4 w-4 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryStrips() {
  return (
    <section className="py-6 bg-[#F2F2F2]">
      {collections.map((col) => (
        <CollectionFeature key={col.slug} col={col} />
      ))}
    </section>
  );
}
