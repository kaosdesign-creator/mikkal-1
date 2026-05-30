'use client'
import { useState, useRef } from 'react'
import { FileText, Upload, Loader2, Copy, Check, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ACTIONS = [
  'Summarize this document',
  'Extract key points',
  'Find action items',
  'Translate to Spanish',
  'Make it more concise',
  'Write an executive summary',
]

export default function DocumentsInterface() {
  const [file, setFile] = useState<File | null>(null)
  const [fileText, setFileText] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (f: File) => {
    setFile(f)
    const text = await f.text()
    setFileText(text)
    setResult('')
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const process = async (action?: string) => {
    const text = action || prompt
    if (!text.trim() || !fileText || loading) return
    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `${text}\n\nDocument content:\n\n${fileText.slice(0, 8000)}`
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
        <div className="max-w-3xl mx-auto space-y-3">
          {!file ? (
            <div
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-300 transition-colors"
            >
              <Upload size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Drop a file or click to upload</p>
              <p className="text-xs text-gray-300 mt-1">TXT, MD, CSV, JSON supported</p>
              <input ref={inputRef} type="file" className="hidden" accept=".txt,.md,.csv,.json" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <FileText size={16} className="text-cyan-500" />
              <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
              <button onClick={() => { setFile(null); setFileText(''); setResult('') }}>
                <X size={14} className="text-gray-400 hover:text-gray-700" />
              </button>
            </div>
          )}

          {file && (
            <>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && process()}
                  placeholder="What do you want to do with this document?"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-cyan-300"
                />
                <button
                  onClick={() => process()}
                  disabled={!prompt.trim() || loading}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-6 rounded-2xl text-sm font-semibold transition-colors"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Go'}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ACTIONS.map((a, i) => (
                  <button key={i} onClick={() => process(a)} className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:border-cyan-300 hover:text-cyan-600 transition-colors">
                    {a}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {!file && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText size={32} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Upload a document and Mikkal will analyze it</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-500" />
              Analyzing document...
            </div>
          )}

          {result && !loading && (
            <div className="relative">
              <button onClick={copy} className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors z-10">
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