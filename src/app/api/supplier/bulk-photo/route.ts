import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType, productType, baseModelName } = await req.json() as {
      image: string;
      mimeType: string;
      productType: string;
      baseModelName: string;
    };

    if (!image || !mimeType) {
      return NextResponse.json({ error: 'Se requiere imagen y tipo MIME.' }, { status: 400 });
    }

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
              text: `Esta imagen muestra diferentes modelos/variantes de: "${baseModelName}" (tipo de producto: ${productType || 'general'}).

Identifica CADA variante, modelo o color diferente que puedas ver en la imagen de forma INDEPENDIENTE.
Para cada variante devuelve ÚNICAMENTE un JSON array válido, sin texto adicional:
[
  {
    "name": "nombre descriptivo específico de esta variante (incluye modelo base más variante)",
    "color": "color principal de esta variante",
    "variant": "descripción de la variante (ej: 'Estampado floral', 'Liso', 'A rayas', 'Logo bordado')",
    "description": "descripción breve del producto para la tienda",
    "imageSearchQuery": "búsqueda en inglés para encontrar foto similar en Unsplash (ej: 'baseball cap black logo', 'snapback hat red')"
  }
]
Sé muy específico. Si ves 8 gorras distintas, devuelve 8 objetos. Responde SOLO con el JSON array.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No se pudo procesar la imagen.' }, { status: 500 });
    }

    const raw = textBlock.text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let variants;
    try {
      variants = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'No se identificaron variantes en la imagen. Intenta con una imagen más clara.', raw: textBlock.text }, { status: 422 });
    }

    return NextResponse.json({ variants });
  } catch (err) {
    console.error('Bulk photo error:', err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'API key inválida. Verifica ANTHROPIC_API_KEY.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al procesar la imagen. Intenta de nuevo.' }, { status: 500 });
  }
}
