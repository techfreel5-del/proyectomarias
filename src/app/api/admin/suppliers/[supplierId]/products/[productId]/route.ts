import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/** PATCH /api/admin/suppliers/[supplierId]/products/[productId]
 *  Actualiza campos de un producto en la base de datos. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ supplierId: string; productId: string }> },
) {
  const { productId } = await params;
  try {
    const body = await req.json() as Record<string, unknown>;

    // Solo permitir campos editables
    const data: Record<string, unknown> = {};
    if (body.name       !== undefined) data.name        = body.name;
    if (body.price      !== undefined) data.price       = Number(body.price);
    if (body.stock      !== undefined) data.stock       = Number(body.stock);
    if (body.description !== undefined) data.description = body.description;
    if (body.active     !== undefined) data.active      = Boolean(body.active);
    if (body.pendingApproval !== undefined) data.pendingApproval = Boolean(body.pendingApproval);
    if (body.videoUrl   !== undefined) data.videoUrl    = body.videoUrl;

    const updated = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return NextResponse.json({ ok: true, price: Number(updated.price) });
  } catch (e) {
    console.error('[admin/suppliers products PATCH]', e);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}
