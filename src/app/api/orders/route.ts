import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { LocalOrder } from "@/lib/orders-store";

// Convierte una orden de Prisma al tipo LocalOrder del frontend
function toLocalOrder(o: {
  id: string; status: string; createdAt: Date; updatedAt: Date;
  customerName: string; customerEmail: string | null; customerPhone: string;
  customerAddress: string; customerZone: string;
  total: { toNumber: () => number }; paymentMethod: string;
  isAdvance: boolean; amountPaid: { toNumber: () => number };
  supplierSlug: string | null; shippingMethod: string | null;
  shippingCost: { toNumber: () => number } | null;
  deliveryType: string | null; paymentCollectedMethod: string | null;
  items: Array<{
    id: string; productId: string; name: string;
    price: { toNumber: () => number }; qty: number; image: string;
    size: string; color: string; supplierId: string | null; supplierName: string | null;
  }>;
  packages: Array<{
    supplierId: string; supplierName: string; supplierEmail: string;
    itemIds: string[]; status: string;
  }>;
  supplierPayments: Array<{
    supplierId: string; status: string; paidAt: Date | null;
  }>;
}): LocalOrder {
  return {
    id: o.id,
    status: o.status as LocalOrder["status"],
    createdAt: o.createdAt.toISOString(),
    customer: {
      name: o.customerName,
      email: o.customerEmail ?? undefined,
      phone: o.customerPhone,
      address: o.customerAddress,
      zone: o.customerZone,
    },
    items: o.items.map((i) => ({
      id: i.productId,
      name: i.name,
      price: i.price.toNumber(),
      qty: i.qty,
      image: i.image,
      size: i.size,
      color: i.color,
      supplierId: i.supplierId ?? undefined,
      supplierName: i.supplierName ?? undefined,
    })),
    total: o.total.toNumber(),
    paymentMethod: o.paymentMethod,
    isAdvance: o.isAdvance,
    amountPaid: o.amountPaid.toNumber(),
    supplierSlug: o.supplierSlug ?? undefined,
    shippingMethod: o.shippingMethod ?? undefined,
    shippingCost: o.shippingCost?.toNumber(),
    deliveryType: o.deliveryType as LocalOrder["deliveryType"],
    paymentCollectedMethod: o.paymentCollectedMethod as LocalOrder["paymentCollectedMethod"],
    supplierPackages: o.packages.map((p) => ({
      supplierId: p.supplierId,
      supplierName: p.supplierName,
      supplierEmail: p.supplierEmail,
      itemIds: p.itemIds,
      status: p.status as "pending" | "preparing" | "ready" | "picked_up",
    })),
    supplierPayments: Object.fromEntries(
      o.supplierPayments.map((sp) => [
        sp.supplierId,
        { status: sp.status as "pending" | "paid", paidAt: sp.paidAt?.toISOString() },
      ])
    ),
  };
}

const orderInclude = {
  items: true,
  packages: true,
  supplierPayments: true,
} as const;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const supplierId = searchParams.get("supplierId");

  const role = session.user.role;
  const userSupplierId = session.user.supplierId;

  const where: Record<string, unknown> = {};

  if (role === "proveedor") {
    // Solo órdenes que tienen paquetes del proveedor
    where.packages = { some: { supplierId: userSupplierId } };
  } else if (role === "repartidor" || role === "transportista") {
    where.status = "shipped";
  } else if (role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (status) where.status = status;
  if (supplierId && role === "admin") {
    where.packages = { some: { supplierId } };
  }

  const orders = await prisma.order.findMany({
    where,
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders.map(toLocalOrder));
}

export async function POST(req: NextRequest) {
  const body = await req.json() as LocalOrder;
  const session = await auth();

  // Generar ID de orden
  const count = await prisma.order.count();
  const orderId = `ORD-${String(count + 1).padStart(3, "0")}`;

  // Buscar usuario autenticado para asociar la orden
  let customerId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    customerId = user?.id ?? null;
  }

  const order = await prisma.order.create({
    data: {
      id: orderId,
      status: "pending",
      customerId,
      customerName: body.customer.name,
      customerEmail: body.customer.email,
      customerPhone: body.customer.phone,
      customerAddress: body.customer.address,
      customerZone: body.customer.zone,
      total: body.total,
      paymentMethod: body.paymentMethod,
      isAdvance: body.isAdvance,
      amountPaid: body.amountPaid,
      supplierSlug: body.supplierSlug,
      shippingMethod: body.shippingMethod,
      shippingCost: body.shippingCost,
      items: {
        create: body.items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image ?? "",
          size: i.size ?? "",
          color: i.color ?? "",
          supplierId: i.supplierId,
          supplierName: i.supplierName,
        })),
      },
      packages: body.supplierPackages
        ? {
            create: body.supplierPackages.map((p) => ({
              supplierId: p.supplierId,
              supplierName: p.supplierName,
              supplierEmail: p.supplierEmail,
              itemIds: p.itemIds,
              status: "pending",
            })),
          }
        : undefined,
      supplierPayments: body.supplierPackages
        ? {
            create: body.supplierPackages.map((p) => ({
              supplierId: p.supplierId,
              status: "pending",
            })),
          }
        : undefined,
    },
    include: orderInclude,
  });

  return NextResponse.json({ ...toLocalOrder(order), id: orderId }, { status: 201 });
}
