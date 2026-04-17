'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Flip } from 'gsap/dist/Flip';
import { Draggable } from 'gsap/dist/Draggable';
import { Observer } from 'gsap/dist/Observer';
import { SplitText } from 'gsap/dist/SplitText';

// Note: ScrollSmoother requires Club GreenSock license.
// If available, uncomment: import { ScrollSmoother } from 'gsap/ScrollSmoother';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(
    ScrollTrigger,
    Flip,
    Draggable,
    Observer,
    SplitText,
  );
}

export { gsap, ScrollTrigger, Flip, Draggable, Observer, SplitText };
