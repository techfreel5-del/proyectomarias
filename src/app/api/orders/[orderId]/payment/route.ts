import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ orderId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo admin" }, { status: 401 });
  }

  const { orderId } = await params;
  const { supplierId, status } = await req.json();

  await prisma.supplierPayment.updateMany({
    where: { orderId, supplierId },
    data: {
      status,
      ...(status === "paid" && { paidAt: new Date() }),
    },
  });

  return NextResponse.json({ ok: true });
}
