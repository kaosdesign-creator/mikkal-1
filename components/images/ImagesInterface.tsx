'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, RefreshCw, Sliders, FileText, ZoomIn, Download, ArrowUp, Plus, Loader2 } from 'lucide-react'

type Size = 'square' | 'portrait' | 'landscape'

interface GeneratedImage {
  id: number
  url: string
  prompt: string
  size: Size
}

export default function ImagesInterface({ userName, isMobile }: { userName?: string; isMobile?: boolean }) {
  const [prompt, setPrompt]         = useState('')
  const [size, setSize]             = useState<Size>('square')
  const [loading, setLoading]       = useState(false)
  const [images, setImages]         = useState<GeneratedImage[]>([])
  const [error, setError]           = useState('')
  const [refImages, setRefImages]   = useState<{ name: string; base64: string; preview: string }[]>([])
  const [dragging, setDragging]     = useState(false)
  const [tweakId, setTweakId]       = useState<number | null>(null)
  const [tweakText, setTweakText]   = useState('')
  const [customNext, setCustomNext] = useState<Record<number, string>>({})
  const fileRef                     = useRef<HTMLInputElement>(null)
  const bottomRef                   = useRef<HTMLDivElement>(null)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = rej
      r.readAsDataURL(file)
    })

  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files) return
    const items = Array.from(files).slice(0, 4 - refImages.length)
    const parsed = await Promise.all(items.map(async f => ({
      name: f.name,
      base64: await toBase64(f),
      preview: URL.createObjectURL(f),
    })))
    setRefImages(prev => [...prev, ...parsed].slice(0, 4))
  }, [refImages])

  const removeImage = (i: number) => setRefImages(prev => prev.filter((_, idx) => idx !== i))

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

  const generate = async (p: string, s: Size, imageBase64?: string | null) => {
    if (!p.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: p, size: s, imageBase64: imageBase64 || refImages[0]?.base64 || null }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImages(prev => [...prev, { id: Date.now(), url: data.imageUrl, prompt: p, size: s }])
      scrollToBottom()
    } catch (e: any) {
      setError(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleTryAgain = (img: GeneratedImage) => generate(img.prompt, img.size)
  const handleResize   = (img: GeneratedImage) => {
    const next: Size = img.size === 'square' ? 'portrait' : img.size === 'portrait' ? 'landscape' : 'square'
    generate(img.prompt, next)
  }
  const handleReprompt = () => { setPrompt(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const handleTweak    = (img: GeneratedImage) => {
    if (!tweakText.trim()) return
    generate(img.prompt + '. ' + tweakText, img.size)
    setTweakId(null)
    setTweakText('')
  }
  const handleCustom  = (img: GeneratedImage, id: number) => {
    const text = customNext[id] || ''
    if (!text.trim()) return
    generate(img.prompt + '. ' + text, img.size)
    setCustomNext(prev => ({ ...prev, [id]: '' }))
  }

  const download = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = 'mikkal-image.jpg'
    a.click()
  }

  const WHAT_NEXT = (img: GeneratedImage) => [
    { color: '#E1F5EE', iconColor: '#0F6E56', icon: RefreshCw, label: 'Try again',         desc: 'New version, same prompt',           onClick: () => handleTryAgain(img) },
    { color: '#EEEDFE', iconColor: '#534AB7', icon: Sliders,   label: 'Make changes',       desc: 'Describe what to change',            onClick: () => { setTweakId(img.id); setTweakText('') } },
    { color: '#FAECE7', iconColor: '#993C1D', icon: FileText,  label: 'Change the prompt',  desc: 'Start fresh with a new description', onClick: handleReprompt },
    { color: '#E6F1FB', iconColor: '#185FA5', icon: ZoomIn,    label: 'Different size',     desc: 'Regenerate as portrait or landscape', onClick: () => handleResize(img) },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflowY: 'auto' }}>
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px 12px' }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{greeting}{userName ? ', ' + userName : ''}</div>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#111' }}>Create an Image</div>
      </div>

      <div style={{ padding: 24, maxWidth: 680, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Reference image (optional)</div>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          style={{ border: `1.5px dashed ${dragging ? '#888' : '#ccc'}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, background: dragging ? '#f5f5f5' : '#fafafa', cursor: 'pointer' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 8, background: 'white', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Upload size={20} color="#888" />
          </div>
          <div style={{ fontSize: 14, color: '#888', lineHeight: 1.5 }}>
            <span style={{ color: '#111', fontWeight: 500 }}>Click to upload</span> or drag and drop a photo<br />
            Use a product, person, logo, or any reference image
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />

        {refImages.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {refImages.map((img, i) => (
              <div key={i} style={{ width: 72, height: 72, borderRadius: 8, border: '1px solid #e5e5e5', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <img src={img.preview} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <X size={10} color="white" />
                </button>
              </div>
            ))}
            {refImages.length < 4 && (
              <div onClick={() => fileRef.current?.click()} style={{ width: 72, height: 72, borderRadius: 8, border: '1.5px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                <Plus size={20} color="#aaa" />
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, marginTop: 4 }}>Describe what you want</div>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. Place this bottle on a beach at sunset with dramatic lighting..."
            style={{ width: '100%', padding: '14px 16px', fontSize: 15, color: '#111', background: 'white', border: 'none', outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', minHeight: 80 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['square','portrait','landscape'] as Size[]).map(s => (
                <button key={s} onClick={() => setSize(s)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: '1px solid #e5e5e5', cursor: 'pointer', background: size === s ? '#111' : 'white', color: size === s ? 'white' : '#666' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <button onClick={() => generate(prompt, size)} disabled={loading || !prompt.trim()} style={{ fontSize: 13, fontWeight: 500, padding: '8px 20px', borderRadius: 999, background: loading || !prompt.trim() ? '#ccc' : '#111', color: 'white', border: 'none', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {error && <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, fontSize: 14, color: '#c00' }}>{error}</div>}

        {loading && (
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#888', fontSize: 14 }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Generating your image...
            <style>{'{@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }}'}</style>
          </div>
        )}

        {images.map((img) => (
          <div key={img.id} style={{ marginTop: 32, borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
            <img src={img.url} alt="Generated" style={{ width: '100%', borderRadius: 12, border: '1px solid #e5e5e5', display: 'block' }} />

            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => download(img.url)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e5e5', background: 'white', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Download size={13} /> Download
              </button>
            </div>

            <div style={{ marginTop: 16, border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>What would you like to do next?</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Choose an option or type your own instruction</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {WHAT_NEXT(img).map((opt, i) => (
                  <button key={i} onClick={opt.onClick} style={{ padding: '14px 16px', border: 'none', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', borderRight: i % 2 === 0 ? '1px solid #f0f0f0' : 'none', background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <opt.icon size={15} color={opt.iconColor} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: '#888', lineHeight: 1.4 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {tweakId === img.id && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={tweakText}
                    onChange={e => setTweakText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTweak(img)}
                    placeholder="What would you like to change? e.g. make the lighting warmer..."
                    style={{ flex: 1, padding: '8px 14px', borderRadius: 999, border: '1px solid #e5e5e5', fontSize: 13, background: 'white', color: '#111', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                  />
                  <button onClick={() => handleTweak(img)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowUp size={15} color="white" />
                  </button>
                </div>
              )}

              <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center', background: tweakId === img.id ? 'white' : '#fafafa' }}>
                <input
                  value={customNext[img.id] || ''}
                  onChange={e => setCustomNext(prev => ({ ...prev, [img.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCustom(img, img.id)}
                  placeholder="Or type your own instruction..."
                  style={{ flex: 1, padding: '8px 14px', borderRadius: 999, border: '1px solid #e5e5e5', fontSize: 13, background: 'white', color: '#111', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                />
                <button onClick={() => handleCustom(img, img.id)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowUp size={15} color="white" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
