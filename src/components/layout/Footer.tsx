'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Globe, Link2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

gsap.registerPlugin(ScrollTrigger);

const shopLinks = [
  { label: 'Moda', href: '/shop/fashion' },
  { label: 'Hogar y Cocina', href: '/shop/home-kitchen' },
  { label: 'Deportes y Fitness', href: '/shop/sports-fitness' },
  { label: 'Electrónica', href: '/shop/electronics' },
  { label: 'Nuevas Llegadas', href: '/shop?filter=new' },
  { label: 'Ofertas', href: '/shop?filter=sale' },
];

const helpLinks = [
  { label: 'Rastrear Pedido', href: '/tracking' },
  { label: 'Devoluciones', href: '/returns' },
  { label: 'Guía de Tallas', href: '/size-guide' },
  { label: 'Preguntas Frecuentes', href: '/faq' },
  { label: 'Contacto', href: '/contact' },
];

const socialIcons = [Globe, Link2, Share2];

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socialRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* ── Column stagger reveal ────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const cols = Array.from(gridRef.current?.children ?? []);
    gsap.from(cols, {
      y: 24, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: gridRef.current, start: 'top 90%' },
    });

    gsap.from(bottomRef.current, {
      opacity: 0, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: bottomRef.current, start: 'top 95%' },
    });
  }, { scope: footerRef });

  /* ── Social icon hover ────────────────────────────────────── */
  const onIconEnter = (i: number) => {
    gsap.to(socialRefs.current[i], { y: -3, duration: 0.2, ease: 'power2.out' });
  };
  const onIconLeave = (i: number) => {
    gsap.to(socialRefs.current[i], { y: 0, duration: 0.2, ease: 'power2.in' });
  };

  return (
    <footer ref={footerRef} className="bg-[#F7F6F5] border-t border-[#EDEBE8] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-[#6B6359] leading-relaxed max-w-xs">
              Esenciales curados en moda, hogar, deportes y tecnología. Entregamos en Zamora y alrededores.
            </p>
            <div className="flex gap-3 mt-5">
              {socialIcons.map((Icon, i) => (
                <Button
                  key={i}
                  ref={(el) => { socialRefs.current[i] = el as HTMLButtonElement | null; }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-[#8F8780] hover:text-[#0A0A0A] hover:bg-[#EDEBE8]"
                  onMouseEnter={() => onIconEnter(i)}
                  onMouseLeave={() => onIconLeave(i)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#0A0A0A] mb-4">Tienda</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#6B6359] hover:text-[#0A0A0A] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Help */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#0A0A0A] mb-4">Ayuda</h3>
            <ul className="space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#6B6359] hover:text-[#0A0A0A] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#0A0A0A] mb-4">Mantente al Tanto</h3>
            <p className="text-sm text-[#6B6359] mb-4">Recibe primero las nuevas llegadas y ofertas exclusivas.</p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Tu correo"
                className="flex-1 h-9 px-3 text-sm border border-[#D9D9D9] bg-white focus:outline-none focus:border-[#222222]"
              />
              <Button
                size="sm"
                className="bg-[#222222] text-white hover:bg-black transition-colors shrink-0 rounded-none"
              >
                Unirse
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-[#EDEBE8]" />

        <div ref={bottomRef} className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8F8780]">
          <span>© 2026 MARIASCLUB™. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#0A0A0A] transition-colors">Política de Privacidad</Link>
            <Link href="/terms" className="hover:text-[#0A0A0A] transition-colors">Términos de Servicio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
