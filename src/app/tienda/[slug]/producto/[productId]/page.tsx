'use client';

import { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft, Play,
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { getSuppliers } from '@/lib/suppliers-store';
import { getTheme } from '@/lib/store-themes';
import { getEffectivePrice } from '@/lib/pricing-store';
import { products as catalogProducts } from '@/lib/mock-data';
import type { InventoryProduct, SupplierProfile } from '@/lib/supplier-context';

interface CartItem {
  product: InventoryProduct;
  qty: number;
  variantId?: string;
  variantLabel?: string;
}

function parseVideo(url: string): { type: 'iframe' | 'video' | null; src: string } {
  if (!url) return { type: null, src: '' };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  return { type: 'video', src: url };
}

export default function SupplierProductPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = use(params);

  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [supplierId, setSupplierId] = useState('');

  const [activeImg, setActiveImg] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const record = getSuppliers().find((s) => s.profile.slug === slug);
    if (!record) return;
    setProfile(record.profile);
    setSupplierId(record.id);
    const prod = record.inventory.find((p) => p.id === productId);
    if (!prod) return;
    setProduct(prod);
    // Default variant selections: prefer inventory variants, fall back to catalog
    const vs = prod.variants ?? [];
    if (prod.hasVariants && vs.length > 0) {
      const colors = [...new Set(vs.filter((v) => v.color).map((v) => v.color!))];
      const sizes  = [...new Set(vs.filter((v) => v.size).map((v) => v.size!))];
      if (colors.length) setSelectedColor(colors[0]);
      if (sizes.length)  setSelectedSize(sizes[0]);
    } else {
      const catProd = catalogProducts.find((p) => p.id === productId);
      if (catProd?.colors.length)             setSelectedColor(catProd.colors[0].name);
      if (catProd?.sizes.filter(Boolean).length) setSelectedSize(catProd.sizes.filter(Boolean)[0]);
    }
    // Load cart count from localStorage
    try {
      const saved = localStorage.getItem(`mc_cart_${record.id}`);
      if (saved) setCartCount((JSON.parse(saved) as CartItem[]).reduce((s, i) => s + i.qty, 0));
    } catch { /* ignore */ }
  }, [slug, productId]);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !product) return;
    gsap.from(galleryRef.current, { opacity: 0, x: -30, duration: 0.7, ease: 'power2.out' });
    gsap.from(infoRef.current, { opacity: 0, x: 30, duration: 0.7, ease: 'power2.out', delay: 0.1 });
  }, { dependencies: [product?.id] });

  function handleAddToCart() {
    if (!product || !supplierId) return;
    try {
      const saved = localStorage.getItem(`mc_cart_${supplierId}`);
      const items: CartItem[] = saved ? JSON.parse(saved) : [];
      const variantId = [selectedColor, selectedSize].filter(Boolean).join('-') || undefined;
      const variantLabel = [selectedColor, selectedSize].filter(Boolean).join(' / ') || undefined;
      const ex = items.find((i) => i.product.id === product.id && i.variantId === variantId);
      if (ex) {
        ex.qty += qty;
      } else {
        items.push({ product, qty, variantId, variantLabel });
      }
      localStorage.setItem(`mc_cart_${supplierId}`, JSON.stringify(items));
      setCartCount(items.reduce((s, i) => s + i.qty, 0));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch { /* ignore */ }
  }

  if (!profile || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: 'system-ui', color: '#888' }}>Cargando…</p>
      </div>
    );
  }

  const t = getTheme(profile.storeTheme);
  const effectivePrice = getEffectivePrice(product.id, product.price);
  const imgs = ((product.images?.length ? product.images : [product.image]).filter(Boolean)) as string[];
  const videoSrc = product.videoFile || product.videoUrl || '';
  const hasVideo = !!videoSrc;
  const videoData = parseVideo(videoSrc);
  const totalMedia = imgs.length + (hasVideo ? 1 : 0);

  const variants = product.variants ?? [];
  const hasVariants = !!(product.hasVariants && variants.length > 0);
  const uniqueColors = [...new Set(variants.filter((v) => v.color).map((v) => v.color!))];
  const uniqueSizes = [...new Set(
    variants
      .filter((v) => v.size && (!selectedColor || v.color === selectedColor))
      .map((v) => v.size!),
  )];
  const selectedVariant = variants.find((v) => {
    const cOk = !selectedColor || v.color === selectedColor;
    const sOk = !selectedSize || v.size === selectedSize;
    return cOk && sOk;
  });
  const availableStock = selectedVariant?.stock ?? product.stock;

  // Fallback: colors & sizes from the catalog product when inventory has no variants
  const catalogProduct  = !hasVariants ? catalogProducts.find((p) => p.id === product.id) : undefined;
  const catColors = catalogProduct?.colors ?? [];
  const catSizes  = (catalogProduct?.sizes ?? []).filter(Boolean);
  const showVariants = hasVariants || catColors.length > 0 || catSizes.length > 0;

  return (
    <div style={{ backgroundColor: t.bgPage, color: t.textPrimary, fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Mini header */}
      <header
        className="sticky top-0 z-40"
        style={{
          backgroundColor: t.headerBg,
          borderBottom: `1px solid ${t.cardBorderColor}`,
          backdropFilter: t.headerBlur ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: t.headerBlur ? 'blur(14px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href={`/tienda/${slug}`}
            className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ color: t.textPrimary }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:block">{profile.storeName}</span>
            <span className="sm:hidden">Volver</span>
          </Link>

          <p
            className="text-sm font-medium line-clamp-1 flex-1 text-center hidden md:block"
            style={{ color: t.textSecondary }}
          >
            {product.name}
          </p>

          <Link
            href={`/tienda/${slug}`}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ backgroundColor: profile.brandColor, color: '#fff' }}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:block">Carrito</span>
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
                style={{ backgroundColor: profile.accentColor }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <nav className="flex items-center gap-1.5 text-xs" style={{ color: t.textSecondary }}>
          <Link href={`/tienda/${slug}`} className="hover:opacity-70 transition-opacity">
            {profile.storeName}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span style={{ color: t.textPrimary }} className="line-clamp-1">{product.name}</span>
        </nav>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-[1fr_460px] gap-8 lg:gap-14 items-start">

          {/* LEFT: Gallery */}
          <div ref={galleryRef}>
            {/* Main image / video */}
            <div
              className="relative aspect-[4/5] rounded-2xl overflow-hidden"
              style={{ backgroundColor: t.bgSection }}
            >
              {showVideo && videoSrc ? (
                videoData.type === 'iframe' ? (
                  <iframe
                    src={videoData.src}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay"
                    title="Video del producto"
                  />
                ) : (
                  <video
                    src={videoData.src}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <Image
                  src={imgs[Math.min(activeImg, imgs.length - 1)]}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              )}

              {/* Nav arrows */}
              {imgs.length > 1 && !showVideo && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + imgs.length) % imgs.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-900" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % imgs.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-900" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {totalMedia > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {imgs.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImg(i); setShowVideo(false); }}
                    className="relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderColor: !showVideo && activeImg === i ? profile.brandColor : 'transparent',
                    }}
                  >
                    <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="72px" />
                  </button>
                ))}
                {hasVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="w-[72px] h-[72px] flex-shrink-0 rounded-lg bg-black/80 border-2 flex items-center justify-center transition-all"
                    style={{ borderColor: showVideo ? profile.brandColor : 'transparent' }}
                  >
                    <Play className="h-6 w-6 fill-white text-white" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Info */}
          <div ref={infoRef} className="flex flex-col gap-5 lg:sticky lg:top-20">

            {/* Category + Name + Price */}
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.25em] uppercase mb-1.5"
                style={{ color: t.textSecondary }}
              >
                {product.category}
              </p>
              <h1
                className="text-3xl sm:text-[2.25rem] font-bold leading-tight mb-4"
                style={{ color: t.textPrimary }}
              >
                {product.name}
              </h1>
              <p className="text-2xl font-black" style={{ color: profile.accentColor }}>
                ${effectivePrice.toFixed(2)}
              </p>
            </div>

            <hr style={{ borderColor: t.cardBorderColor }} />

            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>
                {product.description}
              </p>
            )}

            {/* Variants */}
            {showVariants && (
              <div className="space-y-4">

                {/* ── Inventory variants (color) ── */}
                {hasVariants && uniqueColors.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5" style={{ color: t.textSecondary }}>
                      Color{selectedColor && <span className="normal-case font-normal" style={{ color: t.textPrimary }}> — {selectedColor}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((color) => {
                        const inStock = variants.some((v) => v.color === color && v.stock > 0);
                        const active = selectedColor === color;
                        return (
                          <button key={color} onClick={() => { setSelectedColor(active ? '' : color); setSelectedSize(''); }} disabled={!inStock}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all"
                            style={{ borderColor: active ? profile.brandColor : t.cardBorderColor, backgroundColor: active ? profile.brandColor : 'transparent', color: active ? '#fff' : inStock ? t.textPrimary : t.textSecondary, opacity: inStock ? 1 : 0.5 }}>
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Inventory variants (talla) ── */}
                {hasVariants && uniqueSizes.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5" style={{ color: t.textSecondary }}>
                      Talla{selectedSize && <span className="normal-case font-normal" style={{ color: t.textPrimary }}> — {selectedSize}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map((size) => {
                        const inStock = variants.some((v) => v.size === size && (!selectedColor || v.color === selectedColor) && v.stock > 0);
                        const active = selectedSize === size;
                        return (
                          <button key={size} onClick={() => setSelectedSize(active ? '' : size)} disabled={!inStock}
                            className="h-9 min-w-[40px] px-3 text-sm font-medium rounded-lg border-2 transition-all"
                            style={{ borderColor: active ? profile.brandColor : t.cardBorderColor, backgroundColor: active ? profile.brandColor : 'transparent', color: active ? '#fff' : inStock ? t.textPrimary : t.textSecondary, opacity: inStock ? 1 : 0.5 }}>
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Catalog fallback: colors with hex swatches ── */}
                {!hasVariants && catColors.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5" style={{ color: t.textSecondary }}>
                      Color{selectedColor && <span className="normal-case font-normal" style={{ color: t.textPrimary }}> — {selectedColor}</span>}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {catColors.map((c) => {
                        const active = selectedColor === c.name;
                        return (
                          <button
                            key={c.name}
                            title={c.name}
                            onClick={() => setSelectedColor(active ? '' : c.name)}
                            className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                            style={{
                              backgroundColor: c.hex,
                              borderColor: active ? t.textPrimary : 'transparent',
                              boxShadow: active ? `0 0 0 2px ${t.bgPage}, 0 0 0 4px ${t.textPrimary}` : 'none',
                              transform: active ? 'scale(1.15)' : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Catalog fallback: sizes ── */}
                {!hasVariants && catSizes.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2.5" style={{ color: t.textSecondary }}>
                      Talla{selectedSize && <span className="normal-case font-normal" style={{ color: t.textPrimary }}> — {selectedSize}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {catSizes.map((size) => {
                        const active = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(active ? '' : size)}
                            className="h-9 min-w-[40px] px-3 text-sm font-medium rounded-lg border-2 transition-all"
                            style={{
                              borderColor: active ? profile.brandColor : t.cardBorderColor,
                              backgroundColor: active ? profile.brandColor : 'transparent',
                              color: active ? '#fff' : t.textPrimary,
                            }}
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

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <div
                className="flex items-center rounded-xl overflow-hidden border"
                style={{ borderColor: t.cardBorderColor }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-xl font-light hover:opacity-60 transition-opacity"
                  style={{ color: t.textSecondary }}
                >
                  −
                </button>
                <span
                  className="w-10 text-center text-sm font-bold"
                  style={{ color: t.textPrimary }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(availableStock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-xl font-light hover:opacity-60 transition-opacity"
                  style={{ color: t.textSecondary }}
                >
                  +
                </button>
              </div>
              <span className="text-xs" style={{ color: t.textSecondary }}>
                {availableStock} disponible{availableStock !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={availableStock === 0}
              className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ backgroundColor: added ? '#00C9B1' : profile.brandColor, color: '#fff' }}
            >
              <ShoppingBag className="h-4 w-4" />
              {availableStock === 0
                ? 'Sin stock disponible'
                : added
                ? '¡Agregado al carrito!'
                : `Agregar al carrito — $${(effectivePrice * qty).toFixed(2)}`}
            </button>

            {/* Back to store */}
            <Link
              href={`/tienda/${slug}`}
              className="w-full h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border-2 transition-all hover:opacity-80"
              style={{ borderColor: profile.brandColor, color: profile.brandColor }}
            >
              ← Volver a la tienda
            </Link>

            {/* SKU */}
            <p className="text-[11px]" style={{ color: t.textSecondary }}>
              SKU: {product.sku}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
