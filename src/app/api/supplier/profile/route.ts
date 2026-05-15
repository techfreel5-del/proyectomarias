import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const runtime = 'nodejs';

/** GET /api/supplier/profile — devuelve el perfil completo del proveedor autenticado */
export async function GET() {
  const session = await auth();
  const supplierId = (session?.user as { supplierId?: string })?.supplierId;

  if (!supplierId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const prof = await prisma.supplierProfile.findUnique({ where: { supplierId } });
    if (!prof) return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });

    const raw = (prof.shippingMethods ?? []) as Array<Record<string, unknown>>;
    const shippingMethods = raw.length > 0
      ? raw.map((m) => ({
          type: m.type,
          label: m.label ?? 'Envío',
          enabled: m.enabled !== undefined ? Boolean(m.enabled) : Boolean(m.active),
          cost: Number(m.cost ?? 0),
          description: m.description ?? '',
          zonedPricing: m.zonedPricing,
        }))
      : [{ type: 'pickup', label: 'Recoger en tienda', enabled: true, cost: 0, description: '' }];

    return NextResponse.json({
      storeName: prof.storeName,
      slug: prof.slug,
      logo: prof.logo ?? null,
      brandColor: prof.brandColor,
      accentColor: prof.accentColor,
      description: prof.description,
      phone: prof.phone,
      address: prof.address,
      bannerUrl: prof.bannerUrl,
      showPoweredBy: prof.showPoweredBy,
      storeTheme: prof.storeTheme,
      heroCtaText: prof.heroCtaText,
      announcementText: prof.announcementText,
      announcementBg: prof.announcementBg,
      cardStyle: prof.cardStyle,
      instagramUrl: prof.instagramUrl,
      facebookUrl: prof.facebookUrl,
      tiktokUrl: prof.tiktokUrl,
      storeConfig: {
        whatsappNumber: prof.whatsappNumber ?? '',
        shippingMethods,
        bankInfo: (prof.bankInfo ?? {}) as Record<string, unknown>,
      },
    });
  } catch (e) {
    console.error('[supplier/profile GET]', e);
    return NextResponse.json({ error: 'Error al cargar el perfil.' }, { status: 500 });
  }
}

/** PATCH /api/supplier/profile — guarda el perfil del proveedor autenticado en la DB */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const supplierId = (session?.user as { supplierId?: string })?.supplierId;

  if (!supplierId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json() as Record<string, unknown>;

    // Extraer storeConfig del perfil frontend
    const storeConfig = body.storeConfig as Record<string, unknown> | undefined;

    const data: Record<string, unknown> = {};

    // Campos directos del perfil
    if (body.storeName      !== undefined) data.storeName      = body.storeName;
    if (body.description    !== undefined) data.description    = body.description;
    if (body.brandColor     !== undefined) data.brandColor     = body.brandColor;
    if (body.accentColor    !== undefined) data.accentColor    = body.accentColor;
    if (body.logo           !== undefined) data.logo           = body.logo;
    if (body.bannerUrl      !== undefined) data.bannerUrl      = body.bannerUrl;
    if (body.phone          !== undefined) data.phone          = body.phone;
    if (body.address        !== undefined) data.address        = body.address;
    if (body.showPoweredBy  !== undefined) data.showPoweredBy  = body.showPoweredBy;
    if (body.storeTheme     !== undefined) data.storeTheme     = body.storeTheme;
    if (body.heroCtaText    !== undefined) data.heroCtaText    = body.heroCtaText;
    if (body.announcementText !== undefined) data.announcementText = body.announcementText;
    if (body.announcementBg !== undefined) data.announcementBg = body.announcementBg;
    if (body.cardStyle      !== undefined) data.cardStyle      = body.cardStyle;
    if (body.instagramUrl   !== undefined) data.instagramUrl   = body.instagramUrl;
    if (body.facebookUrl    !== undefined) data.facebookUrl    = body.facebookUrl;
    if (body.tiktokUrl      !== undefined) data.tiktokUrl      = body.tiktokUrl;

    // Campos dentro de storeConfig
    if (storeConfig?.whatsappNumber !== undefined) data.whatsappNumber  = storeConfig.whatsappNumber;
    if (storeConfig?.shippingMethods !== undefined) data.shippingMethods = storeConfig.shippingMethods;
    if (storeConfig?.bankInfo        !== undefined) data.bankInfo        = storeConfig.bankInfo;

    await prisma.supplierProfile.update({
      where: { supplierId },
      data,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[supplier/profile PATCH]', e);
    return NextResponse.json({ error: 'Error al guardar el perfil.' }, { status: 500 });
  }
}
