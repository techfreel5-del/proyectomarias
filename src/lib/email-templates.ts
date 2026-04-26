import type { LocalOrder, SupplierPackage } from './orders-store';

const BRAND_TEAL = '#00C9B1';
const BRAND_BLACK = '#0A0A0A';

function base(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:32px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #E5E5E5;max-width:560px;width:100%">
      <tr><td style="background:${BRAND_BLACK};padding:24px 32px">
        <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:1px">MARIASCLUB</span>
      </td></tr>
      <tr><td style="padding:32px">
        <h2 style="margin:0 0 16px;color:${BRAND_BLACK};font-size:18px">${title}</h2>
        ${body}
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #E5E5E5">
        <p style="margin:0;font-size:11px;color:#999">Zamora, Michoacán, México · mariasclub.com</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function itemsTable(order: LocalOrder): string {
  const rows = order.items.map((i) => `
    <tr>
      <td style="padding:6px 0;color:#444;font-size:13px">${i.name} × ${i.qty}${i.size || i.color ? ` <span style="color:#999">(${[i.color, i.size].filter(Boolean).join(' · ')})</span>` : ''}</td>
      <td style="padding:6px 0;text-align:right;font-weight:bold;font-size:13px">$${(i.price * i.qty).toFixed(2)}</td>
    </tr>`).join('');
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;border-top:1px solid #E5E5E5">
    ${rows}
    <tr style="border-top:1px solid #E5E5E5">
      <td style="padding:8px 0;font-weight:bold;font-size:14px;color:${BRAND_BLACK}">Total</td>
      <td style="padding:8px 0;text-align:right;font-weight:bold;font-size:14px;color:${BRAND_BLACK}">$${order.total.toFixed(2)}</td>
    </tr>
  </table>`;
}

export function orderConfirmationEmail(order: LocalOrder, trackingUrl: string): string {
  const body = `
    <p style="color:#444;font-size:14px;margin:0 0 8px">Hola <strong>${order.customer.name}</strong>, tu pedido fue registrado.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F5;border-radius:8px;padding:12px;margin:12px 0">
      <tr><td style="font-size:12px;color:#666">Pedido</td><td style="font-size:12px;font-weight:bold;text-align:right">${order.id}</td></tr>
      <tr><td style="font-size:12px;color:#666">Entrega</td><td style="font-size:12px;text-align:right">${order.customer.address}, ${order.customer.zone}</td></tr>
      <tr><td style="font-size:12px;color:#666">Pago</td><td style="font-size:12px;text-align:right">${order.isAdvance ? `Anticipo $${order.amountPaid.toFixed(2)}` : 'Pago completo'}</td></tr>
    </table>
    ${itemsTable(order)}
    <a href="${trackingUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:${BRAND_BLACK};color:#fff;text-decoration:none;font-weight:bold;font-size:13px;border-radius:6px">
      Rastrear mi pedido →
    </a>`;
  return base('¡Pedido confirmado!', body);
}

export function supplierNotificationEmail(order: LocalOrder, supplierId: string): string {
  const myItems = order.items.filter((i) => i.supplierId === supplierId);
  const supplierName = myItems[0]?.supplierName ?? supplierId;
  const rows = myItems.map((i) => `
    <tr>
      <td style="padding:6px 0;color:#444;font-size:13px">${i.name} × ${i.qty}${i.size || i.color ? ` (${[i.color, i.size].filter(Boolean).join(' · ')})` : ''}</td>
      <td style="padding:6px 0;text-align:right;font-size:13px">$${(i.price * i.qty).toFixed(2)}</td>
    </tr>`).join('');
  const body = `
    <p style="color:#444;font-size:14px;margin:0 0 8px">Hola <strong>${supplierName}</strong>, tienes un nuevo pedido que preparar.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F5;border-radius:8px;padding:12px;margin:12px 0">
      <tr><td style="font-size:12px;color:#666">Pedido</td><td style="font-size:12px;font-weight:bold;text-align:right">${order.id}</td></tr>
      <tr><td style="font-size:12px;color:#666">Cliente</td><td style="font-size:12px;text-align:right">${order.customer.name}</td></tr>
    </table>
    <p style="font-size:13px;font-weight:bold;color:${BRAND_BLACK};margin:16px 0 4px">Productos a preparar:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5E5E5">${rows}</table>
    <p style="font-size:12px;color:#888;margin-top:16px">Entra a tu portal para gestionar este pedido.</p>`;
  return base(`Nuevo pedido — ${order.id}`, body);
}

export function adminNotificationEmail(order: LocalOrder): string {
  const body = `
    <p style="color:#444;font-size:14px;margin:0 0 8px">Nuevo pedido recibido en la tienda.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F5;border-radius:8px;padding:12px;margin:12px 0">
      <tr><td style="font-size:12px;color:#666">ID</td><td style="font-size:12px;font-weight:bold;text-align:right">${order.id}</td></tr>
      <tr><td style="font-size:12px;color:#666">Cliente</td><td style="font-size:12px;text-align:right">${order.customer.name}</td></tr>
      <tr><td style="font-size:12px;color:#666">Total</td><td style="font-size:12px;font-weight:bold;text-align:right">$${order.total.toFixed(2)}</td></tr>
      <tr><td style="font-size:12px;color:#666">Zona</td><td style="font-size:12px;text-align:right">${order.customer.zone}</td></tr>
    </table>
    ${itemsTable(order)}`;
  return base(`Nuevo pedido — ${order.id}`, body);
}

export function transporterNotificationEmail(order: LocalOrder, pkg: SupplierPackage): string {
  const body = `
    <p style="color:#444;font-size:14px;margin:0 0 8px">El proveedor <strong>${pkg.supplierName}</strong> marcó su paquete como listo para recoger.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F5;border-radius:8px;padding:12px;margin:12px 0">
      <tr><td style="font-size:12px;color:#666">Pedido</td><td style="font-size:12px;font-weight:bold;text-align:right">${order.id}</td></tr>
      <tr><td style="font-size:12px;color:#666">Proveedor</td><td style="font-size:12px;text-align:right">${pkg.supplierName}</td></tr>
      <tr><td style="font-size:12px;color:#666">Productos</td><td style="font-size:12px;text-align:right">${pkg.itemIds.length} artículo(s)</td></tr>
    </table>
    <p style="font-size:12px;color:#888">Confirma la recepción en tu portal de transportista.</p>`;
  return base(`Paquete listo — ${order.id}`, body);
}

export function adminAtHubEmail(order: LocalOrder): string {
  const body = `
    <p style="color:#444;font-size:14px;margin:0 0 8px">El pedido <strong>${order.id}</strong> llegó al centro de distribución de Zamora.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F5;border-radius:8px;padding:12px;margin:12px 0">
      <tr><td style="font-size:12px;color:#666">Cliente</td><td style="font-size:12px;text-align:right">${order.customer.name}</td></tr>
      <tr><td style="font-size:12px;color:#666">Destino</td><td style="font-size:12px;text-align:right">${order.customer.address}, ${order.customer.zone}</td></tr>
      <tr><td style="font-size:12px;color:#666">Total</td><td style="font-size:12px;font-weight:bold;text-align:right">$${order.total.toFixed(2)}</td></tr>
    </table>
    <p style="font-size:12px;color:#888">Asigna un repartidor y márcalo en camino desde el panel de admin.</p>`;
  return base(`En centro de distribución — ${order.id}`, body);
}
