'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText, ScrollTrigger } from '@/lib/gsap';
import type { Article } from '@/lib/journal-data';

gsap.registerPlugin(SplitText, ScrollTrigger);

interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const heroWrapRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  /* ── Hero parallax ────────────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    gsap.to(heroImgRef.current, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: {
        trigger: heroWrapRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }, { scope: heroWrapRef });

  /* ── Title SplitText entrance ─────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const split = new SplitText(titleRef.current, { type: 'lines' });
    gsap.set(split.lines, { overflow: 'hidden' });
    gsap.from(split.lines, {
      y: '100%', opacity: 0, stagger: 0.08, duration: 0.7, ease: 'power4.out', delay: 0.2,
    });

    return () => split.revert();
  }, { scope: contentRef });

  /* ── Body paragraphs progressive reveal ───────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const paras = bodyRef.current?.querySelectorAll('p');
    paras?.forEach((p) => {
      gsap.from(p, {
        y: 20, opacity: 0, duration: 0.55, ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 88%' },
      });
    });
  }, { scope: bodyRef });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero image with parallax */}
      <div ref={heroWrapRef} className="relative aspect-[21/9] w-full overflow-hidden">
        <Image
          ref={heroImgRef}
          src={article.image}
          alt={article.title}
          fill
          className="object-cover scale-110"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B6359] hover:text-[#0A0A0A] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Revista
        </Link>

        <span className="inline-block text-[10px] font-body font-bold uppercase tracking-[0.15em] bg-[#00C9B1] text-white px-2.5 py-1 mb-4">
          {article.tag}
        </span>

        <h1 ref={titleRef} className="font-body text-4xl sm:text-5xl font-black text-[#0A0A0A] leading-tight mb-3 overflow-hidden">
          {article.title}
        </h1>
        <p className="text-sm text-[#B8B2A8] mb-10">{article.date}</p>

        <div ref={bodyRef} className="space-y-6">
          {article.body.map((paragraph, i) => (
            <p key={i} className="text-base text-[#6B6359] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
