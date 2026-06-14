'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, X, RefreshCw, Sliders, FileText, ZoomIn, Download, Copy, ArrowUp, Plus } from 'lucide-react'

type Size = 'square' | 'portrait' | 'landscape'

const WHAT_NEXT = [
  { icon: RefreshCw,  color: '#E1F5EE', iconColor: '#0F6E56', label: 'Try again',        desc: 'New version, same prompt',          action: 'retry'  },
  { icon: Sliders,    color: '#EEEDFE', iconColor: '#534AB7', label: 'Make changes',      desc: 'Tweak style, lighting or mood',     action: 'tweak'  },
  { icon: FileText,   color: '#FAECE7', iconColor: '#993C1D', label: 'Change the prompt', desc: 'Start fresh with a new description', action: 'reprompt' },
  { icon: ZoomIn,     color: '#E6F1FB', iconColor: '#185FA5', label: 'Different size',    desc: 'Regenerate as portrait or landscape', action: 'resize' },
]

export default function ImagesInterface({ userName, isMobile }: { userName?: string; isMobile?: boolean }) {
  const [prompt, setPrompt]           = useState('')
  const [size, setSize]               = useState<Size>('square')
  const [loading, setLoading]         = useState(false)
  const [imageUrl, setImageUrl]       = useState('')
  const [error, setError]             = useState('')
  const [refImages, setRefImages]     = useState<{ name: string; base64: string; preview: string }[]>([])
  const [customNext, setCustomNext]   = useState('')
  const [dragging, setDragging]       = useState(false)
  const fileRef                       = useRef<HTMLInputElement>(null)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res((r.result as string))
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

  const generate = async (overridePrompt?: string) => {
    const p = overridePrompt || prompt
    if (!p.trim() || loading) return
    setLoading(true)
    setError('')
    setImageUrl('')
    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: p,
          size,
          imageBase64: refImages[0]?.base64 || null,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImageUrl(data.imageUrl)
    } catch (e: any) {
      setError(e.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = (action: string) => {
    if (action === 'retry')     { generate() }
    if (action === 'tweak')     { setPrompt(prev => prev + ' — '); }
    if (action === 'reprompt')  { setPrompt(''); setImageUrl(''); setRefImages([]) }
    if (action === 'resize')    { setSize(s => s === 'square' ? 'portrait' : s === 'portrait' ? 'landscape' : 'square'); generate() }
  }

  const handleCustomNext = () => {
    if (!customNext.trim()) return
    generate(prompt + '. ' + customNext)
    setCustomNext('')
  }

  const download = async () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = 'mikkal-image.jpg'
    a.click()
  }

  const copy = async () => {
    await navigator.clipboard.writeText(imageUrl)
  }

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

        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Describe what you want</div>
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
            <button onClick={() => generate()} disabled={loading || !prompt.trim()} style={{ fontSize: 13, fontWeight: 500, padding: '8px 20px', borderRadius: 999, background: loading || !prompt.trim() ? '#ccc' : '#111', color: 'white', border: 'none', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>

        {error && <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff0f0', border: '1px solid #fcc', borderRadius: 8, fontSize: 14, color: '#c00' }}>{error}</div>}

        {imageUrl && (
          <div style={{ marginTop: 20 }}>
            <img src={imageUrl} alt="Generated" style={{ width: '100%', borderRadius: 12, border: '1px solid #e5e5e5', display: 'block' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={download} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e5e5', background: 'white', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Download size={13} /> Download
              </button>
              <button onClick={copy} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999, border: '1px solid #e5e5e5', background: 'white', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Copy size={13} /> Copy URL
              </button>
            </div>

            <div style={{ marginTop: 20, border: '1px solid #e5e5e5', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>What would you like to do next?</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Choose an option or type your own instruction</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                {WHAT_NEXT.map((opt, i) => (
                  <button key={i} onClick={() => handleNext(opt.action)} style={{ padding: '14px 16px', border: 'none', borderBottom: i < 2 ? '1px solid #f0f0f0' : 'none', borderRight: i % 2 === 0 ? '1px solid #f0f0f0' : 'none', background: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
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
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa' }}>
                <input
                  value={customNext}
                  onChange={e => setCustomNext(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCustomNext()}
                  placeholder="Or type your own instruction..."
                  style={{ flex: 1, padding: '8px 14px', borderRadius: 999, border: '1px solid #e5e5e5', fontSize: 13, background: 'white', color: '#111', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                />
                <button onClick={handleCustomNext} style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowUp size={15} color="white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
