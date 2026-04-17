'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function OrderLookupForm() {
  const [value, setValue] = useState('');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Form mount reveal ──────────────────────────────────── */
  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;
    gsap.from(formRef.current, { y: 30, opacity: 0, duration: 0.6, delay: 0.3, ease: 'power3.out' });
  }, { scope: formRef });

  /* ── Input focus ring ───────────────────────────────────── */
  const onFocus = () => {
    gsap.to(inputRef.current, {
      boxShadow: '0 0 0 2px #00C9B1',
      duration: 0.2,
      ease: 'power2.out',
    });
  };
  const onBlur = () => {
    gsap.to(inputRef.current, {
      boxShadow: '0 0 0 0px transparent',
      duration: 0.2,
      ease: 'power2.in',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = value.trim().toUpperCase();
    if (id) router.push(`/tracking/${id}`);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B8B2A8]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Ej. ORD-001"
          className="w-full h-12 pl-11 pr-4 border border-[#EDEBE8] text-sm text-[#0A0A0A] placeholder-[#B8B2A8] bg-white focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        className="w-full h-12 bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#00C9B1] transition-colors"
      >
        Rastrear Pedido
      </button>
      <p className="text-center text-xs text-[#B8B2A8] mt-3">Prueba con ORD-001 al ORD-005</p>
    </form>
  );
}
