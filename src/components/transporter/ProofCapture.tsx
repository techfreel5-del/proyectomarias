'use client';

import { useRef, useState } from 'react';
import { Camera, Pen, MapPin, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

export function ProofCapture() {
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [signed, setSigned] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-[#EDEBE8]">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8F8780]">Carlos R. (3)</span>
          <span className="text-xs text-[#8F8780]">☰</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        <div>
          <h2 className="font-body text-xl font-bold text-[#0A0A0A] mb-1">Proof of Delivery</h2>
          <p className="text-xs text-[#8F8780]">Order PKG-4821 · Juan Pérez</p>
        </div>

        {/* Photo section */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">Photo Evidence</p>
          <button
            onClick={() => setPhotoCaptured(true)}
            className={`w-full border-2 border-dashed rounded-xl h-36 flex flex-col items-center justify-center gap-2 transition-all ${
              photoCaptured
                ? 'border-[#00C9B1] bg-[#00C9B1]/5'
                : 'border-[#D9D5CF] hover:border-[#00C9B1]'
            }`}
          >
            {photoCaptured ? (
              <>
                <CheckCircle2 className="h-7 w-7 text-[#00C9B1]" />
                <span className="text-xs font-medium text-[#00C9B1]">Photo Captured</span>
              </>
            ) : (
              <>
                <Camera className="h-7 w-7 text-[#D9D5CF]" />
                <span className="text-xs font-medium text-[#8F8780]">Tap to capture photo</span>
              </>
            )}
          </button>
        </div>

        {/* Signature pad */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">Customer Signature</p>
          <div
            className={`relative border-2 rounded-xl h-32 transition-all ${
              signed ? 'border-[#00C9B1] bg-[#00C9B1]/5' : 'border-[#EDEBE8] bg-[#F7F6F5]'
            }`}
            onClick={() => setSigned(true)}
          >
            {signed ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg width="160" height="50" viewBox="0 0 160 50" className="text-[#0A0A0A]">
                  <path d="M20 35 Q40 10 60 30 T100 25 T140 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <>
                <Pen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-[#D9D5CF]" />
                <span className="absolute bottom-2 left-3 text-[9px] text-[#D9D5CF]">Sign here</span>
              </>
            )}
          </div>
        </div>

        {/* GPS indicator */}
        <div className="bg-[#F7F6F5] rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00C9B1] animate-pulse-teal flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A]">GPS Location Captured</p>
            <p className="text-[10px] text-[#8F8780]">19.9833° N, 102.2833° W · Zamora Centro</p>
          </div>
          <MapPin className="h-4 w-4 text-[#00C9B1] ml-auto" />
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-4 border-t border-[#EDEBE8]">
        <button
          disabled={!photoCaptured || !signed}
          className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${
            photoCaptured && signed
              ? 'bg-[#0A0A0A] text-white hover:bg-[#00C9B1]'
              : 'bg-[#EDEBE8] text-[#B8B2A8] cursor-not-allowed'
          }`}
        >
          Confirmación
        </button>
        {(!photoCaptured || !signed) && (
          <p className="text-center text-[10px] text-[#8F8780] mt-2">
            Capture photo and signature to continue
          </p>
        )}
      </div>
    </div>
  );
}
