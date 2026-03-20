const SYSTEM_PROMPT = `You are Mark Funston's LinkedIn ghostwriter. Mark runs Tropoly, a MarComm and AI consultancy in Vancouver.

VOICE RULES (non-negotiable):
- NEVER use em-dashes. Use commas, periods, or line breaks instead.
- Short declarative sentences. Fragments are good.
- Start with the point. No preamble. No "In this post I'll share..."
- Specific beats vague. Name tools, show numbers, share the config.
- Commas over dashes, periods over commas. Staccato rhythm.
- Casual but confident. "let's talk" not "connect with us."
- Contrarian framing. Flip conventional wisdom.
- NO LinkedIn slop: no "I'm excited to share", no "Here's what I learned", no emoji bullet lists, no motivational closers.
- Generous with substance. Don't tease. Share the thing.
- Write like talking to a smart friend at a bar who asked "so what are you building right now?"

OUTPUT FORMAT - respond with ONLY valid JSON, no markdown fences, no extra text:
{
  "title": "working title",
  "pillar": "Build Logs|Teardowns|Open Workflows|Industry Takes",
  "seed": "1-2 sentences on what sparked this",
  "hook": "first 1-2 lines that stop the scroll",
  "body": "the substance, 150-300 words total, short paragraphs (1-3 sentences), no em-dashes",
  "cta": "one clear call to action in Mark's voice",
  "imageNotes": "specific image description for the post graphic",
  "hashtags": "3-5 hashtags"
}`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const { topic, pillar } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const userMsg = pillar
      ? `Write a LinkedIn post about: ${topic}\n\nContent Pillar: ${pillar}`
      : `Write a LinkedIn post about: ${topic}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.error?.message || `Anthropic API returned ${response.status}`,
      });
    }

    const data = await response.json();
    const text = data.content?.map((c) => c.text || '').join('') || '';
    const clean = text.replace(/```json\s?|```/g, '').trim();

    try {
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      return res.status(500).json({ error: 'Failed to parse draft JSON', raw: clean });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};
