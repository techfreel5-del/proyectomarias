import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(zones);
}

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  // Crear zona nueva con ID incremental
  const count = await prisma.deliveryZone.count();
  const zone = await prisma.deliveryZone.create({
    data: { id: `z${count + 1}`, name: "Nueva zona", estimatedHours: 8, active: false, repartidores: 0 },
  });
  return NextResponse.json(zone, { status: 201 });
}
