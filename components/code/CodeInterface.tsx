'use client'
import { useState } from 'react'
import { Code, Copy, Check, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const SUGGESTIONS = [
  'Write a Python web scraper',
  'Build a React todo app',
  'SQL query to find duplicate records',
  'JavaScript debounce function',
  'REST API with Express.js',
]

export default function CodeInterface() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async (p?: string) => {
    const text = p || prompt
    if (!text.trim() || loading) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are an expert programmer. ${text}\n\nProvide clean, well-commented code with a brief explanation.`
          }]
        }),
      })
      const data = await res.json()
      setResult(data.text || '')
    } catch {
      setResult('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 mb-3">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe what you want to build or ask a coding question..."
              rows={2}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none focus:border-cyan-300"
            />
            <button
              onClick={() => generate()}
              disabled={!prompt.trim() || loading}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-6 rounded-2xl text-sm font-semibold transition-colors self-end py-3"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Code size={16} />}
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setPrompt(s); generate(s) }}
                className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Code size={32} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Ask Mikkal to write, explain, or fix any code</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-500" />
              Writing your code...
            </div>
          )}

          {result && !loading && (
            <div className="relative">
              <button
                onClick={copy}
                className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors z-10"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <div className="mk-prose text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}