import { useState } from 'react'
import type { PostDraft } from '../App.tsx'

const mono: React.CSSProperties = { fontFamily: 'DM Mono, monospace' }
const sora: React.CSSProperties = { fontFamily: 'Sora, sans-serif' }

interface Props {
  draft: PostDraft | null
  imageData: string | null
}

export function Preview({ draft, imageData }: Props) {
  const [copied, setCopied] = useState(false)

  if (!draft) {
    return (
      <div className="bg-[#0f1629] border border-amber-500/20 rounded-lg p-6 text-center">
        <p className="text-amber-400 text-sm" style={mono}>Create a draft first to see the preview.</p>
      </div>
    )
  }

  const fullPost = `${draft.hook}\n\n${draft.body}\n\n${draft.cta}\n\n${draft.hashtags}`

  const copyText = () => {
    navigator.clipboard.writeText(fullPost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-white font-semibold" style={sora}>Post Preview</h2>

      {/* LinkedIn Mockup */}
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/30">
          {/* Header */}
          <div className="p-4 flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg" style={sora}>MF</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm">Mark Funston</p>
              <p className="text-xs text-gray-500 truncate">Partner, Marketing & Infrastructure at Tropoly</p>
              <p className="text-xs text-gray-400 mt-0.5">Just now · 🌐</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 pb-3">
            <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">{fullPost}</p>
          </div>

          {/* Image */}
          {imageData && (
            <div className="border-t border-gray-100">
              <img src={imageData} alt="Post illustration" className="w-full" />
            </div>
          )}

          {/* Engagement */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>👍 24</span>
            <span>3 comments · 2 reposts</span>
          </div>

          {/* Actions */}
          <div className="px-4 py-2 border-t border-gray-100 grid grid-cols-4 gap-1">
            {['Like', 'Comment', 'Repost', 'Send'].map((a) => (
              <button key={a} className="text-xs text-gray-500 py-2 rounded hover:bg-gray-50 transition-colors">{a}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-3 flex-wrap">
        <button
          onClick={copyText}
          className="px-5 py-2 bg-[#0f1629] border border-[#1a2236] text-[#e8e6e1] rounded text-sm hover:border-teal-500/50 hover:text-teal-400 transition-colors"
          style={mono}
        >
          {copied ? '✓ Copied' : 'Copy Post Text'}
        </button>
        {imageData && (
          <a
            href={imageData}
            download="linkedin-post-image.png"
            className="px-5 py-2 bg-[#0f1629] border border-[#1a2236] text-[#e8e6e1] rounded text-sm hover:border-teal-500/50 hover:text-teal-400 transition-colors inline-block"
            style={mono}
          >
            Download Image
          </a>
        )}
      </div>
    </div>
  )
}
