'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  ShoppingBag, Search, Phone, Mail, MapPin, X, Plus, Minus,
  ChevronLeft, ChevronRight, Play, Eye, Instagram, ArrowDown,
  ShoppingCart,
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, SplitText } from '@/lib/gsap';
import { type SupplierProfile, type InventoryProduct, type ProductVariant } from '@/lib/supplier-context';
import { SupplierCheckoutModal } from '@/components/supplier/SupplierCheckoutModal';
import { getSuppliers } from '@/lib/suppliers-store';
import { getTheme, type ThemeTokens } from '@/lib/store-themes';
import { use } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CartItem {
  product: InventoryProduct;
  qty: number;
  variantId?: string;
  variantLabel?: string;
}

// ─── Video helper ─────────────────────────────────────────────────────────────

function parseVideo(url: string): { type: 'iframe' | 'video' | null; src: string } {
  if (!url) return { type: null, src: '' };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  return { type: 'video', src: url };
}

// ─── Announcement Bar ─────────────────────────────────────────────────────────

function AnnouncementBar({ text, bg }: { text: string; bg: string }) {
  return (
    <div className="overflow-hidden h-8 flex items-center" style={{ backgroundColor: bg }}>
      <div
        className="flex gap-16 whitespace-nowrap text-white text-xs font-semibold tracking-wide"
        style={{ animation: 'marquee 28s linear infinite' }}
      >
        {[...Array(4)].map((_, i) => <span key={i}>{text}</span>)}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

// ─── Store Header ─────────────────────────────────────────────────────────────

interface HeaderProps {
  profile: SupplierProfile;
  t: ThemeTokens;
  categories: string[];
  activeCategory: string;
  onCategoryClick: (cat: string) => void;
  cartQty: number;
  onCartOpen: () => void;
}

function StoreHeader({ profile, t, categories, activeCategory, onCategoryClick, cartQty, onCartOpen }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prevQty = useRef(cartQty);

  useGSAP(() => {
    const header = headerRef.current;
    if (!header) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from(header, { y: -70, opacity: 0, duration: 0.7, ease: 'power3.out' });

    let lastY = 0;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const currentY = self.scroll();
        if (currentY > lastY && currentY > 100) {
          gsap.to(header, { y: '-110%', duration: 0.35, ease: 'power2.in', overwrite: true });
        } else {
          gsap.to(header, { y: '0%', duration: 0.45, ease: 'power2.out', overwrite: true });
        }
        lastY = currentY;
      },
    });
  }, { scope: headerRef });

  // Badge bump when cart changes
  useGSAP(() => {
    if (!badgeRef.current || cartQty === prevQty.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      gsap.fromTo(badgeRef.current, { scale: 1.8 }, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
    }
    prevQty.current = cartQty;
  }, { dependencies: [cartQty] });

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40"
      style={{
        backgroundColor: t.headerBg,
        backdropFilter: t.headerBlur ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: t.headerBlur ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${t.cardBorderColor}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {profile.logo ? (
            <div className="relative h-9 w-28">
              <Image src={profile.logo} alt={profile.storeName} fill className="object-contain object-left" />
            </div>
          ) : (
            <span
              className="font-bold text-lg tracking-tight"
              style={{
                fontFamily: t.fontHeadline,
                color: t.textPrimary,
                fontStyle: t.headlineStyle,
              }}
            >
              {profile.storeName}
            </span>
          )}
        </div>

        {/* Nav categories (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {['Todos', ...categories.slice(0, 4)].map((cat) => {
            const active = cat === 'Todos' ? !activeCategory : activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryClick(cat === 'Todos' ? '' : cat)}
                className="relative px-4 py-2 text-sm font-medium transition-colors group"
                style={{ color: active ? profile.brandColor : t.textSecondary }}
              >
                {cat}
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 transition-transform duration-300 origin-left"
                  style={{
                    backgroundColor: profile.brandColor,
                    transform: active ? 'scaleX(1)' : 'scaleX(0)',
                  }}
                />
              </button>
            );
          })}
        </nav>

        {/* Cart button */}
        <button
          onClick={onCartOpen}
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: profile.brandColor, color: '#fff' }}
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:block">Carrito</span>
          {cartQty > 0 && (
            <span
              ref={badgeRef}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center"
              style={{ backgroundColor: profile.accentColor }}
            >
              {cartQty}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

interface HeroProps {
  profile: SupplierProfile;
  t: ThemeTokens;
  onCtaClick: () => void;
}

function StoreHero({ profile, t, onCtaClick }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (headlineRef.current) {
      const split = new SplitText(headlineRef.current, { type: 'lines' });
      split.lines.forEach((line) => {
        const wrapper = document.createElement('div');
        wrapper.style.overflow = 'hidden';
        line.parentNode?.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });
      tl
        .from(badgeRef.current, { y: 20, opacity: 0, duration: 0.45 }, 0)
        .from(split.lines, { y: '105%', opacity: 0, stagger: 0.1, duration: 0.85 }, 0.15)
        .from(subRef.current, { y: 20, opacity: 0, duration: 0.55 }, 0.55)
        .from(ctaRef.current, { y: 14, opacity: 0, duration: 0.45 }, 0.75)
        .from(arrowRef.current, { opacity: 0, duration: 0.4 }, 1.1);

      return () => split.revert();
    }
  }, { scope: containerRef, dependencies: [profile.storeName] });

  const ctaText = profile.heroCtaText || 'Ver colección';

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center text-center overflow-hidden"
      style={{ minHeight: 'min(100dvh, 860px)' }}
    >
      {/* Background */}
      {profile.bannerUrl ? (
        <div className="absolute inset-0">
          <Image src={profile.bannerUrl} alt={profile.storeName} fill className="object-cover" priority sizes="100vw" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${profile.brandColor}${Math.round(t.heroBgOpacity * 255).toString(16).padStart(2, '0')} 0%, ${profile.brandColor}CC 100%)`,
            }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${profile.brandColor} 0%, ${profile.brandColor}99 100%)` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 px-6 max-w-4xl mx-auto">
        <span
          ref={badgeRef}
          className="inline-block text-xs font-bold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6 text-white"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
        >
          {profile.storeName}
        </span>
        <h1
          ref={headlineRef}
          className="text-white mb-5 leading-[1.05]"
          style={{
            fontFamily: t.fontHeadline,
            fontStyle: t.headlineStyle,
            fontWeight: t.headlineWeight,
            fontSize: 'clamp(2.8rem, 7vw, 6.5rem)',
          }}
        >
          {profile.description || profile.storeName}
        </h1>
        {profile.description && (
          <p ref={subRef} className="text-white/80 mb-10 max-w-xl mx-auto" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 300 }}>
            {profile.storeName}
          </p>
        )}
        <button
          ref={ctaRef}
          onClick={onCtaClick}
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: profile.accentColor, color: '#fff' }}
        >
          {ctaText}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Scroll indicator */}
      <div
        ref={arrowRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60"
        style={{ animation: 'bounce 2s infinite' }}
      >
        <ArrowDown className="h-5 w-5" />
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0) translateX(-50%)} 50%{transform:translateY(8px) translateX(-50%)} }`}</style>
      </div>
    </div>
  );
}

// ─── Category Filter ──────────────────────────────────────────────────────────

interface FilterProps {
  profile: SupplierProfile;
  t: ThemeTokens;
  categories: string[];
  activeCategory: string;
  search: string;
  onCategoryClick: (cat: string) => void;
  onSearchChange: (s: string) => void;
}

function CategoryFilter({ profile, t, categories, activeCategory, search, onCategoryClick, onSearchChange }: FilterProps) {
  const filterRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    gsap.from(filterRef.current, { y: -10, opacity: 0, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: filterRef.current, start: 'top 90%' } });
  }, { scope: filterRef });

  return (
    <div
      ref={filterRef}
      className="sticky z-30 border-b"
      style={{ top: '64px', backgroundColor: t.filterBarBg, borderColor: t.filterBarBorder }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {/* Search */}
        <div className="relative flex-shrink-0 w-52 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: t.textSecondary }} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar…"
            className="w-full rounded-full pl-8 pr-4 py-2 text-xs focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: t.inputBg,
              border: `1px solid ${t.cardBorderColor}`,
              color: t.textPrimary,
            }}
          />
        </div>
        {/* Divider */}
        <div className="h-5 w-px hidden sm:block" style={{ backgroundColor: t.cardBorderColor }} />
        {/* Category chips */}
        {['Todos', ...categories].map((cat) => {
          const active = cat === 'Todos' ? !activeCategory : activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryClick(cat === 'Todos' ? '' : cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: active ? profile.brandColor : 'transparent',
                color: active ? '#fff' : t.textSecondary,
                border: `1.5px solid ${active ? profile.brandColor : t.cardBorderColor}`,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

interface CardProps {
  product: InventoryProduct;
  profile: SupplierProfile;
  t: ThemeTokens;
  cardStyle: 'rounded' | 'square';
  onViewDetail: (p: InventoryProduct) => void;
  onAddToCart: (p: InventoryProduct) => void;
}

function ProductCard({ product, profile, t, cardStyle, onViewDetail, onAddToCart }: CardProps) {
  const primaryImg = product.images?.[0] ?? product.image;
  const hasVariants = !!(product.hasVariants && (product.variants?.length ?? 0) > 0);
  const hasVideo = !!(product.videoUrl || product.videoFile);
  const imgCount = product.images?.length ?? 1;
  const radius = cardStyle === 'rounded' ? t.cardRadius : '2px';

  return (
    <div
      className="group overflow-hidden transition-shadow duration-300"
      style={{
        backgroundColor: t.bgCard,
        border: `${t.cardBorderWidth} solid ${t.cardBorderColor}`,
        boxShadow: t.cardShadow,
        borderRadius: radius,
      }}
    >
      {/* Image */}
      <button
        onClick={() => onViewDetail(product)}
        className="relative w-full aspect-square overflow-hidden block"
        style={{ backgroundColor: t.bgSection }}
      >
        <Image
          src={primaryImg}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {imgCount > 1 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: t.badgeBg, color: t.badgeText }}>
              {imgCount} fotos
            </span>
          )}
          {hasVideo && (
            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: t.badgeBg, color: t.badgeText }}>
              <Play className="h-2.5 w-2.5 fill-current" /> Video
            </span>
          )}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}>
          <span className="bg-white/95 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg" style={{ color: t.textPrimary }}>
            <Eye className="h-3.5 w-3.5" /> Ver detalle
          </span>
        </div>
      </button>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] font-medium mb-1 uppercase tracking-wider" style={{ color: t.textSecondary }}>{product.category}</p>
        <button
          onClick={() => onViewDetail(product)}
          className="text-sm font-semibold line-clamp-2 mb-2 text-left hover:opacity-70 transition-opacity w-full"
          style={{ color: t.textPrimary }}
        >
          {product.name}
        </button>
        <p className="text-lg font-black mb-3" style={{ color: profile.accentColor }}>${product.price.toFixed(2)}</p>
        {hasVariants ? (
          <button
            onClick={() => onViewDetail(product)}
            className="w-full py-2 text-xs font-bold uppercase tracking-wider border-2 transition-all hover:text-white rounded-full"
            style={{ borderColor: profile.brandColor, color: profile.brandColor }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = profile.brandColor; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = profile.brandColor; }}
          >
            Seleccionar opciones
          </button>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className="w-full py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: profile.brandColor }}
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Product Grid ─────────────────────────────────────────────────────────────

interface GridProps {
  products: InventoryProduct[];
  profile: SupplierProfile;
  t: ThemeTokens;
  cardStyle: 'rounded' | 'square';
  onViewDetail: (p: InventoryProduct) => void;
  onAddToCart: (p: InventoryProduct) => void;
}

function ProductGrid({ products, profile, t, cardStyle, onViewDetail, onAddToCart }: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const cards = gridRef.current?.querySelectorAll('.product-card-item');
    if (!cards?.length) return;
    gsap.from(cards, {
      y: 52,
      opacity: 0,
      stagger: { amount: 0.55, from: 'start' },
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: gridRef.current, start: 'top 87%' },
    });
  }, { scope: gridRef, dependencies: [products.length] });

  if (products.length === 0) {
    return (
      <div className="text-center py-24" style={{ color: t.textSecondary }}>
        <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Sin productos disponibles</p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((p) => (
        <div key={p.id} className="product-card-item">
          <ProductCard
            product={p}
            profile={profile}
            t={t}
            cardStyle={cardStyle}
            onViewDetail={onViewDetail}
            onAddToCart={onAddToCart}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Product Detail Modal ─────────────────────────────────────────────────────

interface DetailModalProps {
  product: InventoryProduct;
  profile: SupplierProfile;
  t: ThemeTokens;
  onClose: () => void;
  onAddToCart: (product: InventoryProduct, variantId?: string, variantLabel?: string) => void;
}

function ProductDetailModal({ product, profile, t, onClose, onAddToCart }: DetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
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
  const uniqueColors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];
  const uniqueSizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];
  const sizesForColor = selectedColor
    ? variants.filter(v => v.color === selectedColor).map(v => v.size).filter(Boolean) as string[]
    : uniqueSizes;
  const selectedVariant: ProductVariant | undefined = hasVariants
    ? variants.find(v => {
        if (variantType === 'color-talla') return v.color === selectedColor && v.size === selectedSize;
        if (variantType === 'color') return v.color === selectedColor;
        return v.size === selectedSize;
      })
    : undefined;
  const availableStock = selectedVariant?.stock ?? (hasVariants ? 0 : product.stock);
  const canAdd = !hasVariants || (
    (variantType === 'color' && !!selectedColor) ||
    (variantType === 'talla' && !!selectedSize) ||
    (variantType === 'tamaño' && !!selectedSize) ||
    (variantType === 'color-talla' && !!selectedColor && !!selectedSize)
  );

  // GSAP entrance
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !modalRef.current) return;
    gsap.fromTo(
      modalRef.current,
      { scale: 0.93, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.42, ease: 'back.out(1.2)' },
    );
  }, { scope: modalRef });

  const handleClose = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !modalRef.current) { onClose(); return; }
    gsap.to(modalRef.current, {
      scale: 0.94, opacity: 0, y: 20, duration: 0.25, ease: 'power2.in',
      onComplete: onClose,
    });
  }, [onClose]);

  const handleAdd = () => {
    if (!canAdd || availableStock === 0) return;
    const variantId = selectedVariant?.id;
    const variantLabel = [selectedColor, selectedSize].filter(Boolean).join(' / ') || undefined;
    onAddToCart(product, variantId, variantLabel);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isShowingVideo = hasVideo && activeItem === imgs.length;
  const videoData = hasVideo ? parseVideo(product.videoUrl ?? product.videoFile ?? '') : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose]);

  const cardRadius = t.cardRadius;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div
        ref={modalRef}
        className="w-full sm:max-w-4xl flex flex-col sm:flex-row overflow-hidden"
        style={{
          maxHeight: '94dvh',
          backgroundColor: t.bgCard,
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }}
      >
        {/* Gallery side */}
        <div className="relative flex-shrink-0 sm:w-[55%] bg-black" style={{ minHeight: '280px' }}>
          <div className="relative w-full aspect-square sm:aspect-auto sm:h-full">
            {isShowingVideo && videoData ? (
              videoData.type === 'iframe' ? (
                <iframe src={videoData.src} className="w-full h-full" allowFullScreen allow="autoplay" title="Video" />
              ) : (
                <video src={videoData.src} controls autoPlay className="w-full h-full object-contain" />
              )
            ) : (
              <Image
                src={imgs[Math.min(activeItem, imgs.length - 1)]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 55vw"
                priority
              />
            )}
          </div>
          {/* Arrows */}
          {totalItems > 1 && (
            <>
              <button
                onClick={() => setActiveItem(i => (i - 1 + totalItems) % totalItems)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-900" />
              </button>
              <button
                onClick={() => setActiveItem(i => (i + 1) % totalItems)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-900" />
              </button>
            </>
          )}
          {/* Thumbnails */}
          {totalItems > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex gap-2 justify-center px-3">
              {imgs.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveItem(idx)}
                  className="relative w-11 h-11 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
                  style={{ borderColor: activeItem === idx ? '#fff' : 'rgba(255,255,255,0.35)', opacity: activeItem === idx ? 1 : 0.65 }}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="44px" />
                </button>
              ))}
              {hasVideo && (
                <button
                  onClick={() => setActiveItem(imgs.length)}
                  className="w-11 h-11 flex-shrink-0 rounded-lg bg-black/80 border-2 flex items-center justify-center transition-all"
                  style={{ borderColor: isShowingVideo ? '#fff' : 'rgba(255,255,255,0.35)', opacity: isShowingVideo ? 1 : 0.65 }}
                >
                  <Play className="h-4 w-4 fill-white text-white" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info side */}
        <div className="flex flex-col flex-1 overflow-y-auto" style={{ backgroundColor: t.bgCard }}>
          <div className="flex items-start justify-between px-5 pt-5 pb-2 flex-shrink-0">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: t.bgSection, color: t.textSecondary }}
            >
              {product.category}
            </span>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: t.bgSection, color: t.textSecondary }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 pb-6 space-y-4 flex-1">
            <div>
              <h2 className="text-xl font-bold leading-tight" style={{ color: t.textPrimary, fontFamily: t.fontHeadline, fontStyle: t.headlineStyle }}>{product.name}</h2>
              <p className="text-2xl font-black mt-1.5" style={{ color: profile.accentColor }}>${product.price.toFixed(2)}</p>
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>{product.description}</p>
            )}

            {/* Variants */}
            {hasVariants && (
              <div className="space-y-3">
                {(variantType === 'color' || variantType === 'color-talla') && uniqueColors.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: t.textSecondary }}>
                      Color {selectedColor && <span className="normal-case font-normal" style={{ color: t.textPrimary }}>— {selectedColor}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map(color => {
                        const hasStock = variants.some(v => v.color === color && v.stock > 0);
                        const active = selectedColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => { setSelectedColor(active ? '' : color); setSelectedSize(''); }}
                            disabled={!hasStock}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all"
                            style={{
                              borderColor: active ? profile.brandColor : t.cardBorderColor,
                              backgroundColor: active ? profile.brandColor : 'transparent',
                              color: active ? '#fff' : hasStock ? t.textPrimary : t.textMuted,
                              textDecoration: hasStock ? 'none' : 'line-through',
                              opacity: hasStock ? 1 : 0.5,
                            }}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {(variantType === 'talla' || variantType === 'tamaño' || variantType === 'color-talla') && uniqueSizes.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: t.textSecondary }}>
                      {variantType === 'tamaño' ? 'Tamaño' : 'Talla'}
                      {selectedSize && <span className="normal-case font-normal" style={{ color: t.textPrimary }}> — {selectedSize}</span>}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map(size => {
                        const inRange = variantType === 'color-talla' ? sizesForColor.includes(size) : true;
                        const hasStock = variants.some(v => {
                          const colorOk = variantType === 'color-talla' ? v.color === selectedColor : true;
                          return colorOk && v.size === size && v.stock > 0;
                        });
                        const active = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(active ? '' : size)}
                            disabled={!inRange || !hasStock}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all"
                            style={{
                              borderColor: active ? profile.brandColor : t.cardBorderColor,
                              backgroundColor: active ? profile.brandColor : 'transparent',
                              color: active ? '#fff' : inRange && hasStock ? t.textPrimary : t.textMuted,
                              textDecoration: inRange && hasStock ? 'none' : 'line-through',
                              opacity: inRange && hasStock ? 1 : 0.4,
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

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: availableStock > 10 ? '#10B981' : availableStock > 0 ? '#F59E0B' : '#EF4444' }}
              />
              <span className="text-xs" style={{ color: t.textSecondary }}>
                {availableStock > 10 ? 'Disponible' : availableStock > 0 ? `Solo ${availableStock} disponibles` : 'Sin stock'}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              disabled={!canAdd || availableStock === 0}
              className="w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                backgroundColor: added ? '#10B981' : (!canAdd || availableStock === 0) ? t.bgSection : profile.brandColor,
                color: (!canAdd || availableStock === 0) && !added ? t.textSecondary : '#fff',
                cursor: (!canAdd || availableStock === 0) ? 'not-allowed' : 'pointer',
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {added ? '¡Agregado al carrito!'
                : !canAdd && hasVariants ? 'Selecciona una opción'
                : availableStock === 0 ? 'Sin stock'
                : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

interface CartDrawerProps {
  cart: CartItem[];
  profile: SupplierProfile;
  t: ThemeTokens;
  onClose: () => void;
  onUpdateQty: (id: string, variantId: string | undefined, delta: number) => void;
  onCheckout: () => void;
}

function CartDrawer({ cart, profile, t, onClose, onUpdateQty, onCheckout }: CartDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    gsap.from(drawerRef.current, { x: '100%', duration: 0.48, ease: 'power3.out' });
    gsap.from(backdropRef.current, { opacity: 0, duration: 0.3 });
  });

  const handleClose = useCallback(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) { onClose(); return; }
    gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power2.in', onComplete: onClose });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.25 });
  }, [onClose]);

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const cartQty = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div ref={backdropRef} className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full sm:w-[400px] flex flex-col shadow-2xl"
        style={{ backgroundColor: t.bgCard }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: t.cardBorderColor }}>
          <span className="font-bold flex items-center gap-2" style={{ color: t.textPrimary }}>
            <ShoppingCart className="h-4 w-4" />
            Carrito ({cartQty})
          </span>
          <button onClick={handleClose} style={{ color: t.textSecondary }} className="hover:opacity-70 transition-opacity">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16" style={{ color: t.textSecondary }}>
              <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(({ product, qty, variantId, variantLabel }) => (
              <div key={`${product.id}-${variantId ?? ''}`} className="flex gap-3">
                <div
                  className="relative w-16 h-16 flex-shrink-0 overflow-hidden"
                  style={{ borderRadius: t.cardRadius, backgroundColor: t.bgSection }}
                >
                  <Image src={product.images?.[0] ?? product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1" style={{ color: t.textPrimary }}>{product.name}</p>
                  {variantLabel && <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>{variantLabel}</p>}
                  <p className="text-sm font-bold mt-0.5" style={{ color: profile.accentColor }}>${product.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1 mt-1.5 rounded-full w-fit overflow-hidden border" style={{ borderColor: t.cardBorderColor }}>
                    <button onClick={() => onUpdateQty(product.id, variantId, -1)} className="w-7 h-7 flex items-center justify-center hover:opacity-70" style={{ color: t.textSecondary }}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold" style={{ color: t.textPrimary }}>{qty}</span>
                    <button onClick={() => onUpdateQty(product.id, variantId, 1)} className="w-7 h-7 flex items-center justify-center hover:opacity-70" style={{ color: t.textSecondary }}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t px-5 py-5 space-y-3" style={{ borderColor: t.cardBorderColor }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: t.textSecondary }}>Total</span>
              <span className="text-2xl font-black" style={{ color: t.textPrimary }}>${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { handleClose(); setTimeout(onCheckout, 350); }}
              className="w-full py-3.5 rounded-full text-white font-bold text-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: profile.brandColor }}
            >
              Proceder al pago
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Store Footer ─────────────────────────────────────────────────────────────

function StoreFooter({ profile, t }: { profile: SupplierProfile; t: ThemeTokens }) {
  const footerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const cols = footerRef.current?.querySelectorAll('.footer-col');
    if (!cols?.length) return;
    gsap.from(cols, {
      y: 32, opacity: 0, stagger: 0.1, duration: 0.65, ease: 'power3.out',
      scrollTrigger: { trigger: footerRef.current, start: 'top 88%' },
    });
  }, { scope: footerRef });

  const hasSocials = profile.instagramUrl || profile.facebookUrl || profile.tiktokUrl || profile.storeConfig?.whatsappNumber;

  return (
    <footer ref={footerRef} className="border-t mt-16" style={{ backgroundColor: t.bgSection, borderColor: t.cardBorderColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="footer-col">
          {profile.logo ? (
            <div className="relative h-10 w-32 mb-4">
              <Image src={profile.logo} alt={profile.storeName} fill className="object-contain object-left" />
            </div>
          ) : (
            <p className="font-bold text-xl mb-4" style={{ color: t.textPrimary, fontFamily: t.fontHeadline, fontStyle: t.headlineStyle }}>
              {profile.storeName}
            </p>
          )}
          <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>{profile.description}</p>
        </div>

        {/* Contacto */}
        <div className="footer-col">
          <p className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: t.textPrimary }}>Contacto</p>
          <div className="space-y-2.5 text-sm" style={{ color: t.textSecondary }}>
            {profile.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 flex-shrink-0" />{profile.email}</p>}
            {profile.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 flex-shrink-0" />{profile.phone}</p>}
            {profile.address && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 flex-shrink-0" />{profile.address}</p>}
          </div>
        </div>

        {/* Redes sociales */}
        {hasSocials && (
          <div className="footer-col">
            <p className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: t.textPrimary }}>Síguenos</p>
            <div className="flex flex-wrap gap-3">
              {profile.instagramUrl && (
                <a href={`https://instagram.com/${profile.instagramUrl}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ backgroundColor: t.bgCard, border: `1px solid ${t.cardBorderColor}`, color: t.textPrimary }}
                >
                  <Instagram className="h-3.5 w-3.5" /> Instagram
                </a>
              )}
              {profile.facebookUrl && (
                <a href={`https://facebook.com/${profile.facebookUrl}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ backgroundColor: t.bgCard, border: `1px solid ${t.cardBorderColor}`, color: t.textPrimary }}
                >
                  <span className="text-[13px] font-black">f</span> Facebook
                </a>
              )}
              {profile.tiktokUrl && (
                <a href={`https://tiktok.com/@${profile.tiktokUrl}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ backgroundColor: t.bgCard, border: `1px solid ${t.cardBorderColor}`, color: t.textPrimary }}
                >
                  <span className="text-[11px] font-black">TT</span> TikTok
                </a>
              )}
              {profile.storeConfig?.whatsappNumber && (
                <a href={`https://wa.me/${profile.storeConfig.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-70"
                  style={{ backgroundColor: '#25D366', color: '#fff' }}
                >
                  <span className="text-[11px] font-black">WA</span> WhatsApp
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto" style={{ borderColor: t.cardBorderColor }}>
        <p className="text-xs" style={{ color: t.textMuted }}>© {new Date().getFullYear()} {profile.storeName}</p>
        {profile.showPoweredBy && (
          <p className="text-xs" style={{ color: t.textMuted }}>Powered by <span className="font-bold">MARIASCLUB™</span></p>
        )}
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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
  const productsRef = useRef<HTMLElement>(null);

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
        <p style={{ fontFamily: 'system-ui', color: '#888' }}>Cargando tienda…</p>
      </div>
    );
  }

  const t = getTheme(profile.storeTheme);
  const cardStyle = profile.cardStyle ?? 'rounded';
  const activeProducts = inventory.filter((p) => p.active && p.stock > 0);
  const categories = Array.from(new Set(activeProducts.map((p) => p.category)));
  const filtered = activeProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const addToCart = useCallback((product: InventoryProduct, variantId?: string, variantLabel?: string) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id && i.variantId === variantId);
      if (ex) return prev.map((i) =>
        i.product.id === product.id && i.variantId === variantId ? { ...i, qty: i.qty + 1 } : i,
      );
      return [...prev, { product, qty: 1, variantId, variantLabel }];
    });
    setSelectedProduct(null);
  }, []);

  const updateCartQty = (id: string, variantId: string | undefined, delta: number) => {
    setCart((prev) =>
      prev.map((i) => i.product.id === id && i.variantId === variantId ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0),
    );
  };

  const cartQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const annBg = profile.announcementBg || profile.brandColor;

  return (
    <div style={{ backgroundColor: t.bgPage, color: t.textPrimary, fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>

      {/* Announcement Bar */}
      {profile.announcementText && (
        <AnnouncementBar text={profile.announcementText} bg={annBg} />
      )}

      {/* Header */}
      <StoreHeader
        profile={profile}
        t={t}
        categories={categories}
        activeCategory={filterCat}
        onCategoryClick={setFilterCat}
        cartQty={cartQty}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* Hero */}
      <StoreHero profile={profile} t={t} onCtaClick={scrollToProducts} />

      {/* Category Filter */}
      <CategoryFilter
        profile={profile}
        t={t}
        categories={categories}
        activeCategory={filterCat}
        search={search}
        onCategoryClick={setFilterCat}
        onSearchChange={setSearch}
      />

      {/* Products */}
      <main ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Section heading */}
        <div className="mb-8 flex items-baseline justify-between">
          <h2
            className="text-2xl font-bold"
            style={{ color: t.textPrimary, fontFamily: t.fontHeadline, fontStyle: t.headlineStyle }}
          >
            {filterCat || 'Todos los productos'}
          </h2>
          <span className="text-sm" style={{ color: t.textSecondary }}>{filtered.length} artículos</span>
        </div>

        {/* Mobile search */}
        <div className="relative mb-6 sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: t.textSecondary }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos…"
            className="w-full rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ backgroundColor: t.inputBg, border: `1px solid ${t.cardBorderColor}`, color: t.textPrimary }}
          />
        </div>

        <ProductGrid
          products={filtered}
          profile={profile}
          t={t}
          cardStyle={cardStyle}
          onViewDetail={setSelectedProduct}
          onAddToCart={(p) => addToCart(p)}
        />
      </main>

      {/* Footer */}
      <StoreFooter profile={profile} t={t} />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          profile={profile}
          t={t}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          profile={profile}
          t={t}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateCartQty}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}

      {/* Checkout */}
      {checkoutOpen && (
        <SupplierCheckoutModal
          cart={cart}
          profile={profile}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={() => { setCart([]); setCheckoutOpen(false); }}
        />
      )}
    </div>
  );
}
