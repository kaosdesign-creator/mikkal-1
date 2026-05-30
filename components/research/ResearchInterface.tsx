'use client'
import { useState } from 'react'
import { Search, ExternalLink, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SearchResult {
  title: string
  url: string
  content: string
  score: number
}

export default function ResearchInterface() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!query.trim() || loading) return
    setLoading(true)
    setAnswer('')
    setResults([])
    setSearched(true)

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
      setAnswer('Research failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') search()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="What do you want to research?"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100 transition-colors"
            />
            <button
              onClick={search}
              disabled={!query.trim() || loading}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {!searched && (
            <div className="text-center py-16">
              <Search size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Search the web for real-time information</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
              Researching across the web...
            </div>
          )}

          {answer && (
            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-5">
              <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-3">Summary</p>
              <div className="prose prose-sm max-w-none text-gray-800 prose-a:text-cyan-600 prose-a:underline">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sources</p>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-100 rounded-xl p-4 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-cyan-700 transition-colors truncate">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{r.url}</p>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.content}</p>
                      </div>
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-cyan-400 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
