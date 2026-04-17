'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Eye, EyeOff, User } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /* ── Mount animation ──────────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;
    gsap.from(cardRef.current, { y: 32, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });
  }, { scope: cardRef });

  /* ── Tab switch animation ─────────────────────────────────── */
  const switchTab = (next: 'login' | 'register') => {
    if (next === tab) return;
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!pref) {
      gsap.fromTo(formRef.current,
        { x: next === 'register' ? 20 : -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
    setTab(next);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-4 py-16">
      <div ref={cardRef} className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="md" variant="dark" />
        </div>

        {/* Tab toggle */}
        <div className="flex mb-6 border border-[#E0E0E0] p-1 bg-white">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 text-[11px] font-bold tracking-[0.08em] uppercase transition-all ${
              tab === 'login' ? 'bg-[#222222] text-white' : 'text-[#555555] hover:text-[#222222]'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 text-[11px] font-bold tracking-[0.08em] uppercase transition-all ${
              tab === 'register' ? 'bg-[#222222] text-white' : 'text-[#555555] hover:text-[#222222]'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Form card */}
        <div className="bg-white border border-[#E0E0E0] p-6">
          <div ref={formRef}>
            {tab === 'login' ? (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full h-11 border border-[#E0E0E0] px-4 text-sm text-[#222222] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#222222] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full h-11 border border-[#E0E0E0] px-4 pr-11 text-sm text-[#222222] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#222222] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#222222] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <Link href="#" className="text-xs text-[#828282] hover:text-[#222222] transition-colors">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-[#222222] text-white text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-black transition-colors mt-2"
                >
                  Iniciar Sesión
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    placeholder="María García"
                    className="w-full h-11 border border-[#E0E0E0] px-4 text-sm text-[#222222] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#222222] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full h-11 border border-[#E0E0E0] px-4 text-sm text-[#222222] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#222222] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mín. 8 caracteres"
                      className="w-full h-11 border border-[#E0E0E0] px-4 pr-11 text-sm text-[#222222] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#222222] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#828282] hover:text-[#222222] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full h-12 bg-[#222222] text-white text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-black transition-colors mt-2"
                >
                  Crear Cuenta
                </button>
                <p className="text-[10px] text-[#828282] text-center leading-relaxed">
                  Al crear una cuenta aceptas nuestros{' '}
                  <Link href="/terms" className="underline hover:text-[#222222]">Términos de Servicio</Link>
                  {' '}y{' '}
                  <Link href="/privacy" className="underline hover:text-[#222222]">Política de Privacidad</Link>.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Back to shop */}
        <p className="text-center text-xs text-[#828282] mt-5">
          <Link href="/shop" className="hover:text-[#222222] transition-colors underline underline-offset-2">
            Continuar sin cuenta →
          </Link>
        </p>
      </div>
    </div>
  );
}
