import Image from 'next/image';
import { POSProduct } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

interface POSGridProps {
  products: POSProduct[];
}

export function POSGrid({ products }: POSGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-body text-base font-bold text-[#0A0A0A]">Product Inventory</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search products…"
            className="h-8 pl-3 pr-8 text-xs border border-[#EDEBE8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C9B1] bg-white font-body w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-[#EDEBE8] rounded-xl p-3 hover:border-[#00C9B1] transition-colors group"
          >
            {/* Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-[#F7F6F5] mb-3">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="200px"
              />
            </div>

            {/* Info */}
            <p className="text-[10px] text-[#8F8780] font-body mb-0.5">{product.sku}</p>
            <p className="text-xs font-body font-semibold text-[#0A0A0A] line-clamp-1 mb-2">{product.name}</p>

            {/* Stock */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-[#0A0A0A] leading-none">{product.stock}</p>
                <p className="text-[9px] text-[#8F8780] font-body">in stock</p>
              </div>
              <Badge className="text-[9px] bg-[#00C9B1]/10 text-[#009E8C] border-0 px-1.5 py-0.5">
                {product.allocatedZamora} → Zamora
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
