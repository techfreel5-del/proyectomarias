import { QRScannerUI } from '@/components/transporter/QRScannerUI';

export const metadata = { title: 'Transporter App' };

export default function TransporterPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center py-4 px-4">
      {/* Mobile shell */}
      <div className="w-full max-w-[390px] h-[844px] rounded-[40px] overflow-hidden border-[8px] border-[#1A1A1A] shadow-2xl relative bg-[#0A0A0A]">
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-8 z-10">
          <span className="text-[10px] text-white font-semibold">9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white">▲▲▲</span>
            <span className="text-[10px] text-white">📶</span>
            <span className="text-[10px] text-white">🔋</span>
          </div>
        </div>
        <QRScannerUI />
      </div>
    </div>
  );
}
