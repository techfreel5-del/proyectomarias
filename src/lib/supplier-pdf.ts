import { BankInfo } from './supplier-context';

export interface OrderPDFParams {
  orderId: string;
  createdAt: string;
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  customer: { name: string; phone: string; email: string; address: string };
  items: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  shippingMethod: string;
  shippingCost: number;
  total: number;
  bankInfo: BankInfo;
}

export async function downloadOrderPDF(params: OrderPDFParams): Promise<void> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Colores ──────────────────────────────
  const darkGray = '#1A1A1A';
  const midGray  = '#555555';
  const lightGray = '#AAAAAA';
  const boxBg = '#F5F5F5';
  const accentBlue = '#1E3A5F';

  const setColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    doc.setTextColor(r, g, b);
  };

  const setFill = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    doc.setFillColor(r, g, b);
  };

  const setDraw = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    doc.setDrawColor(r, g, b);
  };

  // ── Encabezado ──────────────────────────
  setFill(accentBlue);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(params.storeName, margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 215, 230);
  doc.text('COMPROBANTE DE PEDIDO', margin, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(params.orderId, pageW - margin, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(200, 215, 230);
  const fechaStr = new Date(params.createdAt).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  doc.text(fechaStr, pageW - margin, 20, { align: 'right' });

  y = 38;

  // ── Datos del cliente ────────────────────
  setColor(darkGray);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Datos del cliente', margin, y);
  y += 5;

  setDraw('#DDDDDD');
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  const clientRows = [
    ['Nombre',   params.customer.name],
    ['Teléfono', params.customer.phone],
    ...(params.customer.email ? [['Correo', params.customer.email]] : []),
    ['Dirección', params.customer.address],
    ['Entrega',  params.shippingMethod],
  ];

  doc.setFontSize(9);
  for (const [label, value] of clientRows) {
    setColor(lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text(label + ':', margin, y);
    setColor(darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text(value, margin + 28, y);
    y += 6;
  }

  y += 4;

  // ── Tabla de productos ───────────────────
  setColor(darkGray);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Productos del pedido', margin, y);
  y += 5;

  setDraw('#DDDDDD');
  doc.line(margin, y, pageW - margin, y);
  y += 2;

  // Cabecera tabla
  setFill(boxBg);
  doc.rect(margin, y, contentW, 8, 'F');
  setColor(midGray);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Producto', margin + 2, y + 5.5);
  doc.text('Cant.', margin + contentW * 0.65, y + 5.5);
  doc.text('Precio unit.', margin + contentW * 0.75, y + 5.5);
  doc.text('Total', margin + contentW - 2, y + 5.5, { align: 'right' });
  y += 8;

  // Filas de productos
  doc.setFont('helvetica', 'normal');
  for (let i = 0; i < params.items.length; i++) {
    const item = params.items[i];
    if (i % 2 === 0) {
      setFill('#FAFAFA');
      doc.rect(margin, y, contentW, 7, 'F');
    }
    setColor(darkGray);
    doc.setFontSize(8);

    // Truncar nombre si es muy largo
    const maxNameW = contentW * 0.6;
    let name = item.name;
    while (doc.getTextWidth(name) > maxNameW && name.length > 5) {
      name = name.slice(0, -1);
    }
    if (name !== item.name) name += '…';

    doc.text(name, margin + 2, y + 5);
    doc.text(String(item.qty), margin + contentW * 0.65, y + 5);
    doc.text(`$${item.price.toFixed(2)}`, margin + contentW * 0.75, y + 5);
    doc.text(`$${(item.price * item.qty).toFixed(2)}`, margin + contentW - 2, y + 5, { align: 'right' });
    y += 7;
  }

  y += 4;

  // ── Totales ──────────────────────────────
  const totalsX = margin + contentW * 0.55;
  const totalsW = contentW * 0.45;

  const totalsRows = [
    ['Subtotal', `$${params.subtotal.toFixed(2)} MXN`],
    [`Envío (${params.shippingMethod})`, params.shippingCost === 0 ? 'Gratis' : `$${params.shippingCost.toFixed(2)} MXN`],
  ];

  setFill(boxBg);
  doc.rect(totalsX, y, totalsW, totalsRows.length * 7 + 10, 'F');
  y += 4;

  for (const [label, value] of totalsRows) {
    setColor(midGray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(label, totalsX + 3, y);
    setColor(darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text(value, totalsX + totalsW - 3, y, { align: 'right' });
    y += 7;
  }

  // Total final
  setFill(accentBlue);
  doc.rect(totalsX, y, totalsW, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL FINAL', totalsX + 3, y + 7);
  doc.text(`$${params.total.toFixed(2)} MXN`, totalsX + totalsW - 3, y + 7, { align: 'right' });
  y += 18;

  // ── Datos bancarios ──────────────────────
  const bank = params.bankInfo;
  if (bank.bank || bank.clabe || bank.beneficiary) {
    setColor(darkGray);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Datos para transferencia bancaria', margin, y);
    y += 5;

    setDraw('#DDDDDD');
    doc.line(margin, y, pageW - margin, y);
    y += 4;

    setFill('#FFF8E1');
    const bankBoxH = 8 + [
      bank.beneficiary, bank.bank, bank.accountNumber, bank.clabe, bank.concept,
    ].filter(Boolean).length * 6;
    doc.rect(margin, y, contentW, bankBoxH, 'F');

    setDraw('#F59E0B');
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentW, bankBoxH);
    doc.setLineWidth(0.3);

    y += 5;
    const bankRows: [string, string][] = [];
    if (bank.beneficiary)    bankRows.push(['Beneficiario', bank.beneficiary]);
    if (bank.bank)           bankRows.push(['Banco',        bank.bank]);
    if (bank.accountNumber)  bankRows.push(['Cuenta',       bank.accountNumber]);
    if (bank.clabe)          bankRows.push(['CLABE',        bank.clabe]);
    if (bank.concept)        bankRows.push(['Concepto',     `${bank.concept}`]);

    for (const [label, value] of bankRows) {
      setColor(lightGray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(label + ':', margin + 3, y);
      setColor(darkGray);
      doc.setFont('helvetica', 'bold');
      doc.text(value, margin + 35, y);
      y += 6;
    }

    y += 6;
  }

  // ── Instrucción ──────────────────────────
  setFill('#E8F5E9');
  doc.rect(margin, y, contentW, 18, 'F');
  setDraw('#4CAF50');
  doc.setLineWidth(0.5);
  doc.rect(margin, y, contentW, 18);
  doc.setLineWidth(0.3);

  setColor('#1B5E20');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Instrucciones para confirmar tu pedido:', margin + 3, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Realiza la transferencia a los datos bancarios indicados.', margin + 3, y + 11);
  doc.text('2. Envía este PDF y el comprobante de pago por WhatsApp al proveedor.', margin + 3, y + 16);

  y += 24;

  // ── Pie de página ────────────────────────
  setColor(lightGray);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    `Generado por MARIASCLUB™ — ${new Date().toLocaleDateString('es-MX')}`,
    pageW / 2, y, { align: 'center' },
  );

  doc.save(`pedido-${params.orderId}.pdf`);
}

export function buildWhatsAppUrl(params: {
  whatsappNumber: string;
  orderId: string;
  storeName: string;
  customer: { name: string; phone: string; address: string };
  items: Array<{ name: string; qty: number; price: number }>;
  shippingMethod: string;
  shippingCost: number;
  total: number;
  bankInfo: BankInfo;
}): string {
  const lines = [
    `*NUEVO PEDIDO — ${params.storeName}*`,
    `Pedido: ${params.orderId}`,
    `Fecha: ${new Date().toLocaleDateString('es-MX')}`,
    ``,
    `*CLIENTE*`,
    `Nombre: ${params.customer.name}`,
    `Teléfono: ${params.customer.phone}`,
    `Dirección: ${params.customer.address}`,
    ``,
    `*PRODUCTOS*`,
    ...params.items.map((i) => `• ${i.name} × ${i.qty} = $${(i.price * i.qty).toFixed(2)}`),
    ``,
    `*Envío:* ${params.shippingMethod} — ${params.shippingCost === 0 ? 'Gratis' : `$${params.shippingCost.toFixed(2)}`}`,
    `*TOTAL A PAGAR: $${params.total.toFixed(2)} MXN*`,
    ``,
    ...(params.bankInfo.bank ? [
      `*DATOS PARA TRANSFERENCIA*`,
      ...(params.bankInfo.beneficiary ? [`Beneficiario: ${params.bankInfo.beneficiary}`] : []),
      `Banco: ${params.bankInfo.bank}`,
      ...(params.bankInfo.accountNumber ? [`Cuenta: ${params.bankInfo.accountNumber}`] : []),
      ...(params.bankInfo.clabe ? [`CLABE: ${params.bankInfo.clabe}`] : []),
      ...(params.bankInfo.concept ? [`Concepto: ${params.bankInfo.concept} ${params.orderId}`] : []),
      ``,
    ] : []),
    `_Por favor adjunta el PDF descargado y el comprobante de transferencia para confirmar tu pedido._`,
  ];

  const text = encodeURIComponent(lines.join('\n'));
  const number = params.whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${number}?text=${text}`;
}
