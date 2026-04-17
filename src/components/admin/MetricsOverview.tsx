import { TrendingUp, TrendingDown, Package, Truck, DollarSign, Clock } from 'lucide-react';

const metrics = [
  { label: 'Pedidos Totales', value: '142', change: '+12%', up: true, icon: Package, color: '#3B82F6' },
  { label: 'Entregas Activas', value: '23', change: '+5%', up: true, icon: Truck, color: '#00C9B1' },
  { label: 'Ingresos Hoy', value: '$4,890', change: '+8%', up: true, icon: DollarSign, color: '#8B5CF6' },
  { label: 'Tiempo Prom. Entrega', value: '4.2h', change: '-12%', up: false, icon: Clock, color: '#F97316' },
];

export function MetricsOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        const Trend = m.up ? TrendingUp : TrendingDown;
        return (
          <div key={m.label} className="bg-white border border-[#EDEBE8] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                <Icon className="h-4 w-4" style={{ color: m.color }} />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-bold ${m.up ? 'text-[#00C9B1]' : 'text-[#C0392B]'}`}>
                <Trend className="h-3 w-3" />
                {m.change}
              </div>
            </div>
            <p className="text-2xl font-bold font-body text-[#0A0A0A]">{m.value}</p>
            <p className="text-xs text-[#8F8780] font-body mt-0.5">{m.label}</p>
          </div>
        );
      })}
    </div>
  );
}
