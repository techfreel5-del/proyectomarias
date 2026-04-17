import { MetricsOverview } from '@/components/admin/MetricsOverview';
import { PriceEngine } from '@/components/admin/PriceEngine';
import { ZoneConfigurator } from '@/components/admin/ZoneConfigurator';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { OrderTable } from '@/components/supplier/OrderTable';
import { deliveryZones, orders } from '@/lib/mock-data';

export const metadata = { title: 'Admin Panel' };

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      {/* Main */}
      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">
            MARIASCLUB™
          </p>
          <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Resumen General</h1>
        </div>

        <MetricsOverview />

        <div className="grid lg:grid-cols-2 gap-6">
          <PriceEngine />
          <div className="bg-white border border-[#EDEBE8] rounded-xl p-5">
            <ZoneConfigurator zones={deliveryZones} />
          </div>
        </div>

        <OrderTable orders={orders} />
      </main>
    </div>
  );
}
