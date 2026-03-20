import { useState } from 'react'
import type { PostDraft } from '../App.tsx'

const mono: React.CSSProperties = { fontFamily: 'DM Mono, monospace' }
const sora: React.CSSProperties = { fontFamily: 'Sora, sans-serif' }

const PILLARS = ['Build Logs', 'Teardowns', 'Open Workflows', 'Industry Takes'] as const

interface Props {
  draft: PostDraft | null
  onComplete: (draft: PostDraft) => void
}

export function Drafter({ draft, onComplete }: Props) {
  const [topic, setTopic] = useState('')
  const [pillar, setPillar] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentDraft, setCurrentDraft] = useState<PostDraft | null>(draft)
  const [editMode, setEditMode] = useState(false)

  const generateDraft = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)

    try {
      const resp = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, pillar: pillar || undefined }),
      })

      const data = await resp.json()

      if (!resp.ok) {
        throw new Error(data.error || `API returned ${resp.status}`)
      }

      setCurrentDraft(data as PostDraft)
    } catch (err: any) {
      setError(err.message || 'Failed to generate draft')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldEdit = (field: keyof PostDraft, value: string) => {
    if (!currentDraft) return
    setCurrentDraft({ ...currentDraft, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-[#0f1629] border border-[#1a2236] rounded-lg p-5 sm:p-6">
        <h2 className="text-white font-semibold mb-4" style={sora}>
          What do you want to post about?
        </h2>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. I built an n8n workflow that auto-generates social posts from Google Sheets..."
          className="w-full bg-[#0a0f1a] border border-[#1a2236] rounded px-4 py-3 text-sm text-[#e8e6e1] placeholder-[#3a4558] focus:outline-none focus:border-teal-500/50 resize-none h-24"
        />

        <div className="flex items-center gap-2 sm:gap-3 mt-4 flex-wrap">
          <span className="text-xs text-[#6b7a94] uppercase tracking-wider" style={mono}>Pillar:</span>
          {PILLARS.map((p) => (
            <button
              key={p}
              onClick={() => setPillar(pillar === p ? '' : p)}
              className={`px-3 py-1 text-xs rounded border transition-colors ${
                pillar === p
                  ? 'border-teal-500 text-teal-400 bg-teal-500/10'
                  : 'border-[#1a2236] text-[#6b7a94] hover:text-white hover:border-[#2a3446]'
              }`}
              style={mono}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={generateDraft}
          disabled={loading || !topic.trim()}
          className="mt-4 px-6 py-2.5 bg-teal-500 text-[#0a0f1a] font-semibold rounded text-sm hover:bg-teal-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading && <Spinner />}
          {loading ? 'Drafting with Claude...' : currentDraft ? 'Regenerate' : 'Generate Draft'}
        </button>

        {error && <p className="mt-3 text-red-400 text-sm" style={mono}>{error}</p>}
      </div>

      {/* Draft Output */}
      {currentDraft && (
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-[#1a2236] gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <h3 className="text-white font-semibold truncate" style={sora}>{currentDraft.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0" style={mono}>
                {currentDraft.pillar}
              </span>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-xs text-[#6b7a94] hover:text-teal-400 transition-colors shrink-0"
              style={mono}
            >
              {editMode ? 'Done' : 'Edit'}
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            <Field label="Seed" value={currentDraft.seed} field="seed" edit={editMode} onChange={handleFieldEdit} />
            <Field label="Hook" value={currentDraft.hook} field="hook" edit={editMode} onChange={handleFieldEdit} highlight />
            <Field label="Body" value={currentDraft.body} field="body" edit={editMode} onChange={handleFieldEdit} tall />
            <Field label="CTA" value={currentDraft.cta} field="cta" edit={editMode} onChange={handleFieldEdit} />
            <Field label="Image Notes" value={currentDraft.imageNotes} field="imageNotes" edit={editMode} onChange={handleFieldEdit} />
            <Field label="Hashtags" value={currentDraft.hashtags} field="hashtags" edit={editMode} onChange={handleFieldEdit} />
          </div>

          <div className="px-5 sm:px-6 py-4 border-t border-[#1a2236] flex justify-end">
            <button
              onClick={() => onComplete(currentDraft)}
              className="px-6 py-2.5 bg-teal-500 text-[#0a0f1a] font-semibold rounded text-sm hover:bg-teal-400 transition-colors"
            >
              Continue to Illustrate →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label, value, field, edit, onChange, highlight, tall,
}: {
  label: string; value: string; field: keyof PostDraft; edit: boolean
  onChange: (f: keyof PostDraft, v: string) => void; highlight?: boolean; tall?: boolean
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-[#6b7a94] mb-1.5" style={mono}>{label}</label>
      {edit ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className={`w-full bg-[#0a0f1a] border border-[#1a2236] rounded px-3 py-2 text-sm text-[#e8e6e1] focus:outline-none focus:border-teal-500/50 resize-vertical ${tall ? 'h-40' : 'h-20'}`}
        />
      ) : (
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${highlight ? 'text-white font-medium' : 'text-[#c4c0b8]'}`}>
          {value}
        </p>
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
