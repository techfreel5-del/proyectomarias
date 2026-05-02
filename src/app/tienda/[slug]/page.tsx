'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  ShoppingBag, Search, Phone, Mail, MapPin, ShoppingCart,
  Plus, X, Minus, ChevronLeft, ChevronRight, Play, Eye,
} from 'lucide-react';
import { type SupplierProfile, type InventoryProduct, type ProductVariant } from '@/lib/supplier-context';
import { SupplierCheckoutModal } from '@/components/supplier/SupplierCheckoutModal';
import { getSuppliers } from '@/lib/suppliers-store';
import { use } from 'react';

// ─── Types ───────────────────────────────────────────────────

interface CartItem {
  product: InventoryProduct;
  qty: number;
  variantId?: string;
  variantLabel?: string;
}

// ─── Video helper ─────────────────────────────────────────────

function parseVideo(url: string): { type: 'iframe' | 'video' | null; src: string } {
  if (!url) return { type: null, src: '' };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  return { type: 'video', src: url };
}

// ─── Product Detail Modal ────────────────────────────────────

interface DetailModalProps {
  product: InventoryProduct;
  profile: SupplierProfile;
  onClose: () => void;
  onAddToCart: (product: InventoryProduct, variantId?: string, variantLabel?: string) => void;
}

function ProductDetailModal({ product, profile, onClose, onAddToCart }: DetailModalProps) {
  const imgs = product.images?.length ? product.images : [product.image];
  const hasVideo = !!(product.videoUrl || product.videoFile);
  const totalItems = imgs.length + (hasVideo ? 1 : 0);
  const [activeItem, setActiveItem] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [added, setAdded] = useState(false);

  const variants = product.variants ?? [];
  const variantType = product.variantType ?? 'none';
  const hasVariants = !!(product.hasVariants && variants.length > 0);

  // Unique colors/sizes for selector
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];

  // Available sizes for selected color (to grey out unavailable combos)
  const sizesForColor = selectedColor
    ? variants.filter(v => v.color === selectedColor).map(v => v.size).filter(Boolean) as string[]
    : uniqueSizes;

  // Find selected variant
  const selectedVariant: ProductVariant | undefined = hasVariants
    ? variants.find(v => {
        if (variantType === 'color-talla') return v.color === selectedColor && v.size === selectedSize;
        if (variantType === 'color') return v.color === selectedColor;
        return v.size === selectedSize; // talla or tamaño
      })
    : undefined;

  const availableStock = selectedVariant?.stock ?? (hasVariants ? 0 : product.stock);

  const canAdd = !hasVariants || (
    (variantType === 'color' && !!selectedColor) ||
    (variantType === 'talla' && !!selectedSize) ||
    (variantType === 'tamaño' && !!selectedSize) ||
    (variantType === 'color-talla' && !!selectedColor && !!selectedSize)
  );

  const buildLabel = () => {
    const parts = [selectedColor, selectedSize].filter(Boolean);
    return parts.join(' / ');
  };

  const handleAdd = () => {
    if (!canAdd || availableStock === 0) return;
    const variantId = selectedVariant?.id;
    const variantLabel = buildLabel() || undefined;
    onAddToCart(product, variantId, variantLabel);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isShowingVideo = hasVideo && activeItem === imgs.length;
  const videoData = hasVideo
    ? parseVideo(product.videoUrl ?? product.videoFile ?? '')
    : null;

  const prev = () => setActiveItem(i => (i - 1 + totalItems) % totalItems);
  const next = () => setActiveItem(i => (i + 1) % totalItems);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-4xl shadow-2xl flex flex-col sm:flex-row max-h-[95dvh] sm:max-h-[88vh] overflow-hidden">

        {/* ─── Left: Gallery ─────────────────────────────── */}
        <div className="relative flex-shrink-0 sm:w-[55%] bg-[#F7F6F5]">
          {/* Main display */}
          <div className="relative aspect-square sm:aspect-auto sm:h-full min-h-[260px]">
            {isShowingVideo && videoData ? (
              videoData.type === 'iframe' ? (
                <iframe src={videoData.src} className="w-full h-full" allowFullScreen title="Video del producto" allow="autoplay" />
              ) : (
                <video src={videoData.src} controls autoPlay className="w-full h-full object-contain bg-black" />
              )
            ) : (
              <Image
                src={imgs[activeItem] ?? imgs[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 55vw"
                priority
              />
            )}

            {/* Prev/Next arrows */}
            {totalItems > 1 && (
              <>
                <button onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <ChevronLeft className="h-4 w-4 text-[#0A0A0A]" />
                </button>
                <button onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                  <ChevronRight className="h-4 w-4 text-[#0A0A0A]" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {totalItems > 1 && (
            <div className="absolute bottom-0 left-0 right-0 flex gap-2 px-3 pb-3 justify-center">
              {imgs.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveItem(idx)}
                  className={`relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    activeItem === idx ? 'border-white shadow-lg scale-105' : 'border-white/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={src} alt={`${idx + 1}`} fill className="object-cover" sizes="48px" />
                </button>
              ))}
              {hasVideo && (
                <button
                  onClick={() => setActiveItem(imgs.length)}
                  className={`w-12 h-12 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all bg-black/80 ${
                    isShowingVideo ? 'border-white shadow-lg scale-105' : 'border-white/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Play className="h-5 w-5 text-white fill-white" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Right: Info ───────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Close button */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{product.category}</span>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 pb-6 space-y-4 flex-1">
            {/* Name + price */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h2>
              <p className="text-2xl font-black mt-1" style={{ color: profile.accentColor }}>${product.price.toFixed(2)}</p>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            )}

            {/* ─── Variant selector ─────────────────────── */}
            {hasVariants && (
              <div className="space-y-3">
                {/* Color selector */}
                {(variantType === 'color' || variantType === 'color-talla') && uniqueColors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Color {selectedColor && <span className="normal-case font-normal text-gray-700">— {selectedColor}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map(color => {
                        const hasStock = variants.some(v => v.color === color && v.stock > 0);
                        return (
                          <button
                            key={color}
                            onClick={() => { setSelectedColor(selectedColor === color ? '' : color); setSelectedSize(''); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                              selectedColor === color
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : hasStock
                                ? 'border-gray-200 text-gray-700 hover:border-gray-400'
                                : 'border-gray-100 text-gray-300 line-through cursor-not-allowed'
                            }`}
                            disabled={!hasStock}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size/tamaño selector */}
                {(variantType === 'talla' || variantType === 'tamaño' || variantType === 'color-talla') && uniqueSizes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      {variantType === 'tamaño' ? 'Tamaño' : 'Talla'}
                      {selectedSize && <span className="normal-case font-normal text-gray-700"> — {selectedSize}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map(size => {
                        const inRange = variantType === 'color-talla'
                          ? sizesForColor.includes(size)
                          : true;
                        const hasStock = variants.some(v => {
                          const colorOk = variantType === 'color-talla' ? v.color === selectedColor : true;
                          return colorOk && v.size === size && v.stock > 0;
                        });
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                            disabled={!inRange || !hasStock}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                              selectedSize === size
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : inRange && hasStock
                                ? 'border-gray-200 text-gray-700 hover:border-gray-400'
                                : 'border-gray-100 text-gray-300 line-through cursor-not-allowed'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                availableStock > 10 ? 'bg-green-400' : availableStock > 0 ? 'bg-orange-400' : 'bg-red-400'
              }`} />
              <span className="text-xs text-gray-500 font-body">
                {availableStock > 10
                  ? 'Disponible'
                  : availableStock > 0
                  ? `Solo ${availableStock} disponibles`
                  : 'Sin stock'}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={!canAdd || availableStock === 0}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : !canAdd || availableStock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-white hover:opacity-90'
              }`}
              style={(!added && canAdd && availableStock > 0) ? { backgroundColor: profile.brandColor } : {}}
            >
              <ShoppingCart className="h-4 w-4" />
              {added
                ? '¡Agregado al carrito!'
                : !canAdd && hasVariants
                ? 'Selecciona una opción'
                : availableStock === 0
                ? 'Sin stock'
                : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);

  useEffect(() => {
    const allSuppliers = getSuppliers();
    const record = allSuppliers.find((s) => s.profile.slug === slug);
    if (record) {
      setProfile(record.profile);
      setInventory(record.inventory);
    }
  }, [slug]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8F8780] font-body">Cargando tienda…</p>
      </div>
    );
  }

  const activeProducts = inventory.filter((p) => p.active && p.stock > 0);
  const categories = Array.from(new Set(activeProducts.map((p) => p.category)));

  const filtered = activeProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  // ─── Cart logic ──────────────────────────────────────────
  const addToCart = useCallback((product: InventoryProduct, variantId?: string, variantLabel?: string) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id && i.variantId === variantId);
      if (ex) return prev.map((i) =>
        i.product.id === product.id && i.variantId === variantId
          ? { ...i, qty: i.qty + 1 }
          : i,
      );
      return [...prev, { product, qty: 1, variantId, variantLabel }];
    });
    setSelectedProduct(null);
  }, []);

  const updateCartQty = (id: string, variantId: string | undefined, delta: number) => {
    setCart((prev) => prev
      .map((i) => i.product.id === id && i.variantId === variantId ? { ...i, qty: i.qty + delta } : i)
      .filter((i) => i.qty > 0),
    );
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const cartQty = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: profile.brandColor }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {profile.logo ? (
              <div className="relative h-9 w-28">
                <Image src={profile.logo} alt={profile.storeName} fill className="object-contain object-left" />
              </div>
            ) : (
              <span className="text-white font-bold text-xl tracking-tight">{profile.storeName}</span>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-6 text-white/90 text-sm">
            <button onClick={() => setFilterCat('')} className="hover:text-white transition-colors font-medium">Inicio</button>
            {categories.slice(0, 4).map((cat) => (
              <button key={cat} onClick={() => setFilterCat(cat)} className="hover:text-white transition-colors">{cat}</button>
            ))}
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white border-2 border-white/30 hover:border-white/60 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:block">Carrito</span>
            {cartQty > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                style={{ backgroundColor: profile.accentColor, color: '#fff' }}
              >
                {cartQty}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Banner */}
      {profile.bannerUrl && (
        <div className="relative h-52 sm:h-72 overflow-hidden">
          <Image src={profile.bannerUrl} alt="Banner" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4" style={{ background: `${profile.brandColor}CC` }}>
            <h1 className="text-white font-black text-3xl sm:text-5xl mb-2">{profile.storeName}</h1>
            <p className="text-white/85 text-sm sm:text-base max-w-xl">{profile.description}</p>
          </div>
        </div>
      )}

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos…"
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
              style={{ '--tw-ring-color': profile.brandColor } as React.CSSProperties}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!filterCat ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={!filterCat ? { backgroundColor: profile.brandColor } : {}}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterCat === cat ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={filterCat === cat ? { backgroundColor: profile.brandColor } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Sin productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p) => {
              const primaryImg = p.images?.[0] ?? p.image;
              const imgCount = p.images?.length ?? 1;
              const hasVariants = !!(p.hasVariants && (p.variants?.length ?? 0) > 0);
              const hasVideo = !!(p.videoUrl || p.videoFile);

              return (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                  {/* Image — clickable to open detail */}
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="relative w-full aspect-square overflow-hidden bg-gray-50 block"
                  >
                    <Image
                      src={primaryImg}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    {/* Badges overlay */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {imgCount > 1 && (
                        <span className="text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-bold">
                          {imgCount} fotos
                        </span>
                      )}
                      {hasVideo && (
                        <span className="flex items-center gap-0.5 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-bold">
                          <Play className="h-2.5 w-2.5 fill-white" /> Video
                        </span>
                      )}
                    </div>
                    {/* View detail hint */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                        <Eye className="h-3.5 w-3.5" /> Ver detalle
                      </span>
                    </div>
                  </button>

                  <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 text-left hover:underline w-full"
                    >
                      {p.name}
                    </button>
                    <p className="text-lg font-black mb-2" style={{ color: profile.accentColor }}>${p.price.toFixed(2)}</p>

                    {/* Variant info or quick add */}
                    {hasVariants ? (
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 transition-all hover:text-white"
                        style={{ borderColor: profile.brandColor, color: profile.brandColor }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = profile.brandColor; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = ''; (e.currentTarget as HTMLButtonElement).style.color = profile.brandColor; }}
                      >
                        Seleccionar opciones
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: profile.brandColor }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            {profile.logo ? (
              <div className="relative h-10 w-32 mb-3">
                <Image src={profile.logo} alt={profile.storeName} fill className="object-contain object-left" />
              </div>
            ) : (
              <p className="font-black text-xl mb-3" style={{ color: profile.brandColor }}>{profile.storeName}</p>
            )}
            <p className="text-sm text-gray-500">{profile.description}</p>
          </div>
          <div>
            <p className="font-bold text-gray-800 mb-3 text-sm">Contacto</p>
            <div className="space-y-2 text-sm text-gray-500">
              {profile.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{profile.email}</p>}
              {profile.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{profile.phone}</p>}
              {profile.address && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{profile.address}</p>}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} {profile.storeName}</p>
          {profile.showPoweredBy && (
            <p className="text-xs text-gray-400">Powered by <span className="font-bold text-gray-600">MARIASCLUB™</span></p>
          )}
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          profile={profile}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <SupplierCheckoutModal
          cart={cart}
          profile={profile}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => { setCart([]); setCartOpen(false); }}
        />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[380px] bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrito ({cartQty})
              </span>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map(({ product, qty, variantId, variantLabel }) => (
                  <div key={`${product.id}-${variantId ?? ''}`} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                      <Image src={product.images?.[0] ?? product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      {variantLabel && (
                        <p className="text-xs text-gray-400 mt-0.5">{variantLabel}</p>
                      )}
                      <p className="text-sm font-bold mt-0.5" style={{ color: profile.accentColor }}>${product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-1 mt-1.5 border border-gray-200 rounded-lg w-fit">
                        <button onClick={() => updateCartQty(product.id, variantId, -1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center text-xs font-bold">{qty}</span>
                        <button onClick={() => updateCartQty(product.id, variantId, 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-xl font-black" style={{ color: profile.brandColor }}>${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: profile.brandColor }}
                >
                  Proceder al pago
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
