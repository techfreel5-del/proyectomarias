import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

async function getUserCart(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ items: [] });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ items: [] });

  const cart = await getUserCart(user.id);
  return NextResponse.json({ items: cart?.items ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const { productId, size = "", color = "", qty = 1 } = await req.json();
  const key = `${productId}-${size}-${color}`;

  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_key: { cartId: cart.id, key } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { qty: existing.qty + qty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, qty, size, color, key },
    });
  }

  const updated = await getUserCart(user.id);
  return NextResponse.json({ items: updated?.items ?? [] });
}
