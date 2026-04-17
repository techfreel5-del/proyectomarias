'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText, ScrollTrigger } from '@/lib/gsap';
import type { Article } from '@/lib/journal-data';

gsap.registerPlugin(SplitText, ScrollTrigger);

interface JournalGridProps {
  articles: Article[];
}

export function JournalGrid({ articles }: JournalGridProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ── Title char-by-char reveal ────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const split = new SplitText(titleRef.current, { type: 'chars' });
    const eyebrow = headerRef.current?.querySelector('p') ?? null;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from(eyebrow, { y: 12, opacity: 0, duration: 0.4 })
      .from(split.chars, { y: '100%', opacity: 0, stagger: 0.025, duration: 0.6 }, 0.1);

    return () => split.revert();
  }, { scope: headerRef });

  /* ── Cards stagger on scroll ──────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const cards = gridRef.current?.querySelectorAll('a');
    gsap.from(cards ?? [], {
      y: 40, opacity: 0,
      stagger: { amount: 0.45, from: 'start' },
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: { trigger: gridRef.current, start: 'top 82%' },
    });
  }, { scope: gridRef });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div ref={headerRef} className="mb-12 overflow-hidden">
          <p className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Revista</p>
          <h1 ref={titleRef} className="font-body text-5xl sm:text-6xl font-black text-[#0A0A0A]">Reporte de Tendencias</h1>
        </div>

        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} href={`/journal/${article.slug}`} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden mb-4">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-body font-bold uppercase tracking-[0.15em] bg-[#00C9B1] text-white px-2.5 py-1">
                  {article.tag}
                </span>
              </div>
              <h2 className="font-body text-xl font-bold text-[#0A0A0A] mb-2 group-hover:underline transition-colors leading-snug tracking-tight">
                {article.title}
              </h2>
              <p className="text-sm text-[#6B6359] leading-relaxed line-clamp-2 mb-2">{article.excerpt}</p>
              <p className="text-xs text-[#B8B2A8]">{article.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
