'use client';

import { useRef, useState, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { ProductCard } from './ProductCard';
import { Slider } from '@/components/ui/slider';
import { Product, Category } from '@/lib/mock-data';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ── Constants ──────────────────────────────────────────────── */

const TABS = ['Todos', 'Nuevo', 'Tendencia', 'Oferta'];
const tabMap: Record<string, string> = { Todos: '', Nuevo: 'new', Tendencia: 'trending', Oferta: 'sale' };

const CATEGORY_LABELS: Record<Category, string> = {
  fashion: 'Moda',
  'home-kitchen': 'Hogar y Cocina',
  'sports-fitness': 'Deportes y Fitness',
  electronics: 'Electrónica',
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  Accessories: 'Accesorios',
  Appliances: 'Electrodomésticos',
  Audio: 'Audio',
  Bags: 'Bolsos',
  Bottoms: 'Pantalones',
  Cameras: 'Cámaras',
  Charging: 'Carga',
  Coffee: 'Café',
  Computing: 'Cómputo',
  Displays: 'Pantallas',
  Dresses: 'Vestidos',
  Footwear: 'Calzado',
  Jackets: 'Chaquetas',
  Knitwear: 'Tejidos',
  Recovery: 'Recuperación',
  Tableware: 'Vajilla',
  Textiles: 'Textiles',
  Wearables: 'Wearables',
  Weights: 'Pesas',
  Wellness: 'Bienestar',
  Yoga: 'Yoga',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];

const COLORS = [
  { name: 'Black', hex: '#1A1A1A', label: 'Negro' },
  { name: 'White', hex: '#FAFAFA', label: 'Blanco' },
  { name: 'Camel', hex: '#C19A6B', label: 'Camel' },
  { name: 'Teal', hex: '#00C9B1', label: 'Teal' },
  { name: 'Navy', hex: '#1B2A4A', label: 'Marino' },
];

/* ── Types ──────────────────────────────────────────────────── */

interface CatalogGridProps {
  products: Product[];
  categoryLabel?: string;
}

/* ── Collapsible section ─────────────────────────────────────── */

function FilterSection({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#EDEBE8] pb-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <h4 className="text-xs font-body font-bold uppercase tracking-[0.15em] text-[#0A0A0A]">{title}</h4>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-[#6B6359] group-hover:text-[#0A0A0A] transition-colors" />
          : <ChevronDown className="h-3.5 w-3.5 text-[#6B6359] group-hover:text-[#0A0A0A] transition-colors" />
        }
      </button>
      {open && children}
    </div>
  );
}

/* ── Filter Panel (reused in sidebar + mobile drawer) ─────────── */

function FilterPanel({
  products,
  selectedCategories, setSelectedCategories,
  selectedSubcategories, setSelectedSubcategories,
  priceRange, setPriceRange,
  maxPrice,
  selectedSizes, toggleSize,
  selectedColors, toggleColor,
  onlyInStock, setOnlyInStock,
  hasActiveFilters, clearFilters,
}: {
  products: Product[];
  selectedCategories: Category[];
  setSelectedCategories: (v: Category[]) => void;
  selectedSubcategories: string[];
  setSelectedSubcategories: (v: string[]) => void;
  priceRange: number[];
  setPriceRange: (v: number[]) => void;
  maxPrice: number;
  selectedSizes: string[];
  toggleSize: (s: string) => void;
  selectedColors: string[];
  toggleColor: (c: string) => void;
  onlyInStock: boolean;
  setOnlyInStock: (v: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}) {
  const allCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))) as Category[],
    [products],
  );

  const subcategoriesForSelected = useMemo(() => {
    const base = selectedCategories.length > 0
      ? products.filter((p) => selectedCategories.includes(p.category))
      : products;
    return Array.from(new Set(base.map((p) => p.subcategory))).sort();
  }, [products, selectedCategories]);

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => { map[p.category] = (map[p.category] || 0) + 1; });
    return map;
  }, [products]);

  const countBySubcategory = useMemo(() => {
    const map: Record<string, number> = {};
    const base = selectedCategories.length > 0
      ? products.filter((p) => selectedCategories.includes(p.category))
      : products;
    base.forEach((p) => { map[p.subcategory] = (map[p.subcategory] || 0) + 1; });
    return map;
  }, [products, selectedCategories]);

  const toggleCategory = (cat: Category) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    // remove subcategories that no longer belong
    if (next.length > 0) {
      const validSubs = new Set(products.filter((p) => next.includes(p.category)).map((p) => p.subcategory));
      setSelectedSubcategories(selectedSubcategories.filter((s) => validSubs.has(s)));
    }
  };

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories(
      selectedSubcategories.includes(sub)
        ? selectedSubcategories.filter((s) => s !== sub)
        : [...selectedSubcategories, sub],
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-body font-bold uppercase tracking-[0.18em] text-[#0A0A0A]">Filtros</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-[#00C9B1] hover:text-[#009E8C] font-medium transition-colors">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Disponibilidad */}
      <FilterSection title="Disponibilidad">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => setOnlyInStock(!onlyInStock)}
            className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all ${
              onlyInStock ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'border-[#D9D5CF] group-hover:border-[#0A0A0A]'
            }`}
          >
            {onlyInStock && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className="text-sm text-[#3D3732] font-body">Solo en stock</span>
        </label>
      </FilterSection>

      {/* Categoría */}
      <FilterSection title="Categoría">
        <div className="space-y-2">
          {allCategories.map((cat) => (
            <label key={cat} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <div
                  onClick={() => toggleCategory(cat)}
                  className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedCategories.includes(cat)
                      ? 'bg-[#0A0A0A] border-[#0A0A0A]'
                      : 'border-[#D9D5CF] group-hover:border-[#0A0A0A]'
                  }`}
                >
                  {selectedCategories.includes(cat) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </div>
                <span className={`text-sm font-body transition-colors ${selectedCategories.includes(cat) ? 'text-[#0A0A0A] font-medium' : 'text-[#3D3732] group-hover:text-[#0A0A0A]'}`}>
                  {CATEGORY_LABELS[cat]}
                </span>
              </div>
              <span className="text-xs text-[#B8B2A8] font-body">{countByCategory[cat]}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Subcategoría */}
      <FilterSection title="Tipo de Producto" defaultOpen={selectedCategories.length > 0}>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {subcategoriesForSelected.map((sub) => (
            <label key={sub} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <div
                  onClick={() => toggleSubcategory(sub)}
                  className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedSubcategories.includes(sub)
                      ? 'bg-[#00C9B1] border-[#00C9B1]'
                      : 'border-[#D9D5CF] group-hover:border-[#00C9B1]'
                  }`}
                >
                  {selectedSubcategories.includes(sub) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </div>
                <span className={`text-sm font-body transition-colors ${selectedSubcategories.includes(sub) ? 'text-[#0A0A0A] font-medium' : 'text-[#3D3732] group-hover:text-[#0A0A0A]'}`}>
                  {SUBCATEGORY_LABELS[sub] ?? sub}
                </span>
              </div>
              <span className="text-xs text-[#B8B2A8] font-body">{countBySubcategory[sub] ?? 0}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Precio */}
      <FilterSection title="Precio">
        <Slider
          min={0}
          max={maxPrice}
          step={5}
          value={priceRange}
          onValueChange={(val) => { if (Array.isArray(val)) setPriceRange(val as number[]); }}
          className="mb-3"
        />
        <div className="flex justify-between">
          <span className="text-xs text-[#6B6359] font-body bg-[#F7F6F5] px-2 py-1">${priceRange[0]}</span>
          <span className="text-xs text-[#6B6359] font-body bg-[#F7F6F5] px-2 py-1">${priceRange[1]}</span>
        </div>
      </FilterSection>

      {/* Talla */}
      <FilterSection title="Talla">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`h-7 px-2.5 text-xs font-body font-medium border transition-all ${
                selectedSizes.includes(size)
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'border-[#D9D5CF] text-[#6B6359] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleColor(color.name)}
              title={color.label}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  selectedColors.includes(color.name)
                    ? 'border-[#00C9B1] scale-110'
                    : 'border-transparent hover:border-[#D9D5CF]'
                } ${color.name === 'White' ? 'ring-1 ring-[#D9D5CF]' : ''}`}
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-[9px] text-[#8F8780] font-body">{color.label}</span>
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */

export function CatalogGrid({ products, categoryLabel = 'Todos los Productos' }: CatalogGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('Todos');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map((p) => p.price)) / 10) * 10, [products]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);

  const toggleColor = (color: string) =>
    setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);

  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, maxPrice]);
    setActiveTab('Todos');
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setOnlyInStock(false);
  };

  const hasActiveFilters =
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    selectedCategories.length > 0 ||
    selectedSubcategories.length > 0 ||
    onlyInStock ||
    priceRange[0] > 0 ||
    priceRange[1] < maxPrice;

  const filteredProducts = useMemo(() => products.filter((p) => {
    if (activeTab !== 'Todos' && p.badge !== tabMap[activeTab]) return false;
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    if (selectedSizes.length > 0 && !p.sizes.some((s) => selectedSizes.includes(s))) return false;
    if (selectedColors.length > 0 && !p.colors.some((c) => selectedColors.includes(c.name))) return false;
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
    if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(p.subcategory)) return false;
    if (onlyInStock && !p.inStock) return false;
    return true;
  }), [products, activeTab, priceRange, selectedSizes, selectedColors, selectedCategories, selectedSubcategories, onlyInStock]);

  const activeFilterCount =
    selectedCategories.length +
    selectedSubcategories.length +
    selectedSizes.length +
    selectedColors.length +
    (onlyInStock ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const cards = gridRef.current?.querySelectorAll('article');
    if (!cards?.length) return;
    gsap.from(cards, {
      y: 50, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
    });
  }, { scope: gridRef, dependencies: [filteredProducts.length] });

  const filterPanelProps = {
    products,
    selectedCategories, setSelectedCategories,
    selectedSubcategories, setSelectedSubcategories,
    priceRange, setPriceRange,
    maxPrice,
    selectedSizes, toggleSize,
    selectedColors, toggleColor,
    onlyInStock, setOnlyInStock,
    hasActiveFilters, clearFilters,
  };

  return (
    <div className="flex gap-8">

      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 hidden lg:block">
        <div className="sticky top-24">
          <FilterPanel {...filterPanelProps} />
        </div>
      </aside>

      {/* ── Mobile filter drawer ──────────────────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDEBE8]">
              <span className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A]">Filtros</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-[#6B6359] hover:text-[#0A0A0A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel {...filterPanelProps} />
            </div>
            <div className="px-5 py-4 border-t border-[#EDEBE8]">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full h-11 bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
              >
                Ver {filteredProducts.length} productos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Tabs + toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
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
            <button
              className="lg:hidden flex items-center gap-1.5 h-8 px-3 border border-[#D9D5CF] text-xs font-body text-[#3D3732] hover:border-[#0A0A0A] hover:text-[#0A0A0A] transition-colors relative"
              onClick={() => setShowMobileFilters(true)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00C9B1] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selectedCategories.map((cat) => (
              <span key={cat} className="flex items-center gap-1 px-2.5 py-1 bg-[#F0FBF9] border border-[#00C9B1] text-xs text-[#007A6E] font-body rounded-full">
                {CATEGORY_LABELS[cat]}
                <button onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedSubcategories.map((sub) => (
              <span key={sub} className="flex items-center gap-1 px-2.5 py-1 bg-[#F0FBF9] border border-[#00C9B1] text-xs text-[#007A6E] font-body rounded-full">
                {SUBCATEGORY_LABELS[sub] ?? sub}
                <button onClick={() => setSelectedSubcategories(selectedSubcategories.filter((s) => s !== sub))}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedSizes.map((size) => (
              <span key={size} className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F6F5] border border-[#D9D5CF] text-xs text-[#3D3732] font-body rounded-full">
                Talla {size}
                <button onClick={() => toggleSize(size)}><X className="h-3 w-3" /></button>
              </span>
            ))}
            {onlyInStock && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F6F5] border border-[#D9D5CF] text-xs text-[#3D3732] font-body rounded-full">
                En stock
                <button onClick={() => setOnlyInStock(false)}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

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
