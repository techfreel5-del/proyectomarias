import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user || !["admin", "proveedor"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { orderId } = await params;
  const { supplierId, status } = await req.json();

  await prisma.orderPackage.updateMany({
    where: { orderId, supplierId },
    data: { status },
  });

  // Si empieza a preparar, avanzar orden a processing
  if (status === "preparing") {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order?.status === "pending") {
      await prisma.order.update({ where: { id: orderId }, data: { status: "processing" } });
    }
  }

  return NextResponse.json({ ok: true });
}
