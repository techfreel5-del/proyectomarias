import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'PENDIENTE_API' }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const { image, mimeType } = await req.json() as { image: string; mimeType: string };

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
              text: `Analiza esta nota de remisión, factura o documento de compra.
Extrae TODOS los productos que aparecen y devuelve ÚNICAMENTE un JSON array válido, sin texto adicional, con este formato exacto:
[
  {
    "name": "nombre completo del producto",
    "sku": "código o SKU si está visible, si no usa una cadena vacía",
    "quantity": número entero de unidades,
    "unitPrice": precio unitario como número decimal,
    "description": "breve descripción del producto",
    "category": "categoría más apropiada (Fashion/Electronics/Appliances/Sports/Coffee/Hogar/Otro)"
  }
]
Si no puedes leer algún campo con certeza, usa tu mejor estimación. Responde SOLO con el JSON array, nada más.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No se pudo procesar la imagen.' }, { status: 500 });
    }

    // Extract JSON from response (remove markdown code blocks if present)
    const raw = textBlock.text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let products;
    try {
      products = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'No se encontraron productos en la imagen. Intenta con una imagen más clara.', raw: textBlock.text }, { status: 422 });
    }

    return NextResponse.json({ products });
  } catch (err) {
    console.error('OCR invoice error:', err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'API key inválida. Verifica ANTHROPIC_API_KEY.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Error al procesar la imagen. Intenta de nuevo.' }, { status: 500 });
  }
}
