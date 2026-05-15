import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/** PATCH /api/admin/suppliers/[supplierId] — actualiza campos del proveedor (ej. active) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ supplierId: string }> },
) {
  const { supplierId } = await params;
  try {
    const body = await req.json() as Record<string, unknown>;
    if (typeof body.active === 'boolean') {
      await prisma.supplier.update({
        where: { id: supplierId },
        data: { active: body.active },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/suppliers PATCH]', e);
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}

/** GET /api/admin/suppliers/[supplierId]
 *  Devuelve datos del proveedor + inventario desde la base de datos. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ supplierId: string }> },
) {
  const { supplierId } = await params;
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      include: { profile: true },
    });
    if (!supplier) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { supplierId },
      orderBy: { name: 'asc' },
    });

    // Convertir Product de Prisma a InventoryProduct
    const inventory = products.map((p) => ({
      id: p.id,
      sku: p.sku ?? p.id.toUpperCase().replace(/([A-Z]+)(\d+)/, '$1-$2'),
      name: p.name,
      category: p.subcategory,
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
      variantType: 'none',
      variants: [],
    }));

    return NextResponse.json({
      id: supplier.id,
      email: supplier.email,
      displayName: supplier.displayName,
      createdAt: supplier.createdAt.toISOString(),
      active: supplier.active,
      profile: {
        storeName: supplier.profile?.storeName ?? supplier.displayName,
        brandColor: supplier.profile?.brandColor ?? '#1E3A5F',
        slug: supplier.profile?.slug ?? supplier.id,
      },
      inventory,
    });
  } catch (e) {
    console.error('[admin/suppliers GET]', e);
    return NextResponse.json({ error: 'Error al cargar proveedor' }, { status: 500 });
  }
}
