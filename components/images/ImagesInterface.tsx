'use client'
import { useState } from 'react'
import { Wand2, Download, Loader2 } from 'lucide-react'

const STYLES = ['Photorealistic','Digital art','Oil painting','Watercolor','Cinematic','Anime','Sketch','3D render']

function getGreeting(name: string) {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name} 👋`
  if (h < 17) return `Good afternoon, ${name} 👋`
  if (h < 21) return `Good evening, ${name} 👋`
  return `Back at it, ${name} 👋`
}

export default function ImagesInterface({ userName = 'there', isMobile = false }: { userName?: string; isMobile?: boolean }) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Photorealistic')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true); setImageUrl(null); setError(''); setGenerated(true)
    try {
      const res = await fetch('/api/images', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `${prompt}, ${style} style, high quality, detailed` }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImageUrl(data.imageUrl)
    } catch (err: any) { setError(err.message || 'Image generation failed.') }
    finally { setLoading(false) }
  }

  if (!generated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: 'Inter, sans-serif', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: '#1a1a1a', marginBottom: 36 }}>{getGreeting(userName)}</h1>
        <div style={{ width: '100%', maxWidth: 660, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the image you want to create..." rows={2}
            style={{ width: '100%', border: 'none', outline: 'none', padding: '15px 16px 8px', fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#1a1a1a', resize: 'none', background: 'transparent', boxSizing: 'border-box', lineHeight: 1.6 }} />
          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, border: '1px solid', borderColor: style === s ? '#1a1a1a' : 'rgba(0,0,0,0.12)', background: style === s ? '#1a1a1a' : 'white', color: style === s ? 'white' : '#4a4a4a', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>{s}</button>
              ))}
            </div>
            <button onClick={generate} disabled={!prompt.trim() || loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: !prompt.trim() ? '#e5e7eb' : '#1a1a1a', color: !prompt.trim() ? '#9ca3af' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: !prompt.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
              <Wand2 size={14} />Generate
            </button>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#c0c0c0', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>Powered by DALL-E 3</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 12, overflow: 'hidden' }}>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the image..." rows={1}
              style={{ width: '100%', border: 'none', outline: 'none', padding: '12px 16px', fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#1a1a1a', resize: 'none', background: 'transparent', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
            {STYLES.map(s => <button key={s} onClick={() => setStyle(s)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, border: '1px solid', borderColor: style === s ? '#1a1a1a' : 'rgba(0,0,0,0.12)', background: style === s ? '#1a1a1a' : 'white', color: style === s ? 'white' : '#4a4a4a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{s}</button>)}
            <button onClick={generate} disabled={!prompt.trim() || loading} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 18px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={14} />}Generate
            </button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {loading && <div style={{ textAlign: 'center' }}><Loader2 size={32} style={{ color: '#9ca3af', animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }} /><p style={{ color: '#9ca3af', fontSize: 15 }}>Creating your image...</p><p style={{ color: '#c0c0c0', fontSize: 13, marginTop: 4 }}>Usually takes 10–20 seconds</p></div>}
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 20, maxWidth: 480, fontSize: 14, color: '#dc2626' }}>{error}</div>}
        {imageUrl && (
          <div style={{ textAlign: 'center', maxWidth: 560, width: '100%' }}>
            <img src={imageUrl} alt="Generated" style={{ width: '100%', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', marginBottom: 16 }} />
            <a href={imageUrl} download={`mikkal-${Date.now()}.png`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#4a4a4a', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, padding: '8px 18px', textDecoration: 'none', background: 'white', fontFamily: 'Inter, sans-serif' }}>
              <Download size={14} />Download
            </a>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}