import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const badge = searchParams.get("badge");
  const supplierId = searchParams.get("supplierId");
  const limit = searchParams.get("limit");

  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(category && { category }),
        ...(badge && { badge }),
        ...(supplierId && { supplierId }),
      },
      orderBy: { createdAt: "desc" },
      ...(limit && { take: parseInt(limit) }),
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !["admin", "proveedor"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
