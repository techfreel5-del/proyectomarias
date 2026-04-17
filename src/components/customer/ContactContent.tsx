'use client';

import { useRef } from 'react';
import { MapPin, Clock, Mail } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText, ScrollTrigger } from '@/lib/gsap';
import { ContactForm } from '@/app/contact/ContactForm';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function ContactContent() {
  const headerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);

  /* ── Header entrance ──────────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(eyebrowRef.current, { y: 14, opacity: 0, duration: 0.4 })
      .from(titleRef.current, { y: 24, opacity: 0, duration: 0.6 }, 0.1);
  }, { scope: headerRef });

  /* ── Info items slide from left ───────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const items = infoRef.current?.querySelectorAll('.contact-item');
    gsap.from(items ?? [], {
      x: -24, opacity: 0, stagger: 0.12, duration: 0.55, ease: 'power3.out',
      scrollTrigger: { trigger: infoRef.current, start: 'top 80%' },
    });
  }, { scope: infoRef });

  /* ── Form panel slide from right ─────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    gsap.from(formPanelRef.current, {
      x: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: formPanelRef.current, start: 'top 78%' },
    });
  }, { scope: formPanelRef });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div ref={headerRef} className="mb-12">
          <p ref={eyebrowRef} className="text-xs font-body font-semibold tracking-[0.2em] uppercase text-[#00C9B1] mb-2">Contacto</p>
          <h1 ref={titleRef} className="font-body text-5xl sm:text-6xl font-black text-[#0A0A0A]">Escríbenos</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div ref={infoRef} className="space-y-8">
            <div className="contact-item flex items-start gap-4">
              <div className="w-10 h-10 bg-[#00C9B1]/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-[#00C9B1]" />
              </div>
              <div>
                <p className="font-body font-semibold text-[#0A0A0A] mb-1">Dirección</p>
                <p className="text-sm text-[#6B6359] leading-relaxed">
                  MARIASCLUB™<br />
                  Zamora de Hidalgo, Michoacán<br />
                  México, C.P. 59700
                </p>
              </div>
            </div>

            <div className="contact-item flex items-start gap-4">
              <div className="w-10 h-10 bg-[#00C9B1]/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-[#00C9B1]" />
              </div>
              <div>
                <p className="font-body font-semibold text-[#0A0A0A] mb-1">Horarios</p>
                <p className="text-sm text-[#6B6359] leading-relaxed">
                  Lunes – Viernes: 9:00 AM – 7:00 PM<br />
                  Sábado: 10:00 AM – 3:00 PM<br />
                  Domingo: Cerrado
                </p>
              </div>
            </div>

            <div className="contact-item flex items-start gap-4">
              <div className="w-10 h-10 bg-[#00C9B1]/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-[#00C9B1]" />
              </div>
              <div>
                <p className="font-body font-semibold text-[#0A0A0A] mb-1">Correo</p>
                <p className="text-sm text-[#6B6359]">hola@mariasclub.mx</p>
                <p className="text-xs text-[#B8B2A8] mt-0.5">Respondemos en menos de 24 horas en días hábiles.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div ref={formPanelRef} className="bg-white border border-[#EDEBE8] p-6 sm:p-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
