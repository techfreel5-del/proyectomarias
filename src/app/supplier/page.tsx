import { POSBrandSlot } from '@/components/supplier/POSBrandSlot';
import { StockQuotaCard } from '@/components/supplier/StockQuotaCard';
import { POSGrid } from '@/components/supplier/POSGrid';
import { OrderTable } from '@/components/supplier/OrderTable';
import { posProducts, orders } from '@/lib/mock-data';
import { Logo } from '@/components/brand/Logo';

export const metadata = { title: 'Portal Proveedor · MARIASCLUB™' };

export default function SupplierPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Supplier header bar */}
      <div className="bg-white border-b border-[#EDEBE8] px-4 py-3 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8F8780] font-body">caro (3)</span>
          <div className="w-px h-4 bg-[#EDEBE8]" />
          <span className="text-xs font-body font-medium text-[#0A0A0A]">☰</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <POSBrandSlot brandName="Proveedor Zamora S.A." />

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <POSGrid products={posProducts} />
          </div>
          <div className="space-y-4">
            <StockQuotaCard />

            {/* Quick stats */}
            <div className="bg-white border border-[#EDEBE8] rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8F8780] mb-3">Resumen del Día</h3>
              <div className="space-y-3">
                {[
                  { label: 'Pedidos Activos', value: '12', color: '#3B82F6' },
                  { label: 'Por Entregar', value: '5', color: '#F97316' },
                  { label: 'Completados Hoy', value: '8', color: '#00C9B1' },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6359] font-body">{stat.label}</span>
                    <span className="text-sm font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <OrderTable orders={orders} />
      </div>
    </div>
  );
}
