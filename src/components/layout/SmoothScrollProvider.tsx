'use client';

import { useEffect, useRef } from 'react';

// ScrollSmoother requires GSAP Club license.
// This provider sets up the DOM structure and falls back gracefully.
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // On mobile, we skip ScrollSmoother and use native scroll
    const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;
    if (isMobile) return;

    // If GSAP Club ScrollSmoother is available, initialize here:
    // const smoother = ScrollSmoother.create({
    //   wrapper: '#smooth-wrapper',
    //   content: '#smooth-content',
    //   smooth: 1.5,
    //   effects: true,
    // });
    // return () => smoother.kill();
  }, []);

  return (
    <div
      id="smooth-wrapper"
      ref={wrapperRef}
      className="overflow-x-hidden"
    >
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
