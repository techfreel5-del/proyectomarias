# MARIASCLUB™ — Documento de Proyecto

> Última actualización: Abril 2026
> Estado actual: **Fase 1 completada** (UI/prototipo funcional) · **Fase 2 pendiente** (backend + auth + pagos)

---

## 1. ¿QUÉ ES MARIASCLUB?

MARIASCLUB™ es una **plataforma de comercio electrónico multi-nicho con logística propia**, con sede en Zamora, Michoacán, México. No es una tienda convencional: combina una experiencia de compra para el cliente final con un sistema de orquestación logística completo — proveedores, transportistas, repartidores y administradores tienen sus propios paneles dentro de la misma plataforma.

**Propuesta de valor central:**
- Catálogo curado en 4 categorías: Moda, Hogar & Cocina, Deportes & Fitness, Electrónica
- Entrega propia en 6 zonas de Zamora y municipios aledaños (Jacona, Jiquilpan, Tangancícuaro)
- Tracking en tiempo real desde la confirmación hasta la entrega en puerta
- Filosofía editorial: "Fewer, better things. Delivered with care."

---

## 2. MODELO DE NEGOCIO

```
PROVEEDOR          PLATAFORMA          CLIENTE
(supplier)  ──►  MARIASCLUB™  ──►  (customer)
                      │
              TRANSPORTE PROPIO
              (transporter + repartidor)
```

**Flujo de una orden:**
1. El cliente navega el catálogo y hace checkout
2. La orden entra al sistema y el proveedor la confirma en su dashboard
3. Un transportista recoge el paquete (escanea QR, firma recolección)
4. El repartidor local hace la última milla y captura prueba de entrega (foto + firma + GPS)
5. El cliente puede rastrear cada paso en `/tracking/[orderId]`

**Roles de usuario:**
| Rol | Descripción | URL |
|-----|-------------|-----|
| `customer` | Comprador final | `/`, `/shop`, `/product`, `/checkout`, `/tracking` |
| `supplier` | Proveedor de producto | `/supplier` |
| `transporter` | Recolector / transportista | `/transporter` |
| `repartidor` | Entregador última milla | `/repartidor` |
| `admin` | Operador de plataforma | `/admin` |

---

## 3. STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 16.2.2 (App Router, React 19) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS v4 — configuración vía `@theme` en `globals.css` (sin `tailwind.config.ts`) |
| **Componentes UI** | Shadcn UI con `@base-ui/react` (NO Radix — importante: no soporta `asChild`) |
| **Animaciones** | GSAP 3.x — ScrollTrigger, SplitText, Flip, Draggable, Observer |
| **Fuentes** | Inter (body), Playfair Display (display utility) — Google Fonts vía `next/font` |
| **Datos actuales** | Mock data en `src/lib/mock-data.ts` y `src/lib/journal-data.ts` |
| **Backend (pendiente)** | Prisma + PostgreSQL |
| **Auth (pendiente)** | NextAuth.js con roles |
| **Pagos (pendiente)** | Stripe o Conekta (MXN) |
| **Plataforma** | Windows 11, Node.js, dev en `localhost:3000` |

**Notas de arquitectura críticas:**
- Imports GSAP: usar `gsap/dist/ScrollTrigger` (no `gsap/ScrollTrigger`) — evita errores de casing en Windows
- Todos los imports GSAP van en `src/lib/gsap.ts` con directiva `'use client'`
- Tailwind v4: tokens de marca en `@theme inline {}` dentro de `globals.css`
- `--radius: 0` en todo el proyecto (estilo editorial cuadrado, sin bordes redondeados)

---

## 4. SISTEMA DE DISEÑO

### Identidad visual
La estética es **editorial minimalista** inspirada en H&M/BLOCKHAUS — limpia, sin decoración superflua, fotografía de producto como protagonista.

### Paleta de colores
| Token | Hex | Uso |
|-------|-----|-----|
| `brand-black` | `#0A0A0A` | Fondo oscuro, textos principales |
| `brand-teal` | `#00C9B1` | Acento principal, highlights, CTAs secundarios |
| `brand-red` | `#C0392B` | Logo M, badges de sale, badge de hero |
| `#222222` | — | Textos en fondos blancos, botones UI |
| `#FAF9F8` / `#F2F2F2` | — | Fondos de sección, fondos de cards |

### Tipografía
| Variable | Fuente | Uso |
|----------|--------|-----|
| `--font-body` | Inter | Todo el UI — cuerpo, títulos, botones |
| `--font-display` | Playfair Display | Clase utilitaria `.font-display`, disponible pero no dominante |

**Convenciones tipográficas:**
- Navegación: ALL CAPS, `tracking-[0.1em]`, `text-[11px]`
- Sección labels: ALL CAPS, `tracking-[0.25em]`, `text-[10px]`, color muted `#828282`
- Section headers: bold uppercase con `letter-spacing: -0.02em` (estilo BLOCKHAUS)
- Precios en sale: rojo `#E4002B`, precio original tachado en gris

### Botones
```
Primario:  bg-[#222222] text-white — cuadrado, sin border-radius
Secundario: border border-[#222222] text-[#222222] — ghost cuadrado
CTA hero:  bg-white text-[#222222] — sobre imagen
```

### Animaciones GSAP (sistema definido)
- **Ease editorial:** `power3.out`, `power4.out`, `expo.out` — sin bounces en scroll
- **Micro-interacciones UI:** `back.out(1.7)` solo en confirmaciones (success, step completion)
- **ScrollTrigger:** `start: 'top 80–88%'` estándar
- **prefers-reduced-motion** respetado en 100% de los componentes

---

## 5. ARQUITECTURA DE ARCHIVOS

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── layout.tsx                # Root layout (Header, Footer, AnnouncementBar)
│   ├── globals.css               # Tailwind v4 config + design tokens
│   ├── shop/
│   │   ├── page.tsx              # Catálogo general
│   │   └── [category]/page.tsx   # Catálogo por categoría
│   ├── product/[slug]/page.tsx   # Detalle de producto (30 slugs)
│   ├── checkout/page.tsx         # Checkout 3 pasos
│   ├── tracking/
│   │   ├── page.tsx              # Formulario de búsqueda
│   │   └── [orderId]/page.tsx    # Timeline animado (ORD-001 a ORD-005)
│   ├── about/page.tsx
│   ├── journal/
│   │   ├── page.tsx              # Grid de artículos
│   │   └── [slug]/page.tsx       # Artículo individual (6 slugs)
│   ├── contact/
│   │   ├── page.tsx
│   │   └── ContactForm.tsx       # 'use client' — con success animation GSAP
│   ├── faq/
│   │   ├── page.tsx
│   │   └── FAQContent.tsx        # 'use client' — accordion + stagger GSAP
│   ├── returns/page.tsx
│   ├── size-guide/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── supplier/page.tsx
│   ├── transporter/
│   │   ├── page.tsx              # QR scanner shell
│   │   └── delivery/[id]/page.tsx
│   ├── repartidor/page.tsx
│   └── admin/
│       ├── page.tsx              # Overview + AdminSidebar
│       ├── pricing/page.tsx
│       └── zones/page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # 'use client' — sticky, scroll-hide, nav underlines GSAP
│   │   ├── Footer.tsx            # 'use client' — columnas stagger GSAP
│   │   ├── AnnouncementBar.tsx   # Marquee CSS
│   │   └── SmoothScrollProvider.tsx
│   ├── brand/
│   │   └── Logo.tsx              # 'use client' — SVG M animado (draw-on)
│   ├── customer/
│   │   ├── HeroSection.tsx       # Auto-play 5s, SplitText, progress bar
│   │   ├── FeaturedProducts.tsx  # "New Arrival" — header con hr + 3-col grid
│   │   ├── CategoryStrips.tsx    # "Collection Feature" — split 40/60 con carousel
│   │   ├── TrendReport.tsx       # "Best Seller" — header con hr + 3-col grid
│   │   ├── CategorySplit.tsx     # Dos paneles MENS/WOMENS full-width
│   │   ├── NewsletterBanner.tsx  # SplitText chars en título
│   │   ├── TrackingPreview.tsx   # Preview de rastreo en homepage
│   │   ├── ProductCard.tsx       # Card 3:4, hover Add to Bag, GSAP
│   │   ├── CatalogGrid.tsx       # Grid con filtros
│   │   ├── ProductDetail.tsx     # Galería + info, GSAP entrance
│   │   ├── CheckoutStepper.tsx   # 3 pasos, GSAP step transitions
│   │   ├── TrackingTimeline.tsx  # Timeline animado
│   │   ├── AboutContent.tsx      # 'use client' — SplitText + stats + ScrollTrigger
│   │   ├── JournalGrid.tsx       # 'use client' — chars reveal + cards stagger
│   │   ├── ArticleContent.tsx    # 'use client' — parallax hero + body reveals
│   │   └── ContactContent.tsx    # 'use client' — slide-in info + form
│   ├── admin/
│   │   ├── AdminSidebar.tsx      # Sidebar fija, usePathname
│   │   ├── PriceEngine.tsx       # Sliders de margen
│   │   └── ZoneConfigurator.tsx  # Toggles de zonas + horarios
│   ├── supplier/
│   │   └── StockQuotaCard.tsx    # Toggle auto/manual
│   ├── transporter/
│   │   ├── QRScannerUI.tsx       # Scanner móvil, GSAP esquinas
│   │   └── ProofCapture.tsx      # Foto + firma + GPS
│   └── ui/                       # Shadcn components (button, card, dialog, etc.)
│
└── lib/
    ├── gsap.ts                   # 'use client' — registro de plugins
    ├── mock-data.ts              # 30 productos, 5 órdenes, 6 zonas
    └── journal-data.ts           # 6 artículos del journal
```

---

## 6. PÁGINAS Y MÓDULOS — ESTADO ACTUAL

### 6A. Páginas de Cliente

#### `/` — Homepage
Secciones en orden:
1. **HeroSection** — Carrusel 3 slides, auto-play 5s, pause on hover, progress bar, SplitText
2. **FeaturedProducts** — "New Arrival" header + rule + "Browse All", grid 3 productos
3. **CategoryStrips** — "Collection Feature": Fashion y Home&Kitchen en split 40/60 con carousel de imágenes y product card
4. **TrendReport** — "Best Seller" header + rule + grid 3 productos
5. **CategorySplit** — Dos paneles: Fashion Collection / Sports Collection
6. **TrackingPreview** — Preview del sistema de rastreo
7. **NewsletterBanner** — Suscripción con SplitText

#### `/shop` + `/shop/[category]`
- Grid de productos con filtros
- 4 categorías: `fashion`, `home-kitchen`, `sports-fitness`, `electronics`
- Componente `CatalogGrid` con stagger GSAP en scroll

#### `/product/[slug]`
- 30 slugs generados estáticamente
- Galería de imágenes, variantes de color/talla, Add to Cart
- Entrance animation GSAP (galería desde izquierda, info desde derecha)

#### `/checkout`
- Stepper de 3 pasos: Address → Payment → Confirm
- Transiciones GSAP entre pasos (slide `x: ±40`)
- Step nodes con `back.out(1.5)` al avanzar

#### `/tracking` + `/tracking/[orderId]`
- Formulario de búsqueda por número de orden
- Timeline animado con 5 estados: Order Received → Processing → In Transit → Out for Delivery → Delivered
- ORD-001 a ORD-005 disponibles

#### `/about`
- Hero oscuro con stats (2021, 30+, 6 zonas, Zamora)
- SplitText en headline, stats scale-in
- Mission paragraphs reveal en scroll
- Category grid con hover

#### `/journal` + `/journal/[slug]`
- Grid de 6 artículos: modern-wardrobe, seasonal-essentials, minimal-living, performance-edit, tech-for-you, morning-rituals
- Chars reveal en título, cards stagger
- Artículo individual: parallax hero (`yPercent: -15, scrub: 1.5`), SplitText en título, paragraphs reveal individual

#### `/contact`
- Info: dirección, horarios, email
- Formulario con validación
- Success state animado: icon `scale: 0 → 1, rotation: -180° → 0°, back.out(1.7)`
- Items info slide desde izquierda, form desde derecha

#### `/faq`
- 10 preguntas en Accordion (`@base-ui/react`)
- Stagger de items al entrar en viewport

#### `/returns`, `/size-guide`, `/privacy`, `/terms`
- Páginas de contenido estático con políticas y guías

---

### 6B. Paneles de Operaciones

#### `/supplier` — Dashboard de Proveedor
- Órdenes pendientes de confirmar
- Inventario y cuotas de stock (StockQuotaCard con toggle auto/manual)
- Acceso a 12 productos POS

#### `/transporter` — App de Transportista (mobile-first)
- QR Scanner UI con animación de esquinas GSAP
- Escaneo de paquetes para recolección

#### `/transporter/delivery/[id]` — Prueba de Entrega
- Captura de foto
- Firma digital
- Geolocalización GPS

#### `/repartidor` — App de Repartidor
- Lista de entregas del día
- Estado de cada paquete

#### `/admin` — Dashboard Administrativo
- AdminSidebar fija con navegación activa (usePathname)
- **Overview:** MetricsOverview — pedidos, ingresos, usuarios
- **Pricing** (`/admin/pricing`): PriceEngine — sliders de margen por categoría, toggle de visibilidad
- **Zones** (`/admin/zones`): ZoneConfigurator — activar/desactivar zonas, ajustar horarios de entrega

---

## 7. DATOS MOCK (FASE 1)

### Productos — `src/lib/mock-data.ts`
| Categoría | IDs | Count |
|-----------|-----|-------|
| Fashion | f001–f008 | 8 |
| Home & Kitchen | h001–h008 | 8 |
| Sports & Fitness | s001–s007 | 7 |
| Electronics | e001–e007 | 7 |
| **Total** | | **30** |

Cada producto tiene: `id, slug, name, price, originalPrice?, badge?, images[], colors[], sizes[], category, description`

### Órdenes
- ORD-001 a ORD-005
- Cada una con tracking timeline completo

### Zonas de entrega
- z1: Zamora Centro (4h, $35)
- z2: Zamora Norte (6h, $45)
- z3: Zamora Sur (6h, $45)
- z4: Jacona (8h, $55)
- z5: Tangancícuaro (12h, $65)
- z6: Jiquilpan (24h, $75)

### Journal — `src/lib/journal-data.ts`
6 artículos con: `id, slug, title, tag, excerpt, date, image, body[]`

---

## 8. FASE 1 — COMPLETADA ✓

**Lo que existe y funciona:**
- ✅ UI completa y navegable — 23 rutas, 0 errores TypeScript
- ✅ Diseño editorial BLOCKHAUS/H&M — esquinas cuadradas, tipografía bold uppercase, cards 3:4
- ✅ Sistema de animaciones GSAP profesional — ScrollTrigger, SplitText, parallax, stagger, micro-interacciones
- ✅ Hero con auto-play y progress bar
- ✅ Header con scroll-hide/show y nav underlines animados
- ✅ 4 paneles de operaciones (supplier, transporter, repartidor, admin)
- ✅ Zero broken links — todas las rutas existen y renderizan

**Lo que NO existe aún (solo UI/mock):**
- ❌ Base de datos real
- ❌ Autenticación / sesiones
- ❌ Carrito persistente
- ❌ Órdenes reales
- ❌ Pagos
- ❌ Tracking en tiempo real
- ❌ Notificaciones

---

## 9. FASE 2 — PENDIENTE (Backend)

### 9A. Base de Datos — Prisma + PostgreSQL
**Modelos principales a diseñar:**
```
User (id, role, email, name, phone)
Product (id, slug, name, price, category, stock, supplierId)
Order (id, customerId, status, total, zone, address)
OrderItem (orderId, productId, qty, price)
Delivery (orderId, transporterId, status, proofPhoto, signature, gps)
Zone (id, name, etaHours, fee, active)
PriceRule (productId, margin, visible)
```

### 9B. Autenticación — NextAuth.js
**Roles necesarios:**
```
CUSTOMER    → acceso a shop, checkout, tracking propio
SUPPLIER    → acceso a /supplier (sus productos y órdenes)
TRANSPORTER → acceso a /transporter (recolecciones)
REPARTIDOR  → acceso a /repartidor (entregas del día)
ADMIN       → acceso completo a /admin
```

### 9C. API Routes — Next.js Route Handlers
```
POST /api/orders                → crear orden
GET  /api/orders/[id]           → estado de orden
POST /api/orders/[id]/confirm   → supplier confirma
POST /api/delivery/[id]/pickup  → transporter escanea recolección
POST /api/delivery/[id]/proof   → repartidor sube prueba
GET  /api/tracking/[orderId]    → estado público de rastreo
```

### 9D. Carrito
- Estado del carrito con `zustand` o React Context
- Persistencia en `localStorage` (no requiere auth)
- Checkout conectado a API de órdenes

### 9E. Pagos
- **Opción A:** Stripe (tarjetas internacionales)
- **Opción B:** Conekta (OXXO Pay, tarjetas MXN, transferencia)
- **Recomendación:** Conekta primero (mercado local), luego Stripe

### 9F. Tracking en Tiempo Real
- **Opción A:** Polling cada 15s (simple, suficiente para MVP)
- **Opción B:** WebSockets / Server-Sent Events (real-time real)
- **Recomendación:** Polling para MVP, WebSockets en v2

---

## 10. FASE 3 — FUTURO (v2+)

- **PWA / App móvil** para transportistas y repartidores (la UI ya es mobile-first)
- **Panel de analíticas** para admin — ventas por zona, categoría, proveedor
- **Sistema de reseñas** — producto, repartidor
- **Programa de lealtad** — puntos MARIASCLUB
- **Expansión de zonas** — más municipios, rutas programadas
- **Multi-proveedor marketplace** — más suppliers con sus propias tiendas
- **Integración WhatsApp** — notificaciones de estado de orden
- **SEO optimizado** — metadata dinámica, sitemap, Schema.org

---

## 11. RESUMEN EJECUTIVO

| Aspecto | Estado |
|---------|--------|
| Concepto de negocio | ✅ Definido |
| Diseño UI/UX | ✅ Completo — editorial, profesional |
| Frontend / Prototipo | ✅ Funcional — 23 rutas navegables |
| Animaciones | ✅ Nivel profesional — GSAP en todo el sitio |
| Backend / API | ⏳ Pendiente — Fase 2 |
| Base de datos | ⏳ Pendiente — Fase 2 |
| Autenticación | ⏳ Pendiente — Fase 2 |
| Pagos | ⏳ Pendiente — Fase 2 |
| Deploy producción | ⏳ Pendiente — post Fase 2 |

**El proyecto está a mitad de camino entre una idea y un producto real.** La capa de presentación es completa y de alta calidad — podría servir como demo para inversores o validación con usuarios hoy mismo. La siguiente etapa crítica es conectar la UI con datos reales.

---

*MARIASCLUB™ — Zamora, Michoacán, México · 2026*
