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
              text: `En esta imagen hay varios artículos de tipo "${tipo}" exhibidos juntos.

Tu tarea: detectar CADA artículo individual visible y devolver su ubicación en la imagen.

Devuelve ÚNICAMENTE un JSON array válido, sin texto adicional ni bloques de código:
[
  { "x": 0.05, "y": 0.10, "w": 0.20, "h": 0.35 },
  { "x": 0.30, "y": 0.10, "w": 0.18, "h": 0.33 }
]

Reglas:
- x, y: esquina superior izquierda del artículo como proporción del ancho/alto total (0.0 a 1.0)
- w, h: ancho y alto del artículo como proporción del ancho/alto total (0.0 a 1.0)
- Incluye un pequeño margen alrededor de cada artículo (~0.01 a 0.02)
- Si ves 5 artículos distintos, devuelve 5 entradas
- Si ves el mismo modelo repetido, devuelve una entrada por cada unidad visible
- Todos los valores deben estar entre 0.0 y 1.0
- Responde SOLO con el JSON array, sin ningún texto adicional`,
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
    const valid = boxes
      .filter((b) => typeof b.x === 'number' && typeof b.y === 'number' && typeof b.w === 'number' && typeof b.h === 'number')
      .map((b) => ({
        x: Math.max(0, Math.min(1, b.x)),
        y: Math.max(0, Math.min(1, b.y)),
        w: Math.max(0.02, Math.min(1, b.w)),
        h: Math.max(0.02, Math.min(1, b.h)),
      }))
      // Remove boxes that are unreasonably small (less than 2% of image)
      .filter((b) => b.w * b.h > 0.001);

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
