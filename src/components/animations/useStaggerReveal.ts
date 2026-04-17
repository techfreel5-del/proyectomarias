'use client';

import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { RefObject } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface StaggerOptions {
  y?: number;
  opacity?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  ease?: string;
}

export function useStaggerReveal(
  containerRef: RefObject<HTMLElement | null>,
  itemSelector: string,
  options: StaggerOptions = {}
) {
  const {
    y = 50,
    opacity = 0,
    stagger = 0.1,
    duration = 0.7,
    start = 'top 85%',
    ease = 'power2.out',
  } = options;

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const items = containerRef.current.querySelectorAll(itemSelector);
      if (!items.length) return;

      gsap.from(items, {
        y,
        opacity,
        stagger,
        duration,
        ease,
        scrollTrigger: {
          trigger: containerRef.current,
          start,
        },
      });
    },
    { scope: containerRef, dependencies: [] }
  );
}
