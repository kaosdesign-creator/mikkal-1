'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, RefreshCw, Download, ArrowUp, Loader2 } from 'lucide-react'

type Size = 'square' | 'portrait' | 'landscape'

interface GeneratedImage {
  id: number
  url: string
  prompt: string
  size: Size
}

export default function ImagesInterface({ userName }: { userName?: string; isMobile?: boolean }) {
  const [prompt,     setPrompt]    = useState('')
  const [size,       setSize]      = useState<Size>('square')
  const [loading,    setLoading]   = useState(false)
  const [images,     setImages]    = useState<GeneratedImage[]>([])
  const [error,      setError]     = useState('')
  const [refImage,   setRefImage]  = useState<{ base64: string; preview: string } | null>(null)
  const [strength,   setStrength]  = useState(0.85)
  const [dragging,   setDragging]  = useState(false)
  const [customNext, setCustomNext] = useState<Record<number, string>>({})
  const fileRef   = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.onload  = () => res(r.result as string)
      r.onerror = rej
      r.readAsDataURL(file)
    })

  const loadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return }
    if (file.size > 10 * 1024 * 1024)   { setError('Image must be under 10MB'); return }
    const base64  = await toBase64(file)
    const preview = URL.createObjectURL(file)
    setRefImage({ base64, preview })
    setError('')
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) loadFile(file)
  }

  const clearRef = () => {
    setRefImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const scrollToBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

  const generate = async (p: string, s: Size, ref?: string | null) => {
    if (!p.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/images', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt:         p.trim(),
          size:           s,
          referenceImage: ref ?? refImage?.base64 ?? null,
          strength,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      if (!data.url) throw new Error('No image returned')
      setImages(prev => [...prev, { id: Date.now(), url: data.url, prompt: p, size: s }])
      scrollToBottom()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const download = (url: string) => {
    const a    = document.createElement('a')
    a.href     = url
    a.download = `mikkal-${Date.now()}.jpg`
    a.click()
  }

  const handleCustom = (img: GeneratedImage, id: number) => {
    const text = customNext[id] || ''
    if (!text.trim()) return
    generate(img.prompt + '. ' + text, img.size)
    setCustomNext(prev => ({ ...prev, [id]: '' }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflowY: 'auto' }}>

      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px 12px' }}>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>
          {greeting}{userName ? ', ' + userName : ''}
        </div>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#111' }}>Create an Image</div>
      </div>

      <div style={{ padding: 24, maxWidth: 680, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Reference Image <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span>
        </div>

        {refImage ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, padding: '12px 16px', border: '1px solid #e5e5e5', borderRadius: 12, background: '#fafafa' }}>
            <img src={refImage.preview} alt="Reference" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e5e5', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 6 }}>Reference image loaded</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#888' }}>Creativity</span>
                <input
                  type="range" min={0.3} max={1} step={0.05}
                  value={strength}
                  onChange={e => setStrength(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#111' }}
                />
                <span style={{ fontSize: 12, color: '#888', width: 32 }}>{Math.round(strength * 100)}%</span>
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                {strength < 0.5 ? 'Stays close to reference' : strength > 0.8 ? 'Freely reimagines' : 'Balanced blend'}
              </div>
            </div>
            <button onClick={clearRef} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            style={{ border: `1.5px dashed ${dragging ? '#888' : '#ccc'}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, background: dragging ? '#f5f5f5' : '#fafafa', cursor: 'pointer' }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'white', border: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Upload size={20} color="#888" />
            </div>
            <div style={{ fontSize: 14, color: '#888', lineHeight: 1.5 }}>
              <span style={{ color: '#111', fontWeight: 500 }}>Click to upload</span> or drag and drop<br />
              <span style={{ fontSize: 12 }}>Any reference image · Max 10MB</span>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />

        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, marginTop: 4 }}>
          Describe what you want
        </div>
        <div style={{ border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(prompt, size) } }}
            placeholder={refImage ? 'Describe what to create from this reference…' : 'e.g. A mountain lake at sunset with dramatic lighting…'}
            style={{ width: '100%', padding: '14px 16px', fontSize: 15, color: '#111', background: 'white', border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box', minHeight: 80 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
            {!refImage ? (
              <div style={{ display: 'flex', gap: 6 }}>
                {(['square', 'portrait', 'landscape'] as Size[]).map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: '1px solid #e5e5e5', cursor: 'pointer', background: size === s ? '#111' : 'white', color: size === s ? 'white' : '#666' }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            ) : <div />}
            <button
              onClick={() => generate(prompt, size)}
              disabled={loading || !prompt.trim()}
              style={{ fontSize: 13, fontWeight: 500, padding: '8px 20px', borderRadius: 999, background: loading || !prompt.trim() ? '#ccc' : '#111', color: 'white', border: 'none', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, fontSize: 14, color: '#c00' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#888', fontSize: 14 }}>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            {refImage ? 'Transforming your image…' : 'Generating your image…'}
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {images.map(img => (
          <div key={img.id} style={{ marginTop: 32, borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
            <img src={img.url} alt="Generated" style={{ width: '100%', borderRadius: 12, border: '1px solid #e5e5e5', display: 'block' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => download(img.url)}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e5e5', background: 'white', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <Download size={13} /> Download
              </button>
              <button onClick={() => generate(img.prompt, img.size)}
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e5e5', background: 'white', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <RefreshCw size={13} /> Try again
              </button>
            </div>
            <div style={{ marginTop: 16, border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>What would you like to do next?</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Type an instruction to refine this image</div>
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa' }}>
                <input
                  value={customNext[img.id] || ''}
                  onChange={e => setCustomNext(prev => ({ ...prev, [img.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCustom(img, img.id)}
                  placeholder="e.g. Make it more dramatic, change the sky to night…"
                  style={{ flex: 1, padding: '8px 14px', borderRadius: 999, border: '1px solid #e5e5e5', fontSize: 13, background: 'white', color: '#111', fontFamily: 'inherit', outline: 'none' }}
                />
                <button onClick={() => handleCustom(img, img.id)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
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