'use client';

import { useState } from 'react';
import { Users, Clock } from 'lucide-react';

interface Zone { id: string; name: string; estimatedHours: number; active: boolean; repartidores: number; }

interface ZoneConfiguratorProps {
  zones: Zone[];
}

export function ZoneConfigurator({ zones: initialZones }: ZoneConfiguratorProps) {
  const [zones, setZones] = useState(initialZones);

  const patchZone = (id: string, data: Record<string, unknown>) =>
    fetch(`/api/admin/zones/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

  const toggleZone = (id: string) => {
    setZones((prev) => prev.map((z) => {
      if (z.id !== id) return z;
      patchZone(id, { active: !z.active });
      return { ...z, active: !z.active };
    }));
  };

  const updateHours = (id: string, hours: number) =>
    setZones((prev) => prev.map((z) => z.id === id ? { ...z, estimatedHours: hours } : z));

  const saveHours = (id: string, hours: number) =>
    patchZone(id, { estimatedHours: hours });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-body text-base font-bold text-[#0A0A0A]">Zonas de Entrega — Zamora</h2>
        <span className="text-xs text-[#8F8780] font-body">{zones.filter((z) => z.active).length} activas</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`bg-white border rounded-xl p-4 transition-all ${
              zone.active ? 'border-[#00C9B1]/30 shadow-sm' : 'border-[#EDEBE8] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-body font-semibold text-[#0A0A0A]">{zone.name}</h3>
              <button
                onClick={() => toggleZone(zone.id)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                  zone.active ? 'bg-[#00C9B1]' : 'bg-[#D9D5CF]'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    zone.active ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Est. hours */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-[#8F8780]" />
                    <span className="text-[10px] text-[#8F8780] font-body">Horas est.</span>
                  </div>
                  <span className="text-xs font-bold text-[#0A0A0A] font-body">{zone.estimatedHours}h</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={48}
                  value={zone.estimatedHours}
                  onChange={(e) => updateHours(zone.id, Number(e.target.value))}
                  onPointerUp={(e) => saveHours(zone.id, Number((e.target as HTMLInputElement).value))}
                  className="w-full h-1 appearance-none rounded-full bg-[#EDEBE8] cursor-pointer"
                  style={{ accentColor: '#00C9B1' }}
                  disabled={!zone.active}
                />
              </div>

              {/* Repartidores */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-[#8F8780]" />
                  <span className="text-[10px] text-[#8F8780] font-body">Repartidores</span>
                </div>
                <span className="text-xs font-bold text-[#0A0A0A] font-body">{zone.repartidores}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
