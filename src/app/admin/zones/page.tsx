import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ZoneConfigurator } from '@/components/admin/ZoneConfigurator';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Delivery Zones · Admin' };

export default async function AdminZonesPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { id: 'asc' } }).catch(() => []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">MARIASCLUB™</p>
          <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Zonas de Entrega</h1>
        </div>
        <div className="bg-white border border-[#EDEBE8] rounded-xl p-6">
          <ZoneConfigurator zones={zones} />
        </div>
      </main>
    </div>
  );
}
