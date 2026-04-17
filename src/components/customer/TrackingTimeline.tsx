'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { CheckCircle2, Circle, Camera, Pen } from 'lucide-react';
import { TrackingEvent } from '@/lib/mock-data';

gsap.registerPlugin(ScrollTrigger);

interface TrackingTimelineProps {
  events: TrackingEvent[];
  orderId: string;
}

const phaseColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316'];

export function TrackingTimeline({ events, orderId }: TrackingTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const completedCount = events.filter((e) => e.completed).length;
  const progressPercent = (completedCount / events.length) * 100;

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Animate progress fill
    gsap.from(progressRef.current, {
      height: '0%',
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: timelineRef.current,
        start: 'top 70%',
      },
    });

    // Animate nodes
    const nodes = timelineRef.current?.querySelectorAll('.tracking-node');
    if (nodes?.length) {
      gsap.from(nodes, {
        scale: 0,
        opacity: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 72%',
        },
      });
    }
  }, { scope: timelineRef });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">
            Seguimiento de Pedido
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0A0A0A]">
            #{orderId}
          </h1>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wide bg-[#8B5CF6]/10 text-[#8B5CF6] px-3 py-1.5 rounded-full">
          En Camino
        </span>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative pl-8 sm:pl-10">
        {/* Gradient stem line */}
        <div className="absolute left-[14px] sm:left-4 top-0 bottom-0 w-0.5 bg-[#EDEBE8]">
          <div
            ref={progressRef}
            className="absolute top-0 left-0 right-0 rounded-full"
            style={{
              height: `${progressPercent}%`,
              background: 'linear-gradient(to bottom, #3B82F6, #8B5CF6, #EC4899, #F97316)',
            }}
          />
        </div>

        {/* Events */}
        <div className="space-y-8">
          {events.map((event, i) => (
            <div key={event.id} className="relative">
              {/* Node */}
              <div
                className={`tracking-node absolute -left-8 sm:-left-10 top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  event.completed
                    ? 'border-transparent'
                    : event.active
                    ? 'border-[#EC4899] bg-white shadow-md shadow-[#EC4899]/30'
                    : 'border-[#EDEBE8] bg-white'
                }`}
                style={event.completed ? { backgroundColor: phaseColors[i], borderColor: 'transparent' } : {}}
              >
                {event.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : event.active ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EC4899] animate-pulse" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-[#D9D5CF]" />
                )}
              </div>

              {/* Content */}
              <div className={`bg-white border rounded-xl p-4 transition-all ${event.active ? 'border-[#EC4899]/30 shadow-sm' : 'border-[#EDEBE8]'}`}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div>
                    <span
                      className="text-[11px] font-bold uppercase tracking-wider mr-2"
                      style={{ color: phaseColors[i] }}
                    >
                      {event.label}
                    </span>
                    <h3 className="text-sm font-semibold text-[#0A0A0A] inline">{event.sublabel}</h3>
                  </div>
                  {event.active && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EC4899]/10 text-[#EC4899] px-2 py-0.5 rounded-full flex-shrink-0">
                      Activo
                    </span>
                  )}
                </div>
                {event.completed && (
                  <div className="flex items-center gap-3 text-xs text-[#8F8780] mt-1 flex-wrap">
                    <span>{event.timestamp}</span>
                    <span>·</span>
                    <span>{event.location}</span>
                  </div>
                )}
                {event.active && (
                  <p className="text-xs text-[#6B6359] mt-1">{event.location}</p>
                )}

                {/* Photo evidence */}
                {event.photoUrl && event.completed && (
                  <div className="mt-3">
                    <img
                      src={event.photoUrl}
                      alt="Delivery evidence"
                      className="w-20 h-20 object-cover rounded-lg border border-[#EDEBE8]"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature section */}
      <div className="mt-10 bg-white border border-[#EDEBE8] rounded-2xl p-6">
        <h2 className="font-body text-sm font-bold uppercase tracking-wider text-[#0A0A0A] mb-5">
          Evidencia de Entrega
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Photo capture placeholder */}
          <div className="border-2 border-dashed border-[#EDEBE8] rounded-xl h-28 flex flex-col items-center justify-center gap-2 text-[#D9D5CF] cursor-pointer hover:border-[#00C9B1] hover:text-[#00C9B1] transition-colors">
            <Camera className="h-6 w-6" />
            <span className="text-xs font-medium">Foto de Evidencia</span>
          </div>

          {/* Signature pad placeholder */}
          <div className="border-2 border-dashed border-[#EDEBE8] rounded-xl h-28 relative flex flex-col items-center justify-center gap-2 text-[#D9D5CF]">
            <Pen className="h-6 w-6" />
            <span className="text-xs font-medium">Firma del Cliente</span>
            <span className="absolute bottom-2 left-3 text-[9px] text-[#D9D5CF]">Firma aquí</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B6359]">
          <div className="w-2 h-2 rounded-full bg-[#00C9B1] animate-pulse" />
          <span>GPS: 19.9833° N, 102.2833° W · Zamora, Michoacán</span>
        </div>
      </div>
    </div>
  );
}
