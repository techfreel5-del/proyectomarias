import { ProofCapture } from '@/components/transporter/ProofCapture';

export const metadata = { title: 'Proof of Delivery' };

export default function DeliveryProofPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F5] flex items-center justify-center py-4 px-4">
      <div className="w-full max-w-[390px] h-[844px] rounded-[40px] overflow-hidden border-[8px] border-[#1A1A1A] shadow-2xl bg-white">
        <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-8 z-10 pointer-events-none">
          <span className="text-[10px] text-[#0A0A0A] font-semibold">9:41</span>
        </div>
        <ProofCapture />
      </div>
    </div>
  );
}
