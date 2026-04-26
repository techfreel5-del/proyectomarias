import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';
import {
  orderConfirmationEmail,
  supplierNotificationEmail,
  adminNotificationEmail,
  transporterNotificationEmail,
  adminAtHubEmail,
} from '@/lib/email-templates';
import type { LocalOrder } from '@/lib/orders-store';

const ADMIN_EMAIL = 'admin@mariasclub.com';
const TRANSPORTER_EMAIL = 'transportista@mariasclub.com';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://proyectomarias.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { type: string; order: LocalOrder };
    const { type, order } = body;

    if (!order?.id) {
      return NextResponse.json({ success: false, error: 'Missing order' }, { status: 400 });
    }

    const trackingUrl = `${BASE_URL}/tracking/${order.id}`;

    if (type === 'order_placed') {
      const emails: Promise<void>[] = [];

      // Email al cliente (si tiene email)
      if (order.customer.email) {
        emails.push(sendEmail({
          to: order.customer.email,
          subject: `Pedido confirmado — ${order.id} | MARIASCLUB`,
          html: orderConfirmationEmail(order, trackingUrl),
        }));
      }

      // Email al admin
      emails.push(sendEmail({
        to: ADMIN_EMAIL,
        subject: `Nuevo pedido — ${order.id}`,
        html: adminNotificationEmail(order),
      }));

      // Email a cada proveedor involucrado
      const supplierIds = [...new Set(order.items.map((i) => i.supplierId).filter(Boolean))];
      for (const supplierId of supplierIds) {
        const pkg = order.supplierPackages?.find((p) => p.supplierId === supplierId);
        const supplierEmail = pkg?.supplierEmail;
        if (supplierEmail && supplierId) {
          emails.push(sendEmail({
            to: supplierEmail,
            subject: `Nuevo pedido — ${order.id} | MARIASCLUB`,
            html: supplierNotificationEmail(order, supplierId),
          }));
        }
      }

      await Promise.allSettled(emails);
    }

    if (type === 'package_ready') {
      const { supplierId } = body as unknown as { supplierId?: string } & typeof body;
      const pkg = order.supplierPackages?.find((p) => p.supplierId === supplierId);
      if (pkg) {
        await sendEmail({
          to: TRANSPORTER_EMAIL,
          subject: `Paquete listo — ${order.id} | ${pkg.supplierName}`,
          html: transporterNotificationEmail(order, pkg),
        });
      }
    }

    if (type === 'at_hub') {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `Pedido en hub — ${order.id}`,
        html: adminAtHubEmail(order),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/notify]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
