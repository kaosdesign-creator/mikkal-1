'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, Download, RefreshCw, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

const SIZES = [
  { value: '1:1',  label: 'Square',    desc: '1024×1024' },
  { value: '16:9', label: 'Landscape', desc: '1344×768'  },
  { value: '9:16', label: 'Portrait',  desc: '768×1344'  },
  { value: '4:3',  label: 'Wide',      desc: '1152×896'  },
  { value: '3:4',  label: 'Tall',      desc: '896×1152'  },
]

const STYLES = [
  { value: 'photographic', label: 'Photo'     },
  { value: 'artistic',     label: 'Artistic'  },
  { value: 'cinematic',    label: 'Cinematic' },
  { value: 'anime',        label: 'Anime'     },
  { value: 'no-style',     label: 'Raw'       },
]

const QUICK_PROMPTS = [
  'A serene mountain lake at golden hour',
  'Abstract fluid art in cyan and amber',
  'Futuristic city skyline at night',
  'Close-up portrait of a wise old owl',
]

export default function ImageGenerator() {
  const [prompt,  setPrompt]  = useState('')
  const [size,    setSize]    = useState('1:1')
  const [style,   setStyle]   = useState('photographic')
  const [loading, setLoading] = useState(false)
  const [image,   setImage]   = useState<{ url: string; prompt: string } | null>(null)

  const generate = async (overridePrompt?: string) => {
    const text = (overridePrompt ?? prompt).trim()
    if (!text || loading) return

    setLoading(true)
    setImage(null)

    try {
      const res = await fetch('/api/images', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: text, size, style }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setImage({ url: data.url, prompt: text })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const download = async () => {
    if (!image) return
    try {
      const res  = await fetch(image.url)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `mikkal-${Date.now()}.jpg`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Download failed')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div className="border-b border-gray-200 p-6 pb-4">
        <div className="max-w-3xl mx-auto">

          {/* Prompt */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-cyan-300 focus-within:bg-white focus-within:shadow-sm transition-all">
              <Wand2 size={18} className="text-cyan-500 flex-shrink-0 mb-0.5" />
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate() } }}
                placeholder="Describe the image you want to create..."
                rows={2}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 resize-none outline-none text-sm leading-relaxed"
              />
            </div>
            <button
              onClick={() => generate()}
              disabled={!prompt.trim() || loading}
              className="px-5 rounded-2xl bg-cyan-500 text-white font-semibold text-sm hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 flex-shrink-0"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Generating…' : 'Generate'}
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Size */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium w-10">Size</span>
              <div className="flex gap-1.5">
                {SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSize(s.value)}
                    title={s.desc}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      size === s.value
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium w-10">Style</span>
              <div className="flex gap-1.5">
                {STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setStyle(s.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      style === s.value
                        ? 'bg-amber-400 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">

          <AnimatePresence mode="wait">
            {/* Loading skeleton */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <div className={`rounded-2xl bg-gray-100 animate-pulse ${aspectClass(size)}`} />
                <div className="text-center">
                  <p className="text-gray-500 text-sm">FLUX Pro is painting your image…</p>
                  <p className="text-gray-400 text-xs mt-1">Usually takes 10–20 seconds</p>
                </div>
              </motion.div>
            )}

            {/* Result */}
            {image && !loading && (
              <motion.div
                key="image"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="rounded-2xl shadow-lg max-w-full object-contain"
                />
                <p className="text-gray-400 text-xs italic text-center max-w-lg">"{image.prompt}"</p>
                <div className="flex gap-3">
                  <button
                    onClick={download}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    <Download size={15} />
                    Download
                  </button>
                  <button
                    onClick={() => generate()}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-sm font-medium transition-colors"
                  >
                    <RefreshCw size={15} />
                    Regenerate
                  </button>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!image && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-8 pt-8"
              >
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-100">
                    <Wand2 size={24} className="text-white" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Create with FLUX Pro</h2>
                  <p className="text-gray-500 text-sm">State-of-the-art image generation. Just describe what you see.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {QUICK_PROMPTS.map(q => (
                    <button
                      key={q}
                      onClick={() => { setPrompt(q); generate(q) }}
                      className="text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all duration-150"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function aspectClass(size: string) {
  const map: Record<string, string> = {
    '1:1':  'w-full max-w-lg aspect-square',
    '16:9': 'w-full aspect-video',
    '9:16': 'w-64 aspect-[9/16]',
    '4:3':  'w-full max-w-xl aspect-[4/3]',
    '3:4':  'w-72 aspect-[3/4]',
  }
  return map[size] ?? 'w-full max-w-lg aspect-square'
}
