'use client';

import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { ProductCard } from './ProductCard';
import { Slider } from '@/components/ui/slider';
import { Product, Category } from '@/lib/mock-data';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const TABS = ['Todos', 'Nuevo', 'Tendencia', 'Oferta'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
const COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#FAFAFA' },
  { name: 'Camel', hex: '#C19A6B' },
  { name: 'Teal', hex: '#00C9B1' },
  { name: 'Navy', hex: '#1B2A4A' },
];

interface CatalogGridProps {
  products: Product[];
  categoryLabel?: string;
}

export function CatalogGrid({ products, categoryLabel = 'Todos los Productos' }: CatalogGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('Todos');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const tabMap: Record<string, string> = { 'Todos': '', 'Nuevo': 'new', 'Tendencia': 'trending', 'Oferta': 'sale' };

  const filteredProducts = products.filter((p) => {
    if (activeTab !== 'Todos') {
      const tabBadge = tabMap[activeTab];
      if (p.badge !== tabBadge) return false;
    }
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (selectedSizes.length > 0 && !p.sizes.some((s) => selectedSizes.includes(s))) return false;
    if (selectedColors.length > 0 && !p.colors.some((c) => selectedColors.includes(c.name))) return false;
    return true;
  });

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const cards = gridRef.current?.querySelectorAll('article');
    if (!cards?.length) return;

    gsap.from(cards, {
      y: 50,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 85%',
      },
    });
  }, { scope: gridRef, dependencies: [filteredProducts.length] });

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);

  const toggleColor = (color: string) =>
    setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 500]);
    setActiveTab('Todos');
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 500;

  return (
    <div className="flex gap-8">
      {/* Sidebar filters */}
      <aside className={`w-60 flex-shrink-0 hidden lg:block`}>
        <div className="sticky top-24 space-y-7">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-body font-bold uppercase tracking-[0.15em] text-[#0A0A0A]">Filtros</h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-[#00C9B1] hover:text-[#009E8C] font-medium">
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-[#6B6359] mb-3">Rango de Precio</h4>
            <Slider
              min={0}
              max={500}
              step={5}
              value={priceRange}
              onValueChange={(val) => {
                if (Array.isArray(val)) setPriceRange(val as number[]);
              }}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-[#6B6359] font-body">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-[#6B6359] mb-3">Talla</h4>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`h-7 px-2.5 text-xs font-body font-medium rounded border transition-all ${
                    selectedSizes.includes(size)
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                      : 'border-[#D9D5CF] text-[#6B6359] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h4 className="text-xs font-body font-semibold uppercase tracking-wider text-[#6B6359] mb-3">Color</h4>

            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  title={color.name}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedColors.includes(color.name)
                      ? 'border-[#00C9B1] scale-110'
                      : 'border-transparent hover:border-[#D9D5CF]'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Tabs + mobile filter button */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-body font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'bg-[#0A0A0A] text-white'
                    : 'text-[#6B6359] hover:text-[#0A0A0A] hover:bg-[#F7F6F5]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-[#8F8780] font-body hidden sm:block">
              {filteredProducts.length} productos
            </span>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden text-xs border-[#D9D5CF]"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div
            ref={gridRef}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[#8F8780] font-body text-base">Ningún producto coincide con los filtros.</p>
            <button onClick={clearFilters} className="mt-3 text-sm text-[#00C9B1] font-medium hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
