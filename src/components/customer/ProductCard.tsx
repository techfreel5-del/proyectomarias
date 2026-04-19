'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '@/lib/mock-data';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'editorial';
}

const badgeStyles: Record<string, string> = {
  new: 'bg-[#222222] text-white',
  trending: 'bg-[#222222] text-white',
  sale: 'bg-[#E4002B] text-white',
};

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);
  const { addItem } = useCart();

  useGSAP(() => {
    const card = cardRef.current;
    const actions = actionsRef.current;
    if (!card || !actions) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.set(actions, { y: 8, opacity: 0 });

    const onEnter = () => {
      gsap.to(actions, { y: 0, opacity: 1, duration: 0.2, ease: 'power2.out' });
    };
    const onLeave = () => {
      gsap.to(actions, { y: 8, opacity: 0, duration: 0.18, ease: 'power2.in' });
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: cardRef });

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article
      ref={cardRef}
      data-flip-id={product.id}
      className="group bg-white"
    >
      {/* Image container — portrait 3:4 */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F2F2F2] mb-3">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-0.5 ${badgeStyles[product.badge]}`}>
            {product.badge === 'sale' && discount ? `-${discount}%` : product.badge}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-2.5 right-2.5 w-7 h-7 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Guardar"
        >
          <Heart className={`h-3.5 w-3.5 transition-colors ${saved ? 'fill-[#E4002B] text-[#E4002B]' : 'text-[#555555]'}`} />
        </button>

        {/* Add to cart — slides up on hover */}
        <div ref={actionsRef} className="absolute bottom-0 left-0 right-0">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="w-full h-10 bg-[#222222] text-white text-[11px] font-bold tracking-[0.08em] uppercase hover:bg-[#000000] transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Agregar al Carrito
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <Link
          href={`/product/${product.slug}`}
          className="text-sm font-body font-normal text-[#222222] hover:underline line-clamp-1 mb-1 block"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          <span className={`text-sm font-body ${product.originalPrice ? 'text-[#E4002B] font-bold' : 'text-[#222222]'}`}>
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-[#828282] line-through font-body">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {product.colors.length > 1 && (
          <div className="flex items-center gap-1 mt-2">
            {product.colors.slice(0, 4).map((c) => (
              <div
                key={c.name}
                title={c.name}
                className="w-3 h-3 border border-[#E0E0E0] cursor-pointer hover:scale-125 transition-transform"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] text-[#828282]">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
