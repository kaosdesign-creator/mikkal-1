'use client'
import { useState } from 'react'
import { Code2, Copy, Check, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'React', 'SQL', 'Bash', 'CSS', 'Go', 'Rust', 'Other']

const QUICK = [
  'Write a REST API endpoint',
  'Create a React component',
  'Write a sorting algorithm',
  'Build a regex pattern',
  'Write unit tests',
  'Optimize this query',
]

export default function CodeInterface() {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState('TypeScript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = async (p?: string) => {
    const text = p || prompt
    if (!text.trim() || loading) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, language }),
      })
      const data = await res.json()
      setResult(data.result || '')
    } catch {
      setResult('Code generation failed. Please try again.')
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
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex gap-2 flex-wrap">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  language === l
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe what you want to build in ${language}...`}
              rows={2}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100 transition-colors"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }}
            />
            <button
              onClick={() => generate()}
              disabled={!prompt.trim() || loading}
              className="bg-gray-900 hover:bg-gray-800 disabled:opacity-30 text-white px-5 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Code2 size={15} />}
              Build
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {!result && !loading && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick starts</p>
              <div className="grid grid-cols-2 gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setPrompt(q); generate(q) }}
                    className="text-left text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
              Writing your code...
            </div>
          )}

          {result && (
            <div className="relative">
              <button
                onClick={copy}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <div className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
