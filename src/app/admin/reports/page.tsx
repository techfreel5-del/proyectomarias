import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { orders } from '@/lib/mock-data';

export const metadata = { title: 'Reportes · Admin Panel' };

const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
const delivered = orders.filter((o) => o.status === 'delivered').length;
const returned = orders.filter((o) => o.status === 'returned').length;
const returnRate = ((returned / orders.length) * 100).toFixed(1);

const topProducts = [
  { name: 'Pro Blender 1200W', units: 42, revenue: 7938, category: 'Hogar y Cocina' },
  { name: 'Blazer Signature Invierno', units: 35, revenue: 6125, category: 'Moda' },
  { name: 'Botas de Piel Premium', units: 29, revenue: 5655, category: 'Moda' },
  { name: 'SmartWatch Pro', units: 24, revenue: 5976, category: 'Electrónica' },
  { name: 'Sudadera Deportiva', units: 21, revenue: 1659, category: 'Deportes' },
];

const weeklyData = [
  { day: 'Lun', orders: 18, revenue: 3240 },
  { day: 'Mar', orders: 24, revenue: 4320 },
  { day: 'Mié', orders: 15, revenue: 2700 },
  { day: 'Jue', orders: 31, revenue: 5580 },
  { day: 'Vie', orders: 42, revenue: 7560 },
  { day: 'Sáb', orders: 38, revenue: 6840 },
  { day: 'Dom', orders: 22, revenue: 3960 },
];

const maxOrders = Math.max(...weeklyData.map((d) => d.orders));

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">
              MARIASCLUB™
            </p>
            <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Reportes</h1>
          </div>
          <div className="flex gap-2">
            {['Esta semana', 'Este mes', 'Este año'].map((p, i) => (
              <button
                key={p}
                className={`text-xs font-body px-3 py-1.5 rounded-lg border transition-colors ${
                  i === 0
                    ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] font-semibold'
                    : 'border-[#EDEBE8] text-[#6B6359] hover:bg-[#F7F6F5]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Ingresos Totales', value: `$${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, change: '+12.4%', up: true },
            { label: 'Pedidos Totales', value: orders.length.toString(), change: '+8.1%', up: true },
            { label: 'Tasa de Devolución', value: `${returnRate}%`, change: '-0.3%', up: true },
            { label: 'Pedidos Entregados', value: delivered.toString(), change: '+15.2%', up: true },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-[#EDEBE8] rounded-xl p-5">
              <p className="text-[10px] font-body font-semibold uppercase tracking-wider text-[#8F8780] mb-2">{kpi.label}</p>
              <p className="text-2xl font-black font-body text-[#0A0A0A]">{kpi.value}</p>
              <p className={`text-xs font-body mt-1 font-semibold ${kpi.up ? 'text-[#00C9B1]' : 'text-[#C0392B]'}`}>
                {kpi.change} vs. semana anterior
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Weekly chart */}
          <div className="lg:col-span-3 bg-white border border-[#EDEBE8] rounded-xl p-5">
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-5">Pedidos por Día</h2>
            <div className="flex items-end gap-3 h-40">
              {weeklyData.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-body text-[#8F8780]">{d.orders}</span>
                  <div
                    className="w-full bg-[#00C9B1] rounded-t-sm transition-all"
                    style={{ height: `${(d.orders / maxOrders) * 100}%`, minHeight: 4 }}
                  />
                  <span className="text-[10px] font-body font-semibold text-[#6B6359]">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="lg:col-span-2 bg-white border border-[#EDEBE8] rounded-xl p-5">
            <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-5">Por Categoría</h2>
            <div className="space-y-3">
              {[
                { label: 'Moda', pct: 38, color: '#00C9B1' },
                { label: 'Hogar y Cocina', pct: 27, color: '#3B82F6' },
                { label: 'Electrónica', pct: 21, color: '#8B5CF6' },
                { label: 'Deportes', pct: 14, color: '#F97316' },
              ].map((cat) => (
                <div key={cat.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-body text-[#6B6359]">{cat.label}</span>
                    <span className="text-xs font-bold font-body">{cat.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#EDEBE8] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white border border-[#EDEBE8] rounded-xl p-5">
          <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-5">Productos Más Vendidos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EDEBE8]">
                  {['#', 'Producto', 'Categoría', 'Unidades Vendidas', 'Ingresos'].map((h) => (
                    <th key={h} className="text-left pb-3 text-[10px] font-bold uppercase tracking-wider text-[#8F8780] font-body pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEBE8]">
                {topProducts.map((p, i) => (
                  <tr key={p.name} className="hover:bg-[#F7F6F5] transition-colors">
                    <td className="py-3 pr-4 text-xs font-bold text-[#8F8780] font-body">{i + 1}</td>
                    <td className="py-3 pr-4 text-xs font-semibold text-[#0A0A0A] font-body">{p.name}</td>
                    <td className="py-3 pr-4 text-xs text-[#6B6359] font-body">{p.category}</td>
                    <td className="py-3 pr-4 text-xs font-bold text-[#0A0A0A] font-body">{p.units}</td>
                    <td className="py-3 text-xs font-bold text-[#00C9B1] font-body">${p.revenue.toLocaleString('es-MX')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
