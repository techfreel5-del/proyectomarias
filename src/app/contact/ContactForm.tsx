'use client';

import { useState, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  /* ── Success animation ────────────────────────────────────── */
  useGSAP(() => {
    if (!sent || !successRef.current) return;
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const icon = successRef.current.querySelector('.success-icon');
    const texts = successRef.current.querySelectorAll('.success-text');

    gsap.from(icon, {
      scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(1.7)',
    });
    gsap.from(texts, {
      y: 16, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out', delay: 0.35,
    });
  }, [sent]);

  if (sent) {
    return (
      <div ref={successRef} className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <div className="success-icon w-14 h-14 bg-[#00C9B1]/10 flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-[#00C9B1]" />
        </div>
        <p className="success-text font-body text-2xl font-black text-[#0A0A0A]">¡Mensaje enviado!</p>
        <p className="success-text text-sm text-[#6B6359]">Te responderemos en menos de 24 horas.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 uppercase tracking-wider">Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full h-11 border border-[#EDEBE8] px-4 text-sm text-[#0A0A0A] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#00C9B1] transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 uppercase tracking-wider">Correo electrónico</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full h-11 border border-[#EDEBE8] px-4 text-sm text-[#0A0A0A] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#00C9B1] transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 uppercase tracking-wider">Mensaje</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="¿Cómo podemos ayudarte?"
          rows={5}
          className="w-full border border-[#EDEBE8] px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#B8B2A8] bg-white focus:outline-none focus:border-[#00C9B1] transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full h-12 bg-[#0A0A0A] text-white text-sm font-semibold hover:bg-[#00C9B1] transition-colors"
      >
        Enviar Mensaje
      </button>
    </form>
  );
}
