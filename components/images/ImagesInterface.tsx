'use client'
import { useState } from 'react'
import { Image as ImageIcon, Download, Loader2, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'A serene mountain lake at golden hour',
  'Futuristic city skyline at night',
  'Abstract geometric art in cyan and black',
  'A cozy modern home office setup',
]

export default function ImagesInterface() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState('')
  const [error, setError] = useState('')

  const generate = async (p?: string) => {
    const text = p || prompt
    if (!text.trim() || loading) return
    setLoading(true)
    setImage('')
    setError('')

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImage(data.image)
    } catch (e: any) {
      setError('Image generation failed. Try a different prompt.')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = `data:image/png;base64,${image}`
    a.download = 'mikkal-image.png'
    a.click()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-100 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 mb-3">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              rows={2}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none resize-none focus:border-cyan-300"
            />
            <button
              onClick={() => generate()}
              disabled={!prompt.trim() || loading}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-6 rounded-2xl text-sm font-semibold transition-colors self-end py-3"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
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

      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {!image && !loading && !error && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageIcon size={32} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Describe an image and Mikkal will create it</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 size={32} className="animate-spin text-cyan-500" />
              <p className="text-gray-400 text-sm">Creating your image...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {image && !loading && (
            <div className="space-y-3">
              <img
                src={`data:image/png;base64,${image}`}
                alt="Generated"
                className="w-full rounded-2xl border border-gray-100"
              />
              <div className="flex justify-end">
                <button
                  onClick={download}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 transition-colors"
                >
                  <Download size={14} />
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}