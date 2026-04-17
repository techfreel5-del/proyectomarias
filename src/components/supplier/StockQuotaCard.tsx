'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function StockQuotaCard() {
  const [autoControl, setAutoControl] = useState(true);
  const [manualControl, setManualControl] = useState(false);

  const toggleAuto = () => {
    setAutoControl((v) => !v);
    if (!autoControl) setManualControl(false);
  };
  const toggleManual = () => {
    setManualControl((v) => !v);
    if (!manualControl) setAutoControl(false);
  };

  return (
    <Card className="border-[#EDEBE8] shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-body text-base font-bold text-[#0A0A0A] leading-snug">
              Cuota de Stock<br />a Zamora
            </h2>
            <p className="text-xs text-[#8F8780] mt-1.5 leading-relaxed max-w-xs">
              Controla cómo se asigna el stock al hub de distribución en Zamora. Alterna entre asignación automática o modo manual.
            </p>
          </div>
          <Badge variant="outline" className="border-[#EDEBE8] text-[#8F8780] text-[10px] flex-shrink-0">
            {autoControl ? 'Auto' : 'Manual'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4 bg-[#EDEBE8]" />

        <div className="space-y-4">
          {/* Automatic Control */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body font-semibold text-[#0A0A0A]">Control Automático</p>
              <p className="text-xs text-[#8F8780] mt-0.5">El sistema gestiona la asignación de stock</p>
            </div>
            <button
              onClick={toggleAuto}
              role="switch"
              aria-checked={autoControl}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                autoControl ? 'bg-[#00C9B1]' : 'bg-[#D9D5CF]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  autoControl ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <Separator className="bg-[#EDEBE8]" />

          {/* Manual Control */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-body font-semibold text-[#0A0A0A]">Control Manual</p>
              <p className="text-xs text-[#8F8780] mt-0.5">Anula la asignación automática</p>
            </div>
            <button
              onClick={toggleManual}
              role="switch"
              aria-checked={manualControl}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                manualControl ? 'bg-[#00C9B1]' : 'bg-[#D9D5CF]'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  manualControl ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
