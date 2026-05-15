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

    const profile = supplier.profile!;
    return NextResponse.json({
      id: supplier.id,
      profile: {
        storeName: profile.storeName,
        slug: profile.slug,
        brandColor: profile.brandColor,
        accentColor: profile.accentColor ?? '#E8A020',
        description: profile.description ?? '',
        logo: null,
        bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=70',
        showPoweredBy: true,
        storeTheme: 'moderno',
        heroCtaText: 'Ver colección',
        announcementText: '',
        announcementBg: '',
        cardStyle: 'rounded',
        instagramUrl: '',
        facebookUrl: '',
        tiktokUrl: '',
        email: supplier.email,
        phone: '',
        address: '',
        storeConfig: {
          bankInfo: {},
          shippingMethods: [
            { type: 'pickup', label: 'Recoger en tienda', cost: 0, active: true },
          ],
        },
      },
      inventory,
    });
  } catch (e) {
    console.error('[tienda GET]', e);
    return NextResponse.json({ error: 'Error al cargar la tienda' }, { status: 500 });
  }
}
