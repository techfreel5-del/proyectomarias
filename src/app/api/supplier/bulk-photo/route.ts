import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

interface RawDetection {
  tipo?: string;
  confianza_recorte?: string;
  bbox: { x: number; y: number; w: number; h: number };
  nota?: string;
}

interface ProcessedProduct {
  tipo: string;
  confianza_recorte: 'high' | 'low';
  croppedImage: string;
  bbox: { x: number; y: number; w: number; h: number };
}

// ── Trim filas oscuras desde abajo (repisa negra / superficie oscura) ─────────
// Para gorras en repisas: detecta filas donde >40% de píxeles tienen brillo < 55
// y las elimina del crop. Protección: nunca recorta más del 50% de la altura.
async function trimDarkEdges(buf: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buf)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const limit = Math.floor(height * 0.50);

  let trimBottom = 0;
  for (let row = height - 1; row >= limit; row--) {
    let darkCount = 0;
    for (let col = 0; col < width; col++) {
      const idx = (row * width + col) * channels;
      const brightness = ((data as Buffer)[idx] + (data as Buffer)[idx + 1] + (data as Buffer)[idx + 2]) / 3;
      if (brightness < 55) darkCount++;
    }
    if (darkCount / width > 0.40) trimBottom++;
    else break;
  }

  if (trimBottom > 4) {
    return sharp(buf)
      .extract({ left: 0, top: 0, width, height: height - trimBottom })
      .toBuffer();
  }
  return buf;
}

// ── Trim bordes con fondo uniforme (todos los tipos) ──────────────────────────
// Detecta el color de fondo como la mediana de los píxeles perimetrales (5px) y
// recorta bordes donde >80% de píxeles estén dentro de ±35 de ese color.
// Máximo recorte: 15% de cada lado.
async function trimUniformBorder(buf: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buf)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const d = data as Buffer;
  const rim = 5; // px perimetrales a muestrear
  const samples: number[] = [];

  for (let col = 0; col < width; col++) {
    for (let r = 0; r < rim; r++) {
      const idx = (r * width + col) * channels;
      samples.push((d[idx] + d[idx + 1] + d[idx + 2]) / 3);
      const idxB = ((height - 1 - r) * width + col) * channels;
      samples.push((d[idxB] + d[idxB + 1] + d[idxB + 2]) / 3);
    }
  }
  for (let row = 0; row < height; row++) {
    for (let r = 0; r < rim; r++) {
      const idx = (row * width + r) * channels;
      samples.push((d[idx] + d[idx + 1] + d[idx + 2]) / 3);
      const idxR = (row * width + (width - 1 - r)) * channels;
      samples.push((d[idxR] + d[idxR + 1] + d[idxR + 2]) / 3);
    }
  }

  samples.sort((a, b) => a - b);
  const bgBrightness = samples[Math.floor(samples.length / 2)];
  const tol = 35;
  const threshold = 0.80;
  const maxTrim = 0.15;

  function isBgRow(row: number): boolean {
    let match = 0;
    for (let col = 0; col < width; col++) {
      const idx = (row * width + col) * channels;
      const b = (d[idx] + d[idx + 1] + d[idx + 2]) / 3;
      if (Math.abs(b - bgBrightness) < tol) match++;
    }
    return match / width > threshold;
  }

  function isBgCol(col: number): boolean {
    let match = 0;
    for (let row = 0; row < height; row++) {
      const idx = (row * width + col) * channels;
      const b = (d[idx] + d[idx + 1] + d[idx + 2]) / 3;
      if (Math.abs(b - bgBrightness) < tol) match++;
    }
    return match / height > threshold;
  }

  const maxPx = Math.floor(Math.min(width, height) * maxTrim);

  let top = 0;
  while (top < maxPx && isBgRow(top)) top++;

  let bottom = 0;
  while (bottom < maxPx && isBgRow(height - 1 - bottom)) bottom++;

  let left = 0;
  while (left < maxPx && isBgCol(left)) left++;

  let right = 0;
  while (right < maxPx && isBgCol(width - 1 - right)) right++;

  const newW = width - left - right;
  const newH = height - top - bottom;
  if (newW < 10 || newH < 10) return buf;
  if (top === 0 && bottom === 0 && left === 0 && right === 0) return buf;

  return sharp(buf)
    .extract({ left, top, width: newW, height: newH })
    .toBuffer();
}

// ── Composición final en canvas 800×800 blanco con 10% padding ───────────────
async function composeOnWhite(buf: Buffer): Promise<Buffer> {
  const side = 800;
  const padding = Math.round(side * 0.10);
  const available = side - padding * 2;

  const meta = await sharp(buf).metadata();
  const cw = meta.width ?? 1;
  const ch = meta.height ?? 1;
  const scale = Math.min(available / cw, available / ch);
  const dw = Math.round(cw * scale);
  const dh = Math.round(ch * scale);
  const offsetX = Math.round((side - dw) / 2);
  const offsetY = Math.round((side - dh) / 2);

  const resized = await sharp(buf).resize(dw, dh).png().toBuffer();

  return sharp({
    create: { width: side, height: side, channels: 3, background: { r: 255, g: 255, b: 255 } },
  })
    .composite([{ input: resized, left: offsetX, top: offsetY }])
    .png()
    .toBuffer();
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'PENDIENTE_API' }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const { image, mimeType, productType } = await req.json() as {
      image: string;
      mimeType: string;
      productType: string;
    };

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Se requiere imagen y tipo MIME.' }, { status: 400 });
    }

    const tipo = productType?.trim() || 'artículo';

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: image,
              },
            },
            {
              type: 'text',
              text: `Eres un especialista en detección de productos para inventario de tienda. Los artículos a detectar son de tipo "${tipo}".

PASO 1 — Cuenta cada artículo físico individual en la imagen (aunque sean del mismo modelo, cada pieza cuenta por separado).

PASO 2 — Para cada artículo devuelve:
  • "tipo": "gorra" si es una gorra/cap/sombrero/hat, "otro" para cualquier otra cosa.
  • "confianza_recorte": "high" si el artículo tiene bordes claramente definidos y está separado del fondo. "low" si hay solapamiento, sombras fuertes o un fondo oscuro que contamina los bordes del producto.
  • "bbox": caja ajustada al contorno del PRODUCTO únicamente (no la repisa, no las etiquetas colgantes, no las sombras proyectadas). Proporciones 0.0–1.0 de la imagen completa.
  • "nota": descripción breve de cualquier condición especial (opcional, puede omitirse).

REGLAS ESPECIALES PARA GORRAS:
  • Si la gorra descansa sobre una repisa u objeto oscuro, la bbox debe terminar en la base de la copa de la gorra, ANTES de la repisa o superficie de apoyo.
  • Si dos gorras se solapan, detecta cada una por separado con su propia bbox. La gorra delantera define su propio límite superior; la trasera recibe la bbox del área visible que no cubre la delantera.
  • Asigna "confianza_recorte": "low" cuando una gorra tape parcialmente a otra o cuando la repisa sea muy oscura y difícil de separar visualmente.

FORMATO DE RESPUESTA — Devuelve ÚNICAMENTE el JSON array, sin texto adicional, sin bloques de código, sin comentarios:
[
  { "tipo": "gorra", "confianza_recorte": "high", "bbox": { "x": 0.05, "y": 0.10, "w": 0.18, "h": 0.32 } },
  { "tipo": "gorra", "confianza_recorte": "low",  "bbox": { "x": 0.30, "y": 0.08, "w": 0.20, "h": 0.35 }, "nota": "solapada con gorra anterior" }
]`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No se pudo procesar la imagen.' }, { status: 500 });
    }

    // Strip markdown code fences if present
    const raw = textBlock.text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let parsed: RawDetection[];
    try {
      parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('not an array');
    } catch {
      return NextResponse.json(
        { error: 'No se detectaron artículos. Intenta con una imagen más clara y bien iluminada.', raw: textBlock.text },
        { status: 422 },
      );
    }

    // Validate and clamp bboxes
    const validated = parsed
      .filter((item) => {
        const b = item?.bbox;
        return b && typeof b.x === 'number' && typeof b.y === 'number' &&
          typeof b.w === 'number' && typeof b.h === 'number';
      })
      .map((item) => {
        const b = item.bbox;
        return {
          tipo: typeof item.tipo === 'string' ? item.tipo.toLowerCase() : 'otro',
          confianza_recorte: item.confianza_recorte === 'low' ? 'low' : 'high' as 'high' | 'low',
          bbox: {
            x: Math.max(0, Math.min(1, b.x)),
            y: Math.max(0, Math.min(1, b.y)),
            w: Math.max(0.02, Math.min(1, b.w)),
            h: Math.max(0.02, Math.min(1, b.h)),
          },
        };
      })
      .filter((item) => item.bbox.w * item.bbox.h > 0.001);

    // Non-maximum suppression — IoU threshold diferenciado por tipo:
    // gorras: 0.45 (pueden solaparse físicamente), otros: 0.25
    const sorted = [...validated].sort((a, b) => (b.bbox.w * b.bbox.h) - (a.bbox.w * a.bbox.h));
    const nmsResult: typeof sorted = [];
    for (const item of sorted) {
      const box = item.bbox;
      const iouThreshold = item.tipo === 'gorra' ? 0.45 : 0.25;
      const overlaps = nmsResult.some((kept) => {
        if (item.tipo !== kept.tipo) return false; // no suprimir entre tipos distintos
        const kb = kept.bbox;
        const ix1 = Math.max(box.x, kb.x);
        const iy1 = Math.max(box.y, kb.y);
        const ix2 = Math.min(box.x + box.w, kb.x + kb.w);
        const iy2 = Math.min(box.y + box.h, kb.y + kb.h);
        if (ix2 <= ix1 || iy2 <= iy1) return false;
        const inter = (ix2 - ix1) * (iy2 - iy1);
        const union = box.w * box.h + kb.w * kb.h - inter;
        return inter / union > iouThreshold;
      });
      if (!overlaps) nmsResult.push(item);
    }

    if (nmsResult.length === 0) {
      return NextResponse.json(
        { error: 'No se detectaron artículos válidos. Intenta con una imagen más clara.' },
        { status: 422 },
      );
    }

    // Sharp processing por artículo
    const imgBuffer = Buffer.from(image, 'base64');
    const metadata = await sharp(imgBuffer).metadata();
    const imgW = metadata.width ?? 1;
    const imgH = metadata.height ?? 1;

    const products: ProcessedProduct[] = await Promise.all(
      nmsResult.map(async ({ tipo: itemTipo, confianza_recorte, bbox }) => {
        try {
          // Extracción con 2% de padding
          const pad = 0.02;
          const cropX = Math.max(0, bbox.x - pad);
          const cropY = Math.max(0, bbox.y - pad);
          const cropW = Math.min(1 - cropX, bbox.w + pad * 2);
          const cropH = Math.min(1 - cropY, bbox.h + pad * 2);

          const left   = Math.round(cropX * imgW);
          const top    = Math.round(cropY * imgH);
          const width  = Math.max(1, Math.round(cropW * imgW));
          const height = Math.max(1, Math.round(cropH * imgH));

          let crop = await sharp(imgBuffer)
            .extract({ left, top, width, height })
            .png()
            .toBuffer();

          // Modo Gorra: eliminar repisa oscura desde abajo
          if (itemTipo === 'gorra') {
            crop = await trimDarkEdges(crop);
          }

          // Todos los tipos: limpiar bordes con fondo uniforme
          crop = await trimUniformBorder(crop);

          // Composición final en canvas 800×800 blanco
          const finalBuf = await composeOnWhite(crop);
          const croppedImage = `data:image/png;base64,${finalBuf.toString('base64')}`;

          return { tipo: itemTipo, confianza_recorte, croppedImage, bbox };
        } catch (sharpErr) {
          console.error('Sharp processing error:', sharpErr);
          return {
            tipo: itemTipo,
            confianza_recorte,
            croppedImage: `data:${mimeType};base64,${image}`,
            bbox,
          };
        }
      }),
    );

    return NextResponse.json({ products });
  } catch (err) {
    console.error('Bulk photo error:', err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'API key inválida. Verifica ANTHROPIC_API_KEY.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al procesar la imagen. Intenta de nuevo.' }, { status: 500 });
  }
}
