'use client'
import { useState } from 'react'
import { Share2, Copy, Check, Loader2 } from 'lucide-react'

const PLATFORMS = [
  { id: 'twitter', label: 'X / Twitter', icon: '𝕏' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'in' },
  { id: 'instagram', label: 'Instagram', icon: '◈' },
  { id: 'facebook', label: 'Facebook', icon: 'f' },
]

const TONES = ['Professional', 'Casual', 'Witty', 'Inspirational', 'Educational', 'Bold']

export default function SocialInterface() {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('twitter')
  const [tone, setTone] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState('')

  const generate = async () => {
    if (!topic.trim() || loading) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone }),
      })
      const data = await res.json()
      setResult(data.result || '')
    } catch {
      setResult('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const posts = result
    ? result.split(/\n(?=\d+\.)/).map((p) => p.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
    : []

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to post about?"
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100 transition-colors"
          />

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  title={p.label}
                  className={`w-9 h-9 rounded-xl border text-sm font-bold transition-colors ${
                    platform === p.id
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-cyan-300'
                  }`}
                >
                  {p.icon}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 flex-wrap flex-1">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    tone === t
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={generate}
              disabled={!topic.trim() || loading}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors flex-shrink-0"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
              Generate
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {!result && !loading && (
            <div className="text-center py-16">
              <Share2 size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Generate 3 post variations for any platform</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
              Writing your posts...
            </div>
          )}

          {posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post, i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-4 group hover:border-gray-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Version {i + 1}</span>
                      <p className="text-sm text-gray-800 mt-2 leading-relaxed whitespace-pre-wrap">{post}</p>
                      {platform === 'twitter' && (
                        <p className={`text-xs mt-2 ${post.length > 280 ? 'text-red-400' : 'text-gray-400'}`}>
                          {post.length}/280 chars
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => copy(post, `post-${i}`)}
                      className="text-gray-300 hover:text-cyan-500 transition-colors flex-shrink-0 mt-5"
                    >
                      {copied === `post-${i}` ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
