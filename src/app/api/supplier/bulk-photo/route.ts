import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

interface PolygonPoint { x: number; y: number; }

interface RawDetection {
  bbox: { x: number; y: number; w: number; h: number };
  polygon: unknown[];
}

interface ProcessedProduct {
  bbox: { x: number; y: number; w: number; h: number };
  polygon: PolygonPoint[];
  croppedImage: string;
}

function validatePolygon(pts: unknown): PolygonPoint[] | null {
  if (!Array.isArray(pts) || pts.length < 4) return null;
  const valid = pts.filter(
    (p) => p && typeof (p as PolygonPoint).x === 'number' && typeof (p as PolygonPoint).y === 'number' &&
      (p as PolygonPoint).x >= 0 && (p as PolygonPoint).x <= 1 &&
      (p as PolygonPoint).y >= 0 && (p as PolygonPoint).y <= 1,
  );
  return valid.length >= 4 ? (valid as PolygonPoint[]) : null;
}

function bboxToPolygonPoints(bbox: { x: number; y: number; w: number; h: number }): PolygonPoint[] {
  return [
    { x: bbox.x,            y: bbox.y },
    { x: bbox.x + bbox.w,   y: bbox.y },
    { x: bbox.x + bbox.w,   y: bbox.y + bbox.h },
    { x: bbox.x,            y: bbox.y + bbox.h },
  ];
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
      max_tokens: 4096,
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
              text: `Eres un sistema de detección de objetos para fotografía de productos de tipo "${tipo}".

TAREA — Detecta cada artículo físico individual en la imagen.

PASO 1: Cuenta con precisión cuántos artículos distintos hay (cada unidad física cuenta por separado, aunque sean del mismo modelo).

PASO 2: Para cada artículo devuelve:
  • "bbox": caja ajustada (esquina superior-izquierda + ancho/alto), proporciones 0.0–1.0 de la imagen total.
  • "polygon": 8 a 14 puntos que trazan el CONTORNO EXTERIOR del artículo en orden horario. Cada punto {x, y} en proporciones 0.0–1.0 de la imagen total. El polígono debe adherirse a la silueta real del producto, excluyendo fondo y artículos vecinos.

REGLAS:
  • bbox y polygon de un artículo NO deben incluir partes de artículos vecinos.
  • Si un artículo está parcialmente tapado, traza solo la parte visible.
  • Los polígonos NO deben solaparse entre sí.

FORMATO DE RESPUESTA — Devuelve ÚNICAMENTE el JSON array, sin texto, sin bloques de código, sin comentarios:
[
  {
    "bbox": { "x": 0.05, "y": 0.10, "w": 0.18, "h": 0.32 },
    "polygon": [
      { "x": 0.06, "y": 0.11 }, { "x": 0.14, "y": 0.10 },
      { "x": 0.22, "y": 0.15 }, { "x": 0.23, "y": 0.28 },
      { "x": 0.19, "y": 0.41 }, { "x": 0.08, "y": 0.42 },
      { "x": 0.05, "y": 0.35 }, { "x": 0.05, "y": 0.18 }
    ]
  }
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

    // Validate bboxes and polygons, apply fallback when polygon is invalid
    const validated = parsed
      .filter((item) => {
        const b = item?.bbox;
        return b && typeof b.x === 'number' && typeof b.y === 'number' &&
          typeof b.w === 'number' && typeof b.h === 'number';
      })
      .map((item) => {
        const b = item.bbox;
        const bbox = {
          x: Math.max(0, Math.min(1, b.x)),
          y: Math.max(0, Math.min(1, b.y)),
          w: Math.max(0.02, Math.min(1, b.w)),
          h: Math.max(0.02, Math.min(1, b.h)),
        };
        const polygon = validatePolygon(item.polygon) ?? bboxToPolygonPoints(bbox);
        return { bbox, polygon };
      })
      .filter((item) => item.bbox.w * item.bbox.h > 0.001);

    // Non-maximum suppression: elimina cajas muy solapadas (IoU > 0.25)
    const sorted = [...validated].sort((a, b) => (b.bbox.w * b.bbox.h) - (a.bbox.w * a.bbox.h));
    const nmsResult: typeof sorted = [];
    for (const item of sorted) {
      const box = item.bbox;
      const overlaps = nmsResult.some((kept) => {
        const kb = kept.bbox;
        const ix1 = Math.max(box.x, kb.x);
        const iy1 = Math.max(box.y, kb.y);
        const ix2 = Math.min(box.x + box.w, kb.x + kb.w);
        const iy2 = Math.min(box.y + box.h, kb.y + kb.h);
        if (ix2 <= ix1 || iy2 <= iy1) return false;
        const inter = (ix2 - ix1) * (iy2 - iy1);
        const union = box.w * box.h + kb.w * kb.h - inter;
        return inter / union > 0.25;
      });
      if (!overlaps) nmsResult.push(item);
    }

    if (nmsResult.length === 0) {
      return NextResponse.json(
        { error: 'No se detectaron artículos válidos. Intenta con una imagen más clara.' },
        { status: 422 },
      );
    }

    // Sharp server-side processing: crop + enhance each product
    const imgBuffer = Buffer.from(image, 'base64');
    const metadata = await sharp(imgBuffer).metadata();
    const imgW = metadata.width ?? 1;
    const imgH = metadata.height ?? 1;

    const products: ProcessedProduct[] = await Promise.all(
      nmsResult.map(async ({ bbox, polygon }) => {
        try {
          // 3% padding around bbox, clamped to image bounds
          const pad = 0.03;
          const cropX = Math.max(0, bbox.x - pad);
          const cropY = Math.max(0, bbox.y - pad);
          const cropW = Math.min(1 - cropX, bbox.w + pad * 2);
          const cropH = Math.min(1 - cropY, bbox.h + pad * 2);

          const left   = Math.round(cropX * imgW);
          const top    = Math.round(cropY * imgH);
          const width  = Math.max(1, Math.round(cropW * imgW));
          const height = Math.max(1, Math.round(cropH * imgH));

          const croppedBuf = await sharp(imgBuffer)
            .extract({ left, top, width, height })
            .sharpen({ sigma: 0.8 })
            .png()
            .toBuffer();

          const croppedImage = `data:image/png;base64,${croppedBuf.toString('base64')}`;

          // Normalize polygon coordinates to crop space [0,1]
          const normalizedPolygon: PolygonPoint[] = polygon.map((pt) => ({
            x: Math.max(0, Math.min(1, (pt.x * imgW - left) / width)),
            y: Math.max(0, Math.min(1, (pt.y * imgH - top) / height)),
          }));

          return { bbox, polygon: normalizedPolygon, croppedImage };
        } catch (sharpErr) {
          console.error('Sharp crop error:', sharpErr);
          // Fallback: return full image with unit polygon covering entire crop
          const croppedImage = `data:${mimeType};base64,${image}`;
          return {
            bbox,
            polygon: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }],
            croppedImage,
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
