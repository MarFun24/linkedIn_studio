import { useState } from 'react'
import type { PostDraft } from '../App.tsx'

const mono: React.CSSProperties = { fontFamily: 'DM Mono, monospace' }
const sora: React.CSSProperties = { fontFamily: 'Sora, sans-serif' }

interface Props {
  draft: PostDraft | null
}

export function Publisher({ draft }: Props) {
  const [status, setStatus] = useState<'idle' | 'publishing' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<{ url?: string; message?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!draft) {
    return (
      <div className="bg-[#0f1629] border border-amber-500/20 rounded-lg p-6 text-center">
        <p className="text-amber-400 text-sm" style={mono}>Create a draft first before publishing.</p>
      </div>
    )
  }

  const contentType = draft.pillar === 'Industry Takes' ? 'News Response' : 'LinkedIn Post'

  const publish = async () => {
    setStatus('publishing')
    setError(null)

    try {
      const resp = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.error || `API returned ${resp.status}`)
      }

      setResult(data)
      setStatus('done')
    } catch (err: any) {
      setError(err.message || 'Failed to publish')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1629] border border-[#1a2236] rounded-lg p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-5" style={sora}>Publish to Notion</h2>

        {/* Summary */}
        <div className="space-y-3 mb-6">
          <Row label="Title" value={draft.title} />
          <Row label="Pillar">
            <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20" style={mono}>
              {draft.pillar}
            </span>
          </Row>
          <Row label="Type" value={contentType} />
          <Row label="Status">
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20" style={mono}>
              Drafting
            </span>
          </Row>
        </div>

        {/* Content Preview */}
        <details className="mb-6 group">
          <summary className="text-xs text-[#6b7a94] uppercase tracking-wider cursor-pointer hover:text-teal-400 transition-colors" style={mono}>
            Preview Notion content ▸
          </summary>
          <pre className="mt-3 p-4 bg-[#0a0f1a] border border-[#1a2236] rounded text-xs text-[#8a95a8] whitespace-pre-wrap overflow-auto max-h-72" style={mono}>
{`## Raw Idea / Seed
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
## Hashtag Bank
${draft.hashtags}`}
          </pre>
        </details>

        {/* Actions */}
        {status === 'idle' && (
          <button onClick={publish} className="px-6 py-2.5 bg-teal-500 text-[#0a0f1a] font-semibold rounded text-sm hover:bg-teal-400 transition-colors">
            Push to Notion Content Calendar
          </button>
        )}

        {status === 'publishing' && (
          <div className="flex items-center gap-3 text-teal-400">
            <Spinner />
            <span className="text-sm" style={mono}>Publishing to Notion via MCP...</span>
          </div>
        )}

        {status === 'done' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-teal-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-sm font-medium">Published to Notion</span>
            </div>
            {result?.url && (
              <a href={result.url} target="_blank" rel="noreferrer" className="text-xs text-teal-400/70 hover:text-teal-400 underline block" style={mono}>
                Open in Notion →
              </a>
            )}
            <p className="text-xs text-[#6b7a94] leading-relaxed" style={mono}>
              Post is in "Drafting" status. Promote to "Ready" in Notion when you're happy with it. Set to "Scheduled" with a Delivery Date for auto-publish via n8n.
            </p>
            <button onClick={() => setStatus('idle')} className="text-xs text-[#6b7a94] hover:text-teal-400 transition-colors" style={mono}>
              Publish Again
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <p className="text-red-400 text-sm" style={mono}>{error}</p>
            <button onClick={() => setStatus('idle')} className="text-xs text-[#6b7a94] hover:text-teal-400 transition-colors" style={mono}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#6b7a94] uppercase w-20 shrink-0" style={mono}>{label}</span>
      {children || <span className="text-sm text-[#c4c0b8]">{value}</span>}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
