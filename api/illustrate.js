const STYLE_PREFIX = `Flat geometric modern illustration style. Clean vector shapes, bold solid colors on dark navy background, minimal detail, abstract and stylized. No photorealism. No text or words in the image. LinkedIn post graphic, square 1:1 format.`;

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const fullPrompt = `${STYLE_PREFIX}\n\nSubject: ${prompt}`;

    // Try Gemini native image generation
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        }),
      }
    );

    const geminiData = await geminiResp.json();

    if (!geminiData.error) {
      const candidates = geminiData.candidates || [];
      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            return new Response(JSON.stringify({
              image: part.inlineData.data,
              mimeType: part.inlineData.mimeType,
            }), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        }
      }
    }

    // Fallback to Imagen 3
    const imagenResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: fullPrompt }],
          parameters: { aspectRatio: '1:1', sampleCount: 1 },
        }),
      }
    );

    const imagenData = await imagenResp.json();

    if (imagenData.error) {
      return new Response(JSON.stringify({ error: imagenData.error.message || 'Image generation failed' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }

    const predictions = imagenData.predictions || [];
    if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
      return new Response(JSON.stringify({
        image: predictions[0].bytesBase64Encoded,
        mimeType: predictions[0].mimeType || 'image/png',
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'No image returned. Try rephrasing the prompt.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
