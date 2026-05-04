import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  const { items } = await req.json() as {
    items: { productId: string; size: string; color: string; qty: number }[];
  };

  if (!items?.length) return NextResponse.json({ ok: true });

  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  for (const item of items) {
    const key = `${item.productId}-${item.size}-${item.color}`;
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_key: { cartId: cart.id, key } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + item.qty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: item.productId, qty: item.qty, size: item.size, color: item.color, key },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
