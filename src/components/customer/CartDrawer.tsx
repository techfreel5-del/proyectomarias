'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQty, total, totalQty } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white border-l border-[#E0E0E0] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0E0E0]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#222222]" />
            <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#222222]">
              Carrito ({totalQty})
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#555555] hover:text-[#222222] transition-colors"
            aria-label="Cerrar carrito"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-20">
              <ShoppingBag className="h-10 w-10 text-[#D9D5CF]" />
              <p className="text-sm font-medium text-[#555555]">Tu carrito está vacío</p>
              <button
                onClick={onClose}
                className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#222222] underline underline-offset-2"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            items.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-3.5">
                <div className="relative w-20 h-24 flex-shrink-0 bg-[#F2F2F2] overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-[#222222] line-clamp-2 mb-0.5">
                    {product.name}
                  </p>
                  {product.sizes.length > 0 && (
                    <p className="text-xs text-[#828282]">
                      {product.colors[0]?.name ?? ''}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2.5">
                    {/* Qty controls */}
                    <div className="flex items-center border border-[#E0E0E0]">
                      <button
                        onClick={() => updateQty(product.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-[#555555] hover:bg-[#F2F2F2] transition-colors"
                        aria-label="Reducir cantidad"
                      >
                        {qty === 1
                          ? <Trash2 className="h-3 w-3 text-[#E4002B]" />
                          : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-[#222222]">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(product.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#555555] hover:bg-[#F2F2F2] transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#222222]">
                        ${(product.price * qty).toFixed(2)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs text-[#828282] line-through">
                          ${(product.originalPrice * qty).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#E0E0E0] px-5 py-5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-body uppercase tracking-[0.08em] text-[#555555]">Subtotal</span>
              <span className="text-base font-bold text-[#222222]">${total.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-[#828282]">Envío calculado al finalizar la compra.</p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex w-full h-12 bg-[#222222] text-white text-[11px] font-bold tracking-[0.1em] uppercase items-center justify-center hover:bg-black transition-colors"
            >
              Proceder al Pago
            </Link>
            <button
              onClick={onClose}
              className="w-full h-10 border border-[#E0E0E0] text-[11px] font-medium text-[#555555] uppercase tracking-[0.06em] hover:border-[#222222] hover:text-[#222222] transition-colors"
            >
              Continuar Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
