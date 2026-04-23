'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, Heart, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { Logo } from '@/components/brand/Logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';

gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Nosotros', href: '/about' },
  { label: 'Tienda', href: '/shop' },
  { label: 'Revista', href: '/journal' },
  { label: 'Contacto', href: '/contact' },
];

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  proveedor: 'Proveedor',
  transportista: 'Transportista',
  repartidor: 'Repartidor',
  cliente: 'Mi Cuenta',
};

const rolePortal: Record<string, string> = {
  admin: '/admin',
  proveedor: '/supplier',
  transportista: '/transporter',
  repartidor: '/repartidor',
  cliente: '/shop',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalQty } = useCart();
  const { user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/login');
  };

  /* ── Mount entrance + scroll hide/show ───────────────────── */
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      gsap.from(headerRef.current, {
        y: -60,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.1,
      });
    }

    // Scroll-aware hide/show
    let lastY = 0;
    const header = headerRef.current;
    ScrollTrigger.create({
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (prefersReducedMotion) return;
        const currentY = self.scroll();
        if (currentY > lastY && currentY > 120) {
          gsap.to(header, { y: '-110%', duration: 0.35, ease: 'power2.in', overwrite: true });
        } else {
          gsap.to(header, { y: '0%', duration: 0.4, ease: 'power2.out', overwrite: true });
        }
        lastY = currentY;
      },
    });
  }, { scope: headerRef });

  /* ── Nav link hover underline ─────────────────────────────── */
  const handleNavEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const line = e.currentTarget.querySelector('.nav-underline');
    if (!line) return;
    gsap.to(line, { scaleX: 1, duration: 0.3, ease: 'power2.out', transformOrigin: 'left' });
  };
  const handleNavLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const line = e.currentTarget.querySelector('.nav-underline');
    if (!line) return;
    gsap.to(line, { scaleX: 0, duration: 0.2, ease: 'power2.in', transformOrigin: 'right' });
  };

  /* ── Mobile menu open stagger ─────────────────────────────── */
  const handleSheetChange = (open: boolean) => {
    setMobileOpen(open);
    if (open && mobileNavRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;
      const links = mobileNavRef.current.querySelectorAll('a');
      gsap.from(links, {
        x: 30,
        opacity: 0,
        stagger: 0.07,
        duration: 0.35,
        ease: 'power2.out',
        delay: 0.05,
      });
    }
  };

  return (
    <>
    <header ref={headerRef} className="fixed top-8 left-0 right-0 z-50 bg-white border-b border-[#E0E0E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Logo size="sm" variant="dark" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onMouseEnter={handleNavEnter}
                onMouseLeave={handleNavLeave}
                className={`relative text-[11px] font-body font-medium tracking-[0.1em] uppercase transition-colors pb-0.5 ${
                  isActive ? 'text-[#222222]' : 'text-[#555555] hover:text-[#222222]'
                }`}
              >
                {link.label}
                <span
                  className="nav-underline absolute bottom-0 left-0 right-0 h-[1px] bg-[#222222]"
                  style={{ transform: isActive ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left' }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            aria-label="Buscar"
            className="w-9 h-9 hidden sm:flex items-center justify-center text-[#333333] hover:text-[#222222] hover:bg-[#F2F2F2] transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            aria-label="Lista de deseos"
            className="w-9 h-9 hidden sm:flex items-center justify-center text-[#333333] hover:text-[#222222] hover:bg-[#F2F2F2] transition-colors"
          >
            <Heart className="h-4 w-4" />
          </button>

          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Mi cuenta"
                className="w-9 h-9 flex items-center justify-center text-[#00C9B1] hover:text-[#00a898] hover:bg-[#F2F2F2] transition-colors"
              >
                <User className="h-4 w-4" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-10 w-52 bg-white border border-[#E0E0E0] shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-[#F2F2F2]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#828282]">{roleLabels[user.role]}</p>
                    <p className="text-xs text-[#222222] truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href={rolePortal[user.role]}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-medium tracking-wide text-[#555555] hover:text-[#222222] hover:bg-[#F9F9F9] transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" /> Mi Portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-[11px] font-medium tracking-wide text-[#C0392B] hover:bg-[#FFF5F5] transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Mi cuenta"
              className="w-9 h-9 hidden sm:flex items-center justify-center text-[#333333] hover:text-[#222222] hover:bg-[#F2F2F2] transition-colors"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Carrito"
            className="relative w-9 h-9 inline-flex items-center justify-center text-[#333333] hover:text-[#222222] hover:bg-[#F2F2F2] transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalQty > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#222222] text-white text-[9px] font-black h-3.5 w-3.5 flex items-center justify-center">
                {totalQty}
              </span>
            )}
          </button>

          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center h-8 px-5 ml-2 text-[11px] font-bold font-body tracking-[0.08em] uppercase bg-[#222222] text-white hover:bg-[#000000] transition-colors"
          >
            Tienda
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={handleSheetChange}>
            <SheetTrigger>
              <button
                className="md:hidden w-9 h-9 inline-flex items-center justify-center text-[#333333] hover:text-[#222222]"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white border-l border-[#E0E0E0]">
              <div className="flex flex-col h-full pt-6">
                <div className="flex items-center justify-between mb-10 px-2">
                  <Logo size="sm" variant="dark" />
                  <button onClick={() => handleSheetChange(false)} className="text-[#555555] hover:text-[#222222]">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav ref={mobileNavRef} className="flex flex-col">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => handleSheetChange(false)}
                      className="px-4 py-3.5 text-[11px] font-medium tracking-[0.1em] uppercase text-[#555555] hover:text-[#222222] border-b border-[#F2F2F2] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto px-4 pb-8 space-y-2">
                  <button
                    onClick={() => { handleSheetChange(false); setCartOpen(true); }}
                    className="flex w-full h-11 border border-[#E0E0E0] text-[#555555] text-[11px] font-medium tracking-[0.08em] uppercase items-center justify-center gap-2 hover:border-[#222222] hover:text-[#222222] transition-colors"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Carrito ({totalQty})
                  </button>
                  {user ? (
                    <div className="space-y-1.5">
                      <div className="px-3 py-2 bg-[#F9F9F9] border border-[#E0E0E0]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#828282]">{roleLabels[user.role]}</p>
                        <p className="text-xs text-[#222222] truncate">{user.email}</p>
                      </div>
                      <Link
                        href={rolePortal[user.role]}
                        onClick={() => handleSheetChange(false)}
                        className="flex w-full h-10 border border-[#00C9B1] text-[#00C9B1] text-[11px] font-medium tracking-[0.08em] uppercase items-center justify-center gap-2 hover:bg-[#F0FFFE] transition-colors"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" /> Mi Portal
                      </Link>
                      <button
                        onClick={() => { handleSheetChange(false); handleLogout(); }}
                        className="flex w-full h-10 border border-[#C0392B] text-[#C0392B] text-[11px] font-medium tracking-[0.08em] uppercase items-center justify-center gap-2 hover:bg-[#FFF5F5] transition-colors"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => handleSheetChange(false)}
                      className="flex w-full h-11 border border-[#E0E0E0] text-[#555555] text-[11px] font-medium tracking-[0.08em] uppercase items-center justify-center gap-2 hover:border-[#222222] hover:text-[#222222] transition-colors"
                    >
                      <User className="h-3.5 w-3.5" /> Mi Cuenta
                    </Link>
                  )}
                  <Link
                    href="/shop"
                    className="flex w-full h-11 bg-[#222222] text-white text-[11px] font-bold tracking-[0.1em] uppercase items-center justify-center hover:bg-black transition-colors"
                  >
                    Ver Tienda
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>

    <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
