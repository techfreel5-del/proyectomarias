import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

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
              text: `Eres un sistema de detección de objetos para fotografía de productos de tipo "${tipo}".

PASO 1 — Examina la imagen y cuenta con precisión cuántos artículos individuales distintos hay visibles (aunque sean del mismo modelo, cada unidad física cuenta por separado).

PASO 2 — Para cada artículo, traza una caja ajustada SOLO al contorno del producto:
  • La caja debe envolver el artículo con 1-2% de margen extra. Nada más.
  • NO incluyas artículos vecinos dentro de la caja.
  • Las cajas NO deben solaparse entre sí.
  • Si un artículo está parcialmente tapado, traza la caja alrededor de la parte visible.

FORMATO DE RESPUESTA — Devuelve ÚNICAMENTE el JSON array, sin texto, sin bloques de código:
[
  { "x": 0.05, "y": 0.10, "w": 0.18, "h": 0.32 },
  { "x": 0.30, "y": 0.08, "w": 0.20, "h": 0.35 }
]

Donde:
- x, y = esquina superior-izquierda del artículo (proporción 0.0–1.0 del tamaño total de la imagen)
- w, h = ancho y alto del artículo (proporción 0.0–1.0)
- Cada caja = exactamente 1 artículo físico
- Cero texto adicional`,
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

    let boxes: { x: number; y: number; w: number; h: number }[];
    try {
      boxes = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'No se detectaron artículos. Intenta con una imagen más clara y bien iluminada.', raw: textBlock.text },
        { status: 422 },
      );
    }

    // Validate and clamp all values to [0, 1]
    const clamped = boxes
      .filter((b) => typeof b.x === 'number' && typeof b.y === 'number' && typeof b.w === 'number' && typeof b.h === 'number')
      .map((b) => ({
        x: Math.max(0, Math.min(1, b.x)),
        y: Math.max(0, Math.min(1, b.y)),
        w: Math.max(0.02, Math.min(1, b.w)),
        h: Math.max(0.02, Math.min(1, b.h)),
      }))
      .filter((b) => b.w * b.h > 0.001);

    // Non-maximum suppression: elimina cajas muy solapadas (IoU > 0.25)
    // Conserva las más grandes (más probable que sean el artículo completo)
    const sorted = [...clamped].sort((a, b) => (b.w * b.h) - (a.w * a.h));
    const valid: typeof sorted = [];
    for (const box of sorted) {
      const overlaps = valid.some((kept) => {
        const ix1 = Math.max(box.x, kept.x);
        const iy1 = Math.max(box.y, kept.y);
        const ix2 = Math.min(box.x + box.w, kept.x + kept.w);
        const iy2 = Math.min(box.y + box.h, kept.y + kept.h);
        if (ix2 <= ix1 || iy2 <= iy1) return false;
        const inter = (ix2 - ix1) * (iy2 - iy1);
        const union = box.w * box.h + kept.w * kept.h - inter;
        return inter / union > 0.25;
      });
      if (!overlaps) valid.push(box);
    }

    if (valid.length === 0) {
      return NextResponse.json(
        { error: 'No se detectaron artículos válidos. Intenta con una imagen más clara.' },
        { status: 422 },
      );
    }

    return NextResponse.json({ boxes: valid });
  } catch (err) {
    console.error('Bulk photo error:', err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'API key inválida. Verifica ANTHROPIC_API_KEY.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al procesar la imagen. Intenta de nuevo.' }, { status: 500 });
  }
}
