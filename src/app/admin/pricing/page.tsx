import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { PriceEngine } from '@/components/admin/PriceEngine';

export const metadata = { title: 'Price Engine · Admin' };

export default function AdminPricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">MARIASCLUB™</p>
          <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Price Engine</h1>
        </div>
        <div className="max-w-xl">
          <PriceEngine />
        </div>
      </main>
    </div>
  );
}
