import { RouteMap } from '@/components/transporter/RouteMap';
import { BalanceDue } from '@/components/transporter/BalanceDue';
import { Logo } from '@/components/brand/Logo';

export const metadata = { title: 'Repartidor App' };

export default function RepartidorPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F5] flex items-center justify-center py-4 px-4">
      <div className="w-full max-w-[390px] min-h-[750px] rounded-[40px] overflow-hidden border-[8px] border-[#1A1A1A] shadow-2xl bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-10 pb-3 border-b border-[#EDEBE8] flex-shrink-0">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#8F8780]">caro (3)</span>
            <span className="text-xs text-[#8F8780]">☰</span>
          </div>
        </div>

        {/* Map */}
        <div className="flex-shrink-0">
          <RouteMap />
        </div>

        {/* Balance due + confirm */}
        <div className="flex-1 overflow-y-auto">
          <BalanceDue />
        </div>
      </div>
    </div>
  );
}
