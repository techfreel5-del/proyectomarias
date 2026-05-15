import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [productOverrides, supplierOverrides] = await Promise.all([
      prisma.productPriceOverride.findMany(),
      prisma.supplierWholesaleOverride.findMany(),
    ]);

    const products: Record<string, { price: number }> = {};
    for (const o of productOverrides) {
      products[o.productId] = { price: Number(o.adminPrice) };
    }

    const suppliers: Record<string, { wholesaleRate: number }> = {};
    for (const o of supplierOverrides) {
      suppliers[o.supplierId] = { wholesaleRate: Number(o.wholesaleRate) };
    }

    return NextResponse.json({ products, suppliers });
  } catch (e) {
    console.error('[pricing GET]', e);
    return NextResponse.json({ products: {}, suppliers: {} });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (body.type === 'product') {
      await prisma.productPriceOverride.upsert({
        where:  { productId: body.productId },
        update: { adminPrice: body.price },
        create: { productId: body.productId, adminPrice: body.price },
      });

    } else if (body.type === 'products_batch') {
      for (const { productId, price } of body.updates as { productId: string; price: number }[]) {
        await prisma.productPriceOverride.upsert({
          where:  { productId },
          update: { adminPrice: price },
          create: { productId, adminPrice: price },
        });
      }

    } else if (body.type === 'products_reset') {
      await prisma.productPriceOverride.deleteMany({
        where: { productId: { in: body.productIds as string[] } },
      });

    } else if (body.type === 'wholesale') {
      await prisma.supplierWholesaleOverride.upsert({
        where:  { supplierId: body.supplierId },
        update: { wholesaleRate: body.rate },
        create: { supplierId: body.supplierId, wholesaleRate: body.rate },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[pricing PATCH]', e);
    return NextResponse.json({ error: 'Error al actualizar precios' }, { status: 500 });
  }
}
