import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

/** GET /api/admin/suppliers — lista todos los proveedores con conteo de productos */
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        profile: true,
        products: { select: { id: true, price: true, stock: true, lowStockThreshold: true, active: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const result = suppliers.map((s) => ({
      id: s.id,
      email: s.email,
      displayName: s.displayName,
      createdAt: s.createdAt.toISOString(),
      active: s.active,
      profile: {
        storeName: s.profile?.storeName ?? s.displayName,
        brandColor: s.profile?.brandColor ?? '#1E3A5F',
        slug: s.profile?.slug ?? s.id,
      },
      productCount: s.products.length,
      lowStockCount: s.products.filter(
        (p) => p.active && p.stock > 0 && p.stock <= p.lowStockThreshold,
      ).length,
      inventoryValue: s.products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0),
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error('[admin/suppliers GET]', e);
    return NextResponse.json([], { status: 500 });
  }
}

/** POST /api/admin/suppliers — da de alta un nuevo proveedor en la base de datos */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      displayName: string;
      storeName: string;
      email: string;
      password: string;
      brandColor?: string;
    };

    const { displayName, storeName, email, password, brandColor = '#1E3A5F' } = body;

    // Validaciones básicas
    if (!displayName || !storeName || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    // Verificar que el correo no exista
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese correo.' }, { status: 409 });
    }

    // Generar ID del proveedor a partir del nombre de la tienda
    const baseSlug = storeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const supplierId = `${baseSlug}-${Date.now()}`;

    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear Supplier + SupplierProfile + User en una transacción
    const [supplier] = await prisma.$transaction([
      prisma.supplier.create({
        data: {
          id: supplierId,
          email,
          displayName,
          active: true,
          profile: {
            create: {
              storeName,
              slug: supplierId,
              brandColor,
              accentColor: '#E8A020',
              description: '',
              wholesaleRate: 70,
              shippingMethods: [
                { type: 'pickup', label: 'Recoger en tienda', cost: 0, enabled: true, description: 'El cliente pasa a recoger su pedido en la tienda' },
                { type: 'paqueteria', label: 'Paquetería', cost: 0, enabled: false, description: 'Envío a domicilio', zonedPricing: { local: 80, regional: 120, centro: 160, lejano: 200 } },
                { type: 'rappi', label: 'Rappi / mensajero', cost: 0, enabled: false, description: 'Entrega por Rappi o mensajero local' },
              ],
              bankInfo: {},
            },
          },
        },
      }),
      prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: displayName,
          role: 'proveedor',
          supplierId,
        },
      }),
    ]);

    return NextResponse.json(
      { ok: true, supplierId: supplier.id },
      { status: 201 },
    );
  } catch (e) {
    console.error('[admin/suppliers POST]', e);
    return NextResponse.json({ error: 'Error al crear el proveedor.' }, { status: 500 });
  }
}
