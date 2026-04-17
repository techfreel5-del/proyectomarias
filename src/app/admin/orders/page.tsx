import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { OrderTable } from '@/components/supplier/OrderTable';
import { orders } from '@/lib/mock-data';

export const metadata = { title: 'Pedidos · Admin Panel' };

export default function AdminOrdersPage() {
  const statusCounts = {
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    returned: orders.filter((o) => o.status === 'returned').length,
  };

  const stats = [
    { label: 'Pendientes', value: statusCounts.pending, color: '#F97316', bg: 'bg-orange-50' },
    { label: 'Procesando', value: statusCounts.processing, color: '#3B82F6', bg: 'bg-blue-50' },
    { label: 'Enviados', value: statusCounts.shipped, color: '#8B5CF6', bg: 'bg-purple-50' },
    { label: 'Entregados', value: statusCounts.delivered, color: '#00C9B1', bg: 'bg-[#00C9B1]/10' },
    { label: 'Devueltos', value: statusCounts.returned, color: '#C0392B', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">
            MARIASCLUB™
          </p>
          <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Gestión de Pedidos</h1>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`${s.bg} border border-[#EDEBE8] rounded-xl p-4`}>
              <p className="text-2xl font-black font-body" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-[#6B6359] font-body mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3 bg-white border border-[#EDEBE8] rounded-xl px-4 py-3">
          <span className="text-xs font-body font-semibold text-[#8F8780] uppercase tracking-wider">Filtrar:</span>
          {['Todos', 'Pendientes', 'En proceso', 'Enviados', 'Entregados'].map((f) => (
            <button
              key={f}
              className={`text-xs font-body px-3 py-1.5 rounded-lg transition-colors ${
                f === 'Todos'
                  ? 'bg-[#0A0A0A] text-white font-semibold'
                  : 'text-[#6B6359] hover:bg-[#F7F6F5]'
              }`}
            >
              {f}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-xs text-[#8F8780] font-body">{orders.length} pedidos en total</span>
        </div>

        <OrderTable orders={orders} />
      </main>
    </div>
  );
}
