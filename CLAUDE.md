@AGENTS.md

---

# MARIASCLUB — Contexto del Proyecto

Plataforma ecommerce + logística multi-nicho para Zamora, Michoacán, México. Enteramente en español.

## Stack

- **Next.js 16.2.2**, React 19, TypeScript
- **Tailwind CSS v4** — configuración via `@theme` en `globals.css` (NO `tailwind.config.ts`)
- **Shadcn UI** con `@base-ui/react` (NO Radix UI)
- **GSAP 3.x** — ScrollTrigger, Flip, Draggable, Observer, SplitText

## Reglas arquitectónicas críticas

- Shadcn Button usa `@base-ui/react` — NO soporta prop `asChild`. Usar Links/anchors con estilos directamente.
- GSAP imports: usar `gsap/dist/ScrollTrigger` etc. (no `gsap/ScrollTrigger`) para evitar errores de casing en Windows
- GSAP imports van en `src/lib/gsap.ts` con directiva `'use client'`
- Accordion: usa `@base-ui/react/accordion` — API: `AccordionPrimitive.Root`, `.Item`, `.Trigger`, `.Header`, `.Panel`
- Filter logic en CatalogGrid usa `tabMap` para traducir tabs en español → valores de badge en inglés
- CartDrawer state (`cartOpen`) vive en Header, pasado como prop a CartDrawer
- Header return está envuelto en `<>...</>` Fragment para acomodar `<CartDrawer>` como sibling
- Logo: tamaños válidos son `'sm' | 'lg' | 'xl'` — NO existe `'md'`

## Brand

- **Colores:** brand-black `#0A0A0A`, brand-teal `#00C9B1`, brand-red `#C0392B` (logo M)
- **Nichos:** Moda, Hogar y Cocina, Deportes y Fitness, Electrónica

## Datos mock

- `src/lib/mock-data.ts` — 30 productos (IDs: f001–f008, h001–h008, s001–s007, e001–e007), 5 órdenes (ORD-001 a ORD-005), 6 zonas de entrega (z1–z6), 12 productos POS
- `src/lib/journal-data.ts` — 6 artículos con slugs: modern-wardrobe, seasonal-essentials, minimal-living, performance-edit, tech-for-you, morning-rituals
- Status de órdenes son enums en inglés (pending/processing/shipped/delivered/returned) — display usa `statusLabels` map

## Animaciones GSAP — COMPLETAS (Phases 1–3)

HeroSection auto-play, Header scroll hide/show + nav underlines, AboutContent SplitText, JournalGrid char reveal, ArticleContent parallax, ContactContent entrance, NewsletterBanner SplitText, CategorySplit panel slide, FAQ stagger, Footer columns, CheckoutStepper steps, TrackingTimeline, OrderLookupForm mount + focus ring.

**Regla universal en todos lados:**
```ts
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) return;
```

## Rutas — TODAS COMPLETAS (Phase 1 UI)

### Customer-facing
- `/` — Homepage
- `/shop` — Todos los productos (CatalogGrid con tabs en español)
- `/shop/[category]` — fashion / home-kitchen / sports-fitness / electronics
- `/product/[slug]` — Detalle de producto
- `/checkout` — Stepper 3 pasos
- `/tracking` — Búsqueda de orden
- `/tracking/[orderId]` — Timeline animado
- `/about`, `/journal`, `/journal/[slug]`, `/contact`
- `/login`, `/returns`, `/faq`, `/size-guide`, `/privacy`, `/terms`

### Portales operativos
- `/supplier` — Dashboard proveedor
- `/transporter` — Escáner QR móvil
- `/transporter/delivery/[id]` — Prueba de entrega
- `/repartidor` — App de entrega local
- `/admin` — Vista general admin
- `/admin/pricing`, `/admin/zones`, `/admin/orders`, `/admin/reports`

## Deployment

- **GitHub:** https://github.com/techfreel5-del/proyectomarias (rama: `main`)
- **Vercel:** https://proyectomarias.vercel.app/
- Auto-deploy activado: cada `git push` a `main` dispara nuevo deploy (~2 min)

**Flujo de trabajo:**
```bash
# Hacer cambios, luego:
git add .
git commit -m "descripción"
git push
# Vercel despliega automáticamente
```

## Estado actual — Phase 1 COMPLETA ✅

UI Phase 1 al 100%: todas las rutas, animaciones GSAP, traducción al español completa, en producción.

## Phase 2 — LO QUE SIGUE (no iniciado)

Al iniciar una sesión nueva, recordar al usuario que Phase 2 es lo que sigue y ofrecer continuar.

### Prioridad sugerida:
1. **Prisma + Supabase** (base de datos — gratis, compatible con Vercel)
2. **NextAuth.js** — login real con roles: admin / supplier / transporter / repartidor / customer
3. **Carrito persistente** — reemplazar mock en CartDrawer
4. **Checkout real con Stripe** (o Conekta para MXN)
5. **Panel admin con datos reales** — reemplazar mock-data.ts
