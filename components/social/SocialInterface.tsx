'use client'
import { useState } from 'react'
import { Share2, Copy, Check, Loader2 } from 'lucide-react'

const PLATFORMS = [
  { id: 'twitter', label: 'X / Twitter', limit: '280 chars' },
  { id: 'linkedin', label: 'LinkedIn', limit: 'Professional' },
  { id: 'instagram', label: 'Instagram', limit: 'With hashtags' },
  { id: 'facebook', label: 'Facebook', limit: 'Conversational' },
]

const TONES = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Educational']

export default function SocialInterface() {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('twitter')
  const [tone, setTone] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{[key: string]: string}>({})
  const [copied, setCopied] = useState('')

  const generate = async () => {
    if (!topic.trim() || loading) return
    setLoading(true)
    setResults({})

    const selectedPlatform = PLATFORMS.find(p => p.id === platform)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Create 3 different ${selectedPlatform?.label} posts about: "${topic}"\n\nTone: ${tone}\nPlatform constraint: ${selectedPlatform?.limit}\n\nFormat each post clearly numbered (1, 2, 3) with no extra commentary. Just the posts.`
          }]
        }),
      })
      const data = await res.json()
      setResults({ [platform]: data.text || '' })
    } catch {
      setResults({ [platform]: 'Something went wrong. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-100 p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="What do you want to post about?"
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none resize-none focus:border-cyan-300"
          />

          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${platform === p.id ? 'bg-cyan-500 text-white border-cyan-500' : 'text-gray-500 border-gray-200 hover:border-cyan-300'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap ml-auto">
              {TONES.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${tone === t ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-500 border-gray-200 hover:border-gray-400'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={!topic.trim() || loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white py-3 rounded-2xl text-sm font-semibold transition-colors"
          >
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" />Generating...</span> : 'Generate Posts'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {!results[platform] && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Share2 size={32} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Generate social media posts for any platform</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-500" />
              Writing your posts...
            </div>
          )}

          {results[platform] && !loading && (
            <div className="relative">
              <button
                onClick={() => copy(results[platform], platform)}
                className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors z-10"
              >
                {copied === platform ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied === platform ? 'Copied' : 'Copy all'}
              </button>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
                {results[platform]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}