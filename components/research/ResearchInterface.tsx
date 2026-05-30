'use client'
import { useState } from 'react'
import { Search, ExternalLink, Loader2 } from 'lucide-react'

interface Result {
  title: string
  url: string
  content: string
  score: number
}

export default function ResearchInterface() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!query.trim() || loading) return
    setLoading(true)
    setSearched(true)
    setAnswer('')
    setResults([])

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setAnswer(data.answer || '')
      setResults(data.results || [])
    } catch {
      setAnswer('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-100 p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Research anything..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
          </div>
          <button
            onClick={search}
            disabled={!query.trim() || loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-6 rounded-2xl text-sm font-semibold transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {!searched && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Search size={32} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Search the web for anything</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-500" />
              Researching...
            </div>
          )}

          {answer && !loading && (
            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-cyan-700 mb-2 uppercase tracking-wide">Summary</p>
              <p className="text-gray-800 text-sm leading-relaxed">{answer}</p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sources</p>
              {results.map((r, i) => (
                
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-cyan-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1 truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{r.content}</p>
                    </div>
                    <ExternalLink size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-cyan-600 mt-2 truncate">{r.url}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}