# LinkedIn Content Studio

Draft LinkedIn posts in Mark's voice (via Claude), generate flat/geometric illustrations (via Gemini), preview the full post, and push to Notion Content Calendar. One pipeline, four steps.

Built for [Tropoly](https://tropoly.ca).

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **API Routes**: Vercel Serverless Functions (Node.js)
- **Draft Engine**: Anthropic Claude (Sonnet 4) with custom voice system prompt
- **Illustration**: Google Gemini (Nano Banana) with flat/geometric style lock
- **Publishing**: Anthropic API + Notion MCP server → Content Calendar database

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USER/linkedin-content-studio.git
cd linkedin-content-studio
pnpm install
```

### 2. Environment variables

Copy the template and add your keys:

```bash
cp .env.example .env.local
```

```env
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
```

- **Anthropic key**: From [console.anthropic.com](https://console.anthropic.com)
- **Gemini key**: Free from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 3. Local development

The `/api/*` routes are Vercel serverless functions. Use the [Vercel CLI](https://vercel.com/docs/cli) for local dev:

```bash
npm i -g vercel
vercel dev
```

This runs both the Vite dev server and the API functions locally.

### 4. Deploy to Vercel

```bash
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard. Set `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` in your Vercel project Environment Variables.

## How It Works

### 01 Draft
Type a topic, pick a content pillar (Build Logs, Teardowns, Open Workflows, Industry Takes). Claude drafts the full post in Mark's voice: hook, body, CTA, image notes, hashtags. Edit any field inline.

### 02 Illustrate
Image notes from the draft auto-populate. Gemini generates a flat/geometric illustration. Regenerate or tweak the prompt until it's right.

### 03 Preview
See the complete post mocked up as a LinkedIn card with the illustration. Copy text, download image.

### 04 Publish
One click pushes the post to the Notion Content Calendar in "Drafting" status with all fields populated. The n8n auto-publish pipeline handles the rest.

## Project Structure

```
├── api/
│   ├── draft.js          # POST /api/draft → Anthropic Claude
│   ├── illustrate.js     # POST /api/illustrate → Gemini image gen
│   └── publish.js        # POST /api/publish → Anthropic + Notion MCP
├── src/
│   ├── App.tsx            # Main app, tab navigation, state
│   ├── components/
│   │   ├── Drafter.tsx    # Topic input + Claude draft + inline edit
│   │   ├── Illustrator.tsx # Image prompt + Gemini generation
│   │   ├── Preview.tsx    # LinkedIn post mockup
│   │   └── Publisher.tsx  # Notion push via MCP
│   ├── main.tsx
│   └── index.css
├── vercel.json            # Serverless routing config
├── .env.example           # Environment variable template
└── package.json
```

## API Routes

All routes accept POST with JSON body.

| Route | Body | Returns |
|-------|------|---------|
| `POST /api/draft` | `{ topic, pillar? }` | Full post draft as JSON |
| `POST /api/illustrate` | `{ prompt }` | `{ image (base64), mimeType }` |
| `POST /api/publish` | `{ draft }` | `{ success, url, message }` |

## Notion Integration

Publishes to Content Calendar database `2851ab64-5104-807c-a391-000b1f0400ee` via Anthropic MCP server protocol. The Notion MCP connection must be authorized for the publish step to work.

Properties set on creation:
- Content Name (title)
- Status: "Drafting"
- Content Type: "LinkedIn Post" or "News Response"
- Content Pillar: matches selected pillar

## License

Private. Tropoly internal tool.
