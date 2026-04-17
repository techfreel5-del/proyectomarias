'use client';

import { useState } from 'react';
import { CheckCircle2, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function BalanceDue() {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Balance card */}
      <div className="bg-white border border-[#EDEBE8] rounded-2xl shadow-sm p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-[#8F8780] mb-1">
              Saldo Pendiente
            </p>
            <p className="text-3xl font-bold font-body text-[#0A0A0A]">$50.00</p>
          </div>
          <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-[10px] font-bold">
            Cobro Pendiente
          </Badge>
        </div>

        <Separator className="mb-4 bg-[#EDEBE8]" />

        {/* Delivery info */}
        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-3.5 w-3.5 text-[#00C9B1] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold font-body text-[#0A0A0A]">Juan Pérez</p>
              <p className="text-xs text-[#8F8780] font-body">Calle Hidalgo 45, Zamora Centro</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-3.5 w-3.5 text-[#00C9B1] flex-shrink-0" />
            <p className="text-xs text-[#8F8780] font-body">+52 351 123 4567</p>
          </div>
        </div>

        <Separator className="my-4 bg-[#EDEBE8]" />

        {/* Order summary */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-body">
            <span className="text-[#8F8780]">Pro Blender 1200W × 2</span>
            <span className="font-semibold">$378.00</span>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className="text-[#8F8780]">Anticipo pagado</span>
            <span className="font-semibold text-[#009E8C]">−$328.00</span>
          </div>
          <div className="flex justify-between text-xs font-bold font-body border-t border-[#EDEBE8] pt-1.5">
            <span>Saldo a pagar</span>
            <span className="text-[#C0392B]">$50.00</span>
          </div>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={() => setConfirmed(true)}
        disabled={confirmed}
        className={`w-full h-12 rounded-xl text-sm font-bold transition-all ${
          confirmed
            ? 'bg-[#00C9B1] text-white cursor-default'
            : 'bg-[#00C9B1] text-white hover:bg-[#009E8C] active:scale-[0.98]'
        }`}
      >
        {confirmed ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Entrega Confirmada.
          </span>
        ) : 'Confirmar Entrega'}
      </button>

      {confirmed && (
        <div className="text-center py-2">
          <p className="text-xs text-[#6B6359] font-body">
            ✓ Recibo enviado · GPS registrado · Saldo cobrado
          </p>
        </div>
      )}
    </div>
  );
}
