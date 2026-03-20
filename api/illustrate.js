const STYLE_PREFIX = `Flat geometric modern illustration style. Clean vector shapes, bold solid colors on dark navy background, minimal detail, abstract and stylized. No photorealism. No text or words in the image. LinkedIn post graphic, square 1:1 format.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
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
            return res.status(200).json({
              image: part.inlineData.data,
              mimeType: part.inlineData.mimeType,
            });
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
      return res.status(500).json({ error: imagenData.error.message || 'Image generation failed' });
    }

    const predictions = imagenData.predictions || [];
    if (predictions.length > 0 && predictions[0].bytesBase64Encoded) {
      return res.status(200).json({
        image: predictions[0].bytesBase64Encoded,
        mimeType: predictions[0].mimeType || 'image/png',
      });
    }

    return res.status(500).json({ error: 'No image returned. Try rephrasing the prompt.' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};
