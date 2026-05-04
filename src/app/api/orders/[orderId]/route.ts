import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ orderId: string }>;
}

const orderInclude = { items: true, packages: true, supplierPayments: true } as const;

function toLocalOrder(o: Awaited<ReturnType<typeof prisma.order.findUnique>> & { items: unknown[]; packages: unknown[]; supplierPayments: unknown[] }) {
  if (!o) return null;
  return {
    id: o.id,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    customer: {
      name: o.customerName,
      email: o.customerEmail ?? undefined,
      phone: o.customerPhone,
      address: o.customerAddress,
      zone: o.customerZone,
    },
    items: (o.items as Array<{ productId: string; name: string; price: { toNumber: () => number }; qty: number; image: string; size: string; color: string; supplierId: string | null; supplierName: string | null }>).map((i) => ({
      id: i.productId,
      name: i.name,
      price: i.price.toNumber(),
      qty: i.qty,
      image: i.image,
      size: i.size,
      color: i.color,
      supplierId: i.supplierId,
      supplierName: i.supplierName,
    })),
    total: (o.total as { toNumber: () => number }).toNumber(),
    paymentMethod: o.paymentMethod,
    isAdvance: o.isAdvance,
    amountPaid: (o.amountPaid as { toNumber: () => number }).toNumber(),
    supplierSlug: o.supplierSlug,
    shippingMethod: o.shippingMethod,
    shippingCost: o.shippingCost ? (o.shippingCost as { toNumber: () => number }).toNumber() : undefined,
    deliveryType: o.deliveryType,
    paymentCollectedMethod: o.paymentCollectedMethod,
    supplierPackages: (o.packages as Array<{ supplierId: string; supplierName: string; supplierEmail: string; itemIds: string[]; status: string }>).map((p) => ({
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      supplierEmail: p.supplierEmail,
      itemIds: p.itemIds,
      status: p.status,
    })),
    supplierPayments: Object.fromEntries(
      (o.supplierPayments as Array<{ supplierId: string; status: string; paidAt: Date | null }>).map((sp) => [
        sp.supplierId,
        { status: sp.status, paidAt: sp.paidAt?.toISOString() },
      ])
    ),
  };
}

export async function GET(_req: NextRequest, { params }: Props) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: orderInclude,
  });
  if (!order) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(toLocalOrder(order as Parameters<typeof toLocalOrder>[0]));
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { orderId } = await params;
  const body = await req.json();
  const { status, deliveryType, paymentCollectedMethod } = body;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...(status && { status }),
      ...(deliveryType && { deliveryType }),
      ...(paymentCollectedMethod && { paymentCollectedMethod }),
    },
    include: orderInclude,
  });

  return NextResponse.json(toLocalOrder(order as Parameters<typeof toLocalOrder>[0]));
}
