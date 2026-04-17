'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    q: '¿Cómo rastrero mi pedido?',
    a: 'Ve a la página de Seguimiento e ingresa tu número de pedido (ej. ORD-001). Verás actualizaciones en tiempo real desde el momento en que tu pedido es confirmado hasta la entrega.',
  },
  {
    q: '¿A qué zonas hacen entregas?',
    a: 'Entregamos en seis zonas: Zamora Centro, Zamora Norte, Zamora Sur, Jacona, Tangancícuaro y Jiquilpan. Próximamente más zonas.',
  },
  {
    q: '¿Cuánto tarda la entrega?',
    a: 'Los tiempos varían según la zona — desde 4 horas para Zamora Centro hasta 24 horas para Jiquilpan. Verás el estimado al finalizar tu compra y podrás rastrear tu pedido en tiempo real.',
  },
  {
    q: '¿Cuál es su política de devoluciones?',
    a: 'Aceptamos devoluciones dentro de los 30 días posteriores a la entrega en la mayoría de los artículos en condición original. Consulta nuestra página de Devoluciones para las instrucciones paso a paso.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas de débito y crédito (Visa, Mastercard), OXXO Pay y transferencia bancaria. Todas las transacciones están encriptadas y son seguras.',
  },
  {
    q: '¿Cómo sé qué talla pedir?',
    a: 'Visita nuestra Guía de Tallas para medidas detalladas en ropa y calzado, incluyendo conversiones EU/UK/US y una guía de cómo medirte.',
  },
  {
    q: '¿Puedo cancelar o modificar mi pedido?',
    a: 'Los pedidos pueden cancelarse o modificarse dentro de la primera hora después de realizarlos. Después de ese tiempo, el pedido entra al proceso de preparación. Contáctanos de inmediato en hola@mariasclub.mx si necesitas hacer un cambio.',
  },
  {
    q: '¿Mi información personal está segura?',
    a: 'Sí. Usamos encriptación de nivel industrial y nunca vendemos tus datos a terceros. Consulta nuestra Política de Privacidad para ver todos los detalles sobre cómo manejamos tu información.',
  },
  {
    q: '¿Ofrecen envoltura para regalo?',
    a: 'La envoltura para regalo está disponible en la mayoría de los artículos. Selecciona la opción al finalizar la compra e incluye un mensaje personalizado — nosotros nos encargamos del resto.',
  },
  {
    q: '¿Cómo contacto a soporte al cliente?',
    a: 'Escríbenos a hola@mariasclub.mx o usa el formulario en nuestra página de Contacto. Respondemos en menos de 24 horas en días hábiles (Lun–Vie, 9 AM–7 PM).',
  },
];

export function FAQContent() {
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pref = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pref) return;

    const items = Array.from(listRef.current?.children ?? []);
    gsap.from(items, {
      y: 16, opacity: 0, stagger: 0.05, duration: 0.45, ease: 'power2.out',
      scrollTrigger: { trigger: listRef.current, start: 'top 82%' },
    });
  }, { scope: listRef });

  return (
    <div ref={listRef}>
      <Accordion>
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={String(i)} className="border-[#EDEBE8]">
            <AccordionTrigger className="text-[#0A0A0A] font-body font-semibold text-sm py-4">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-[#6B6359] text-sm leading-relaxed pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
