'use client'
import { useState } from 'react'
import { Wand2, Download, Loader2 } from 'lucide-react'

const STYLE_PRESETS = [
  'Photorealistic',
  'Digital art',
  'Oil painting',
  'Watercolor',
  'Cinematic',
  'Anime',
  'Sketch',
  '3D render',
]

export default function ImagesInterface() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Photorealistic')
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setImage(null)
    setError('')

    const fullPrompt = `${prompt}, ${style} style, high quality, detailed`

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImage(`data:image/png;base64,${data.image}`)
    } catch (err: any) {
      setError('Image generation failed. Check your Stability AI API key.')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!image) return
    const a = document.createElement('a')
    a.href = image
    a.download = `mikkal-${Date.now()}.png`
    a.click()
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100 transition-colors"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap flex-1">
              {STYLE_PRESETS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    style === s
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-cyan-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={generate}
              disabled={!prompt.trim() || loading}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors flex-shrink-0"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              Generate
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {!image && !loading && !error && (
            <div className="text-center py-16">
              <Wand2 size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Describe what you want to create</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-3 text-gray-400 text-sm py-16">
              <Loader2 size={24} className="animate-spin text-cyan-400" />
              <p>Creating your image...</p>
              <p className="text-xs text-gray-300">This usually takes 15–30 seconds</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {image && (
            <div className="space-y-4">
              <img src={image} alt="Generated" className="w-full max-w-lg mx-auto block rounded-2xl shadow-sm border border-gray-100" />
              <div className="flex justify-center">
                <button
                  onClick={download}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-cyan-600 border border-gray-200 hover:border-cyan-300 px-4 py-2 rounded-xl transition-colors"
                >
                  <Download size={15} />
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
