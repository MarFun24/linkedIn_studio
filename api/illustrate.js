const STYLE_PREFIX = `Generate an image. Flat geometric modern illustration style. Clean vector shapes, bold solid colors on dark navy background, minimal detail, abstract and stylized. No photorealism. No text or words in the image. Square format.`;

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

    const models = [
      'gemini-2.0-flash-exp-image-generation',
      'gemini-2.5-flash-image',
      'gemini-2.0-flash-exp',
    ];

    const errors = [];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
            }),
          }
        );

        const data = await response.json();

        if (data.error) {
          errors.push(`${model}: ${data.error.message}`);
          continue;
        }

        const candidates = data.candidates || [];
        for (const candidate of candidates) {
          const parts = candidate.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData) {
              return res.status(200).json({
                image: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
                model: model,
              });
            }
          }
        }

        // Model responded but no image
        errors.push(`${model}: responded with text only, no image generated`);
      } catch (e) {
        errors.push(`${model}: ${e.message}`);
      }
    }

    return res.status(500).json({
      error: 'No image returned from any model.',
      details: errors,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};
