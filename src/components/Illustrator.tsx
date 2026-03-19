import { useState } from 'react'
import type { PostDraft } from '../App'

const mono: React.CSSProperties = { fontFamily: 'DM Mono, monospace' }
const sora: React.CSSProperties = { fontFamily: 'Sora, sans-serif' }

interface Props {
  draft: PostDraft | null
  imageData: string | null
  onImageGenerated: (dataUrl: string) => void
}

export function Illustrator({ draft, imageData, onImageGenerated }: Props) {
  const [prompt, setPrompt] = useState(() => draft?.imageNotes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(imageData)

  const generateImage = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)

    try {
      const resp = await fetch('/api/illustrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.error || `API returned ${resp.status}`)
      }

      const dataUrl = `data:${data.mimeType};base64,${data.image}`
      setPreview(dataUrl)
      onImageGenerated(dataUrl)
    } catch (err: any) {
      setError(err.message || 'Failed to generate image')
    } finally {
      setLoading(false)
    }
  }

  if (!draft) {
    return (
      <div className="bg-[#0f1629] border border-amber-500/20 rounded-lg p-6 text-center">
        <p className="text-amber-400 text-sm" style={mono}>Go back to Draft first and create your post content.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#0f1629] border border-[#1a2236] rounded-lg p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-1" style={sora}>Generate Illustration</h2>
        <p className="text-[#6b7a94] text-xs mb-4" style={mono}>
          Style: Flat / Geometric / Modern · Powered by Gemini
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the illustration you want..."
          className="w-full bg-[#0a0f1a] border border-[#1a2236] rounded px-4 py-3 text-sm text-[#e8e6e1] placeholder-[#3a4558] focus:outline-none focus:border-teal-500/50 resize-none h-24"
        />

        {draft.imageNotes && prompt !== draft.imageNotes && (
          <button
            onClick={() => setPrompt(draft.imageNotes)}
            className="mt-2 text-xs text-teal-400/70 hover:text-teal-400 transition-colors"
            style={mono}
          >
            ← Use image notes from draft
          </button>
        )}

        <div className="mt-4">
          <button
            onClick={generateImage}
            disabled={loading || !prompt.trim()}
            className="px-6 py-2.5 bg-teal-500 text-[#0a0f1a] font-semibold rounded text-sm hover:bg-teal-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Spinner />}
            {loading ? 'Generating with Gemini...' : preview ? 'Regenerate' : 'Generate Illustration'}
          </button>
        </div>

        {error && <p className="mt-3 text-red-400 text-sm" style={mono}>{error}</p>}
      </div>

      {preview && (
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-lg overflow-hidden">
          <div className="px-5 sm:px-6 py-3 border-b border-[#1a2236] flex items-center justify-between">
            <span className="text-xs text-[#6b7a94] uppercase tracking-wider" style={mono}>Generated Illustration</span>
            <a href={preview} download="linkedin-illustration.png" className="text-xs text-teal-400 hover:text-teal-300 transition-colors" style={mono}>
              Download
            </a>
          </div>
          <div className="p-6 flex justify-center">
            <img src={preview} alt="Generated illustration" className="max-w-md w-full rounded border border-[#1a2236]" />
          </div>
          <div className="px-5 sm:px-6 py-4 border-t border-[#1a2236] flex justify-end">
            <button
              onClick={() => onImageGenerated(preview)}
              className="px-6 py-2.5 bg-teal-500 text-[#0a0f1a] font-semibold rounded text-sm hover:bg-teal-400 transition-colors"
            >
              Continue to Preview →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
