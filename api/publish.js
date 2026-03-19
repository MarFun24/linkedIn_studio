const NOTION_DB_ID = '2851ab64-5104-807c-a391-000b1f0400ee';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    const { draft } = req.body;

    if (!draft?.title) {
      return res.status(400).json({ error: 'Draft is required' });
    }

    const contentType = draft.pillar === 'Industry Takes' ? 'News Response' : 'LinkedIn Post';

    const notionContent = `## Raw Idea / Seed
${draft.seed}
---
## Hook
${draft.hook}
---
## Body
${draft.body}
---
## Call to Action
${draft.cta}
---
## Image / Carousel Notes
${draft.imageNotes}
---
## Video Notes
N/A, text-only post
---
## Hashtag Bank
${draft.hashtags}
---
## Key Notes and Links
Generated via LinkedIn Content Studio`;

    const userMessage = `Create a new page in my Notion Content Calendar database.

Database ID: ${NOTION_DB_ID}

Properties to set:
- "Content Name": "${draft.title}"
- "Status": "Drafting"
- "Content Type": "${contentType}"
- "Content Pillar": "${draft.pillar}"

Page content (in Notion-flavored Markdown):

${notionContent}

After creating the page, respond with ONLY a JSON object in this format (no markdown fences):
{"success": true, "url": "the notion page url", "message": "brief confirmation"}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: userMessage }],
        mcp_servers: [
          {
            type: 'url',
            url: 'https://mcp.notion.com/mcp',
            name: 'notion-mcp',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errData?.error?.message || `Anthropic API returned ${response.status}`,
      });
    }

    const data = await response.json();

    // Extract text and tool results
    const textParts = data.content
      ?.filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n') || '';

    const toolResults = data.content
      ?.filter((c) => c.type === 'mcp_tool_result')
      .map((c) => c.content?.[0]?.text || '')
      .join('\n') || '';

    // Try to find a Notion URL in the response
    const allText = textParts + '\n' + toolResults;
    const urlMatch = allText.match(/https:\/\/(?:www\.)?notion\.so\/[^\s)"]+/);

    // Try to parse JSON from text response
    try {
      const clean = textParts.replace(/```json\s?|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.status(200).json(parsed);
    } catch {
      // Fallback: return what we have
      return res.status(200).json({
        success: true,
        url: urlMatch?.[0] || null,
        message: textParts || 'Published to Notion',
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
