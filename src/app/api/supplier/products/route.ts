import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const runtime = 'nodejs';

/** POST /api/supplier/products — crea un producto en la BD para el proveedor autenticado */
export async function POST(req: NextRequest) {
  const session = await auth();
  const supplierId = (session?.user as { supplierId?: string })?.supplierId;

  if (!supplierId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json() as {
      name: string;
      category?: string;
      price: number;
      stock: number;
      image?: string;
      description?: string;
      lowStockThreshold?: number;
      sku?: string;
      sizes?: string[];
      colors?: string[];
      videoUrl?: string;
    };

    const {
      name,
      category = 'General',
      price,
      stock,
      image = '',
      description = '',
      lowStockThreshold = 5,
      sku,
      sizes = [],
      colors = [],
      videoUrl,
    } = body;

    if (!name || price == null) {
      return NextResponse.json({ error: 'Nombre y precio son obligatorios.' }, { status: 400 });
    }

    // Generar id y slug únicos
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    const suffix = Date.now().toString(36);
    const productId = `${supplierId.slice(0, 20)}-${base}-${suffix}`;
    const slug = productId;

    const product = await prisma.product.create({
      data: {
        id: productId,
        slug,
        supplierId,
        name,
        category,
        subcategory: category,
        price,
        stock,
        images: image ? [image] : [],
        description,
        lowStockThreshold,
        sku: sku ?? null,
        sizes,
        colors,
        videoUrl: videoUrl ?? null,
        active: false,
        pendingApproval: true,
        inStock: stock > 0,
      },
    });

    return NextResponse.json({ ok: true, productId: product.id }, { status: 201 });
  } catch (e) {
    console.error('[supplier/products POST]', e);
    return NextResponse.json({ error: 'Error al guardar el producto.' }, { status: 500 });
  }
}
