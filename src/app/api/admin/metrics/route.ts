import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [totalOrders, activeDeliveries, revenueResult, productCount] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "shipped" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ["delivered", "shipped", "processing"] } },
    }),
    prisma.product.count({ where: { active: true } }),
  ]);

  return NextResponse.json({
    totalOrders,
    activeDeliveries,
    totalRevenue: revenueResult._sum.total?.toNumber() ?? 0,
    productCount,
  });
}
