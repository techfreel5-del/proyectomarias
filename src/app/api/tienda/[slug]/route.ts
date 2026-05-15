import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/** GET /api/tienda/[slug] — carga datos públicos de una tienda de proveedor por slug */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const supplier = await prisma.supplier.findFirst({
      where: { profile: { slug } },
      include: { profile: true },
    });

    if (!supplier || !supplier.active) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { supplierId: supplier.id, active: true, pendingApproval: false },
      orderBy: { createdAt: 'desc' },
    });

    const inventory = products.map((p) => ({
      id: p.id,
      sku: p.sku ?? '',
      name: p.name,
      category: p.subcategory ?? p.category,
      price: Number(p.price),
      stock: p.stock,
      image: p.images[0] ?? '',
      images: p.images,
      description: p.description,
      active: p.active,
      lowStockThreshold: p.lowStockThreshold,
      pendingApproval: p.pendingApproval,
      videoUrl: p.videoUrl ?? '',
      hasVariants: false,
      variantType: 'none' as const,
      variants: [],
    }));

    const prof = supplier.profile!;

    // Normalizar shippingMethods desde la DB — pueden venir con active o enabled
    const rawMethods = (prof.shippingMethods ?? []) as Array<Record<string, unknown>>;
    const shippingMethods = rawMethods.length > 0
      ? rawMethods.map((m) => ({
          type: m.type,
          label: m.label ?? 'Envío',
          // Aceptar enabled o active como sinónimos
          enabled: m.enabled !== undefined ? Boolean(m.enabled) : Boolean(m.active),
          cost: Number(m.cost ?? 0),
          description: m.description ?? '',
          zonedPricing: m.zonedPricing,
        }))
      // Sin métodos configurados → pickup habilitado por defecto
      : [{ type: 'pickup', label: 'Recoger en tienda', enabled: true, cost: 0, description: '' }];

    const bankInfo = (prof.bankInfo ?? {}) as Record<string, unknown>;

    return NextResponse.json({
      id: supplier.id,
      profile: {
        storeName: prof.storeName,
        slug: prof.slug,
        brandColor: prof.brandColor,
        accentColor: prof.accentColor ?? '#E8A020',
        description: prof.description ?? '',
        logo: prof.logo ?? null,
        bannerUrl: prof.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=70',
        showPoweredBy: prof.showPoweredBy ?? true,
        storeTheme: prof.storeTheme ?? 'moderno',
        heroCtaText: prof.heroCtaText ?? 'Ver colección',
        announcementText: prof.announcementText ?? '',
        announcementBg: prof.announcementBg ?? '',
        cardStyle: prof.cardStyle ?? 'rounded',
        instagramUrl: prof.instagramUrl ?? '',
        facebookUrl: prof.facebookUrl ?? '',
        tiktokUrl: prof.tiktokUrl ?? '',
        email: supplier.email,
        phone: prof.phone ?? '',
        address: prof.address ?? '',
        storeConfig: {
          bankInfo,
          shippingMethods,
          whatsappNumber: prof.whatsappNumber ?? '',
        },
      },
      inventory,
    });
  } catch (e) {
    console.error('[tienda GET]', e);
    return NextResponse.json({ error: 'Error al cargar la tienda' }, { status: 500 });
  }
}
