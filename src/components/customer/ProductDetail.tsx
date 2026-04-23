'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Product } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingBag, ChevronLeft, ChevronRight, ChevronRight as BreadcrumbArrow,
  Truck, RotateCcw, CreditCard, ShieldCheck, Star,
  Shirt, Droplets, Award,
} from 'lucide-react';

interface ProductDetailProps {
  product: Product;
}

const trustBadges = [
  { icon: ShieldCheck, label: 'Trusted Quality', sub: 'Verified products' },
  { icon: Truck, label: 'Real Time Tracking', sub: 'Live delivery updates' },
  { icon: CreditCard, label: 'Secure Payments', sub: 'Encrypted checkout' },
  { icon: RotateCcw, label: 'Easy Returns', sub: '30-day policy' },
];

const specsData = [
  { icon: Shirt, label: 'Material', value: '100% Premium Cotton · Breathable weave' },
  { icon: Droplets, label: 'Care', value: 'Machine wash cold · Tumble dry low' },
  { icon: Award, label: 'Warranty', value: '12-month quality guarantee' },
];

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? '');
  const [isAdvance, setIsAdvance] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const router = useRouter();

  const galleryRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleOrderNow = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    router.push('/checkout');
  };

  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.from(galleryRef.current, { opacity: 0, x: -30, duration: 0.8, ease: 'power2.out' });
    gsap.from(infoRef.current, { opacity: 0, x: 30, duration: 0.8, ease: 'power2.out', delay: 0.1 });
  }, []);

  const total = isAdvance ? product.price * 0.5 : product.price * quantity;
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-[11px] font-body text-[#8F8780]">
          <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Home</Link>
          <BreadcrumbArrow className="h-3 w-3" />
          <Link href="/shop" className="hover:text-[#0A0A0A] transition-colors capitalize">{product.category.replace(/-/g, ' ')}</Link>
          <BreadcrumbArrow className="h-3 w-3" />
          <span className="text-[#0A0A0A] font-medium line-clamp-1">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-[1fr_480px] gap-8 lg:gap-14 items-start">

          {/* LEFT: Image Gallery */}
          <div ref={galleryRef} data-flip-id={product.id}>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#F0EEEB]">
              <Image
                src={product.images[selectedImage] ?? product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-300"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
              />

              {/* Badge */}
              {product.badge && (
                <span className={`absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ${
                  product.badge === 'sale' ? 'bg-[#C0392B] text-white' :
                  product.badge === 'new' ? 'bg-[#0A0A0A] text-white' :
                  'bg-[#00C9B1] text-white'
                }`}>
                  {product.badge === 'sale' && discount ? `-${discount}%` : product.badge}
                </span>
              )}

              {/* Navigation arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    onClick={() => setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    onClick={() => setSelectedImage((i) => (i + 1) % product.images.length)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all`}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderColor: selectedImage === i ? '#0A0A0A' : 'transparent',
                    }}
                  >
                    <Image src={src} alt={`View ${i + 1}`} fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div ref={infoRef} className="flex flex-col gap-5 lg:sticky lg:top-24">

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-[#F97316] text-[#F97316]' : 'text-[#D9D5CF]'}`} />
                ))}
              </div>
              <span className="text-xs text-[#8F8780] font-body">(24 reviews)</span>
            </div>

            {/* Title + Price */}
            <div>
              <p className="text-[10px] font-body font-bold tracking-[0.25em] uppercase text-[#8F8780] mb-1.5">
                {product.subcategory}
              </p>
              <h1 className="font-display text-3xl sm:text-[2.25rem] font-bold text-[#0A0A0A] leading-tight mb-4">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-body font-black text-[#0A0A0A]">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-base text-[#B0A99F] line-through font-body">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold font-body text-white bg-[#C0392B] px-1.5 py-0.5 rounded">
                      -{discount}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <Separator className="bg-[#EDEBE8]" />

            {/* Color selector */}
            <div>
              <p className="text-[11px] font-body font-semibold uppercase tracking-[0.15em] text-[#6B6359] mb-2.5">
                Color — <span className="text-[#0A0A0A] normal-case font-medium">{selectedColor}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    title={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color.name
                        ? 'border-[#0A0A0A] scale-110 shadow-md'
                        : 'border-[#EDEBE8] hover:border-[#6B6359]'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            {product.sizes.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[11px] font-body font-semibold uppercase tracking-[0.15em] text-[#6B6359]">
                    Size — <span className="text-[#0A0A0A] normal-case font-medium">{selectedSize || 'Select a size'}</span>
                  </p>
                  <button className="text-[10px] font-body text-[#8F8780] underline hover:text-[#0A0A0A] transition-colors">
                    Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-9 min-w-[40px] px-3 text-sm font-body font-medium rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                          : 'border-[#EDEBE8] text-[#6B6359] hover:border-[#0A0A0A] hover:text-[#0A0A0A]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F0EEEB] rounded-xl">
              <button
                onClick={() => setIsAdvance(false)}
                className={`py-3 px-3 rounded-lg text-xs font-body font-semibold transition-all text-center ${
                  !isAdvance ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B6359] hover:text-[#0A0A0A]'
                }`}
              >
                Full Payment
                <div className="text-sm font-black mt-0.5">${(product.price * quantity).toFixed(2)}</div>
              </button>
              <button
                onClick={() => setIsAdvance(true)}
                className={`py-3 px-3 rounded-lg text-xs font-body font-semibold transition-all text-center ${
                  isAdvance ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B6359] hover:text-[#0A0A0A]'
                }`}
              >
                Anticipo (50%)
                <div className="text-sm font-black text-[#00C9B1] mt-0.5">${(product.price * 0.5).toFixed(2)} now</div>
              </button>
            </div>

            {/* Quantity + Add to cart row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#EDEBE8] rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#6B6359] hover:bg-[#F7F6F5] transition-colors text-xl font-light"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-body font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-[#6B6359] hover:bg-[#F7F6F5] transition-colors text-xl font-light"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-10 rounded-xl border text-sm font-semibold font-body transition-all duration-300 flex items-center justify-center gap-2 ${
                  added
                    ? 'border-[#00C9B1] bg-[#00C9B1] text-white'
                    : 'border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                {added ? '¡Agregado!' : 'Agregar al carrito'}
              </button>
            </div>

            {/* Primary CTA */}
            <button
              onClick={handleOrderNow}
              className="w-full h-12 bg-[#0A0A0A] text-white rounded-xl text-sm font-bold font-body hover:bg-[#00C9B1] transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isAdvance
                ? `Pagar $${(product.price * 0.5).toFixed(2)} de anticipo`
                : `Ordenar ahora — $${total.toFixed(2)}`}
            </button>

            <Separator className="bg-[#EDEBE8]" />

            {/* Material / Care / Warranty specs */}
            <div className="space-y-3">
              {specsData.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F0EEEB] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-[#6B6359]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-body font-bold uppercase tracking-wider text-[#0A0A0A]">{label}</p>
                    <p className="text-xs font-body text-[#6B6359] mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-[#F7F6F5] rounded-xl p-4">
              <p className="text-xs font-body text-[#6B6359] leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>

        {/* Trust badges row */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trustBadges.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-[#EDEBE8] text-center hover:border-[#00C9B1] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#F0EEEB] flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#0A0A0A]" />
              </div>
              <div>
                <p className="text-xs font-body font-bold text-[#0A0A0A]">{label}</p>
                <p className="text-[10px] font-body text-[#8F8780] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
