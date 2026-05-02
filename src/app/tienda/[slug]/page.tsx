'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Search, Phone, Mail, MapPin, ShoppingCart, Plus, X, Minus } from 'lucide-react';
import { SupplierProfile, InventoryProduct } from '@/lib/supplier-context';
import { SupplierCheckoutModal } from '@/components/supplier/SupplierCheckoutModal';
import { getSuppliers } from '@/lib/suppliers-store';
import { use } from 'react';

interface CartItem { product: InventoryProduct; qty: number; }

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

  const addToCart = (product: InventoryProduct) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      if (ex) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((i) => i.product.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const cartQty = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: profile.brandColor }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Store name */}
          <div className="flex items-center gap-3">
            {profile.logo ? (
              <div className="relative h-9 w-28">
                <Image src={profile.logo} alt={profile.storeName} fill className="object-contain object-left" />
              </div>
            ) : (
              <span className="text-white font-bold text-xl tracking-tight">{profile.storeName}</span>
            )}
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-white/90 text-sm">
            <button onClick={() => setFilterCat('')} className="hover:text-white transition-colors font-medium">Inicio</button>
            {categories.slice(0, 4).map((cat) => (
              <button key={cat} onClick={() => setFilterCat(cat)} className="hover:text-white transition-colors">{cat}</button>
            ))}
          </nav>

          {/* Cart */}
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
        {/* Search + category filter */}
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
            {filtered.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 25vw" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-lg font-black mb-3" style={{ color: profile.accentColor }}>${p.price.toFixed(2)}</p>
                  <button
                    onClick={() => addToCart(p)}
                    className="w-full py-2 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: profile.brandColor }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Contact footer */}
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
                cart.map(({ product, qty }) => (
                  <div key={product.id} className="flex gap-3">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                      <Image src={product.image} alt={product.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color: profile.accentColor }}>${product.price.toFixed(2)}</p>
                      <div className="flex items-center gap-1 mt-1.5 border border-gray-200 rounded-lg w-fit">
                        <button onClick={() => updateCartQty(product.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center text-xs font-bold">{qty}</span>
                        <button onClick={() => updateCartQty(product.id, 1)} className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50"><Plus className="h-3 w-3" /></button>
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
