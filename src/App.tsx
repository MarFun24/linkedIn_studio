import { useState, useCallback } from 'react'
import { Drafter } from './components/Drafter.tsx'
import { Illustrator } from './components/Illustrator.tsx'
import { Publisher } from './components/Publisher.tsx'
import { Preview } from './components/Preview.tsx'

export interface PostDraft {
  title: string
  pillar: string
  seed: string
  hook: string
  body: string
  cta: string
  imageNotes: string
  hashtags: string
}

type Tab = 'draft' | 'illustrate' | 'preview' | 'publish'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('draft')
  const [draft, setDraft] = useState<PostDraft | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)

  const tabs: { id: Tab; label: string; num: string; ready: boolean }[] = [
    { id: 'draft', label: 'Draft', num: '01', ready: true },
    { id: 'illustrate', label: 'Illustrate', num: '02', ready: !!draft },
    { id: 'preview', label: 'Preview', num: '03', ready: !!draft },
    { id: 'publish', label: 'Publish', num: '04', ready: !!draft },
  ]

  const handleDraftComplete = useCallback((post: PostDraft) => {
    setDraft(post)
    setActiveTab('illustrate')
  }, [])

  const handleImageGenerated = useCallback((data: string) => {
    setImageData(data)
    setActiveTab('preview')
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#e8e6e1]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Sora:wght@600;700&display=swap"
        rel="stylesheet"
      />

      {/* Header */}
      <header className="border-b border-[#1a2236] px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-[#0a0f1a] font-bold text-sm" style={{ fontFamily: 'Sora' }}>T</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white" style={{ fontFamily: 'Sora' }}>
                LinkedIn Content Studio
              </h1>
              <p className="text-[10px] sm:text-xs text-[#6b7a94] tracking-wide uppercase" style={{ fontFamily: 'DM Mono' }}>
                Tropoly · Draft · Illustrate · Publish
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-400" style={{ fontFamily: 'DM Mono' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            API
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="border-b border-[#1a2236] px-4 sm:px-6 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => tab.ready && setActiveTab(tab.id)}
              className={`relative px-4 sm:px-6 py-3 text-xs sm:text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-teal-400'
                  : tab.ready
                  ? 'text-[#4a5568] hover:text-[#8a95a8]'
                  : 'text-[#2a3446] cursor-not-allowed'
              }`}
              style={{ fontFamily: 'DM Mono' }}
            >
              <span className="text-[10px] mr-1 opacity-50">{tab.num}</span>
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-px bg-teal-400" />}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'draft' && <Drafter draft={draft} onComplete={handleDraftComplete} />}
          {activeTab === 'illustrate' && (
            <Illustrator draft={draft} imageData={imageData} onImageGenerated={handleImageGenerated} />
          )}
          {activeTab === 'preview' && <Preview draft={draft} imageData={imageData} />}
          {activeTab === 'publish' && <Publisher draft={draft} />}
        </div>
      </main>
    </div>
  )
}

export default App
