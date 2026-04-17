import { Building2 } from 'lucide-react';

interface POSBrandSlotProps {
  brandName?: string;
  logoSlot?: React.ReactNode;
}

export function POSBrandSlot({ brandName = 'Proveedor Demo', logoSlot }: POSBrandSlotProps) {
  return (
    <div className="flex items-center gap-4 pb-6 mb-8 border-b border-[#EDEBE8]">
      {logoSlot ?? (
        <div className="w-14 h-14 bg-[#F7F6F5] border-2 border-dashed border-[#D9D5CF] rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="h-5 w-5 text-[#B8B2A8]" />
        </div>
      )}
      <div>
        <p className="text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-[#8F8780] mb-0.5">
          Powered by MARIASCLUB™
        </p>
        <h1 className="font-display text-xl font-bold text-[#0A0A0A]">{brandName}</h1>
        <p className="text-xs text-[#8F8780] font-body mt-0.5">Supplier Dashboard</p>
      </div>

      {/* White-label customization hint */}
      <button className="ml-auto text-xs font-medium text-[#00C9B1] hover:text-[#009E8C] transition-colors hidden sm:block">
        Customize Brand →
      </button>
    </div>
  );
}
