'use client'
import { useState, useRef } from 'react'
import { FileText, Upload, Loader2, Copy, Check, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const ACTIONS = [
  'Summarize this document',
  'Extract key points as bullet points',
  'Find all action items',
  'Write an executive summary',
  'Identify the main arguments',
  'Simplify this for a general audience',
  'Translate to Spanish',
  'Make it more concise',
]

export default function DocumentsInterface() {
  const [file, setFile] = useState<File | null>(null)
  const [fileText, setFileText] = useState('')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (f: File) => {
    setFile(f)
    setResult('')
    const text = await f.text()
    setFileText(text)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
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
            content: `${text}\n\nDocument:\n\n${fileText.slice(0, 12000)}`,
          }],
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              full += parsed.text
              setResult(full)
            } catch {}
          }
        }
      }
    } catch {
      setResult('Something went wrong. Please try again.')
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
        <div className="max-w-3xl mx-auto">
          {!file ? (
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Upload size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Drop a file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">.txt, .md, .csv, .json, .html</p>
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.md,.csv,.json,.html,.xml,.yaml,.yml"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <FileText size={18} className="text-cyan-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={() => { setFile(null); setFileText(''); setResult('') }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {file && (
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex gap-2 flex-wrap">
              {ACTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => process(a)}
                  disabled={loading}
                  className="text-xs bg-gray-50 hover:bg-cyan-50 border border-gray-200 hover:border-cyan-300 text-gray-600 hover:text-cyan-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && process()}
                placeholder="Or ask something specific about this document..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-cyan-300 transition-colors"
              />
              <button
                onClick={() => process()}
                disabled={!prompt.trim() || loading}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-4 rounded-xl text-sm font-medium transition-colors"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {loading && (
            <div className="flex items-center gap-3 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
              Analyzing your document...
            </div>
          )}

          {result && (
            <div className="relative">
              <button
                onClick={copy}
                className="absolute top-0 right-0 flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <div className="prose prose-sm max-w-none text-gray-800 prose-headings:font-semibold prose-a:text-cyan-600 prose-a:underline prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded pt-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
