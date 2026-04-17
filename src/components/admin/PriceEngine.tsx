'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, EyeOff } from 'lucide-react';

const marginSettings = [
  { id: 'base', label: 'Margen Base', description: 'Aplicado a todos los productos', value: 32, color: '#3B82F6' },
  { id: 'utility', label: 'Markup de Utilidad', description: 'Capa de utilidad invisible', value: 18, color: '#8B5CF6' },
  { id: 'logistics', label: 'Costo de Logística', description: 'Costo de entrega por zona', value: 8, color: '#F97316' },
  { id: 'supplier', label: 'Comisión Proveedor', description: 'Comisión del socio POS', value: 12, color: '#00C9B1' },
];

export function PriceEngine() {
  const [margins, setMargins] = useState<Record<string, number>>(
    Object.fromEntries(marginSettings.map((m) => [m.id, m.value]))
  );
  const [visible, setVisible] = useState(false);

  const effectivePrice = 189.00;
  const totalMarkup = Object.values(margins).reduce((sum, v) => sum + v, 0) / marginSettings.length;
  const customerPrice = effectivePrice * (1 + totalMarkup / 100);

  return (
    <Card className="border-[#EDEBE8] shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#C0392B]" />
            <h2 className="font-body text-base font-bold text-[#0A0A0A]">Motor de Precios</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] font-bold">
              Solo Interno
            </Badge>
            <button
              onClick={() => setVisible(!visible)}
              className="text-[#8F8780] hover:text-[#0A0A0A] transition-colors"
            >
              {visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-[#8F8780] mt-1">
          Configura las capas de margen invisibles. El cliente solo ve el precio final.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Price preview */}
        <div className="bg-[#F7F6F5] rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-[#8F8780] uppercase tracking-wider font-body mb-0.5">Costo Base</p>
              <p className="text-lg font-bold font-body">${effectivePrice.toFixed(2)}</p>
            </div>
            <div className="text-[#D9D5CF]">→</div>
            <div className="text-right">
              <p className="text-[10px] text-[#8F8780] uppercase tracking-wider font-body mb-0.5">Precio Cliente</p>
              <p className="text-lg font-bold font-body text-[#0A0A0A]">
                {visible ? `$${customerPrice.toFixed(2)}` : '$ ———'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8F8780] uppercase tracking-wider font-body mb-0.5">Margen Neto</p>
              <p className="text-lg font-bold font-body text-[#00C9B1]">
                {visible ? `+${totalMarkup.toFixed(0)}%` : '—%'}
              </p>
            </div>
          </div>
        </div>

        {/* Margin sliders */}
        <div className="space-y-5">
          {marginSettings.map((setting) => (
            <div key={setting.id}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-sm font-body font-semibold text-[#0A0A0A]">{setting.label}</p>
                  <p className="text-[10px] text-[#8F8780]">{setting.description}</p>
                </div>
                <div
                  className="text-xl font-bold font-body min-w-[52px] text-right"
                  style={{ color: setting.color }}
                >
                  {visible ? `${margins[setting.id]}%` : '—%'}
                </div>
              </div>
              <Slider
                min={0}
                max={60}
                step={1}
                value={[margins[setting.id]]}
                onValueChange={(val) => {
                  const arr = Array.isArray(val) ? val : [val];
                  setMargins((prev) => ({ ...prev, [setting.id]: arr[0] }));
                }}
                className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2"
                style={{ '--slider-color': setting.color } as React.CSSProperties}
              />
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button className="w-full h-9 bg-[#0A0A0A] text-white text-xs font-semibold rounded-lg hover:bg-[#00C9B1] transition-colors">
            Aplicar Configuración de Precios
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
