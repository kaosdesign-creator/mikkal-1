'use client'
import { useState } from 'react'
import { Wand2, Download, Loader2 } from 'lucide-react'

const STYLES = ['Photorealistic', 'Digital art', 'Oil painting', 'Watercolor', 'Cinematic', 'Anime', 'Sketch', '3D render']

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

    try {
      const res = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${prompt}, ${style} style, high quality, detailed` }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImage(`data:image/png;base64,${data.image}`)
    } catch {
      setError('Image generation failed. Please check your Stability AI API key in Vercel.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            rows={2}
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 14, color: '#1a1a1a' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {STYLES.map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                style={{
                  fontSize: 12,
                  padding: '6px 14px',
                  borderRadius: 999,
                  border: '1.5px solid',
                  borderColor: style === s ? '#1a1a1a' : '#e5e7eb',
                  background: style === s ? '#1a1a1a' : 'white',
                  color: style === s ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}
              >
                {s}
              </button>
            ))}
            <button
              onClick={generate}
              disabled={!prompt.trim() || loading}
              style={{
                marginLeft: 'auto',
                background: !prompt.trim() || loading ? '#e5e7eb' : '#1a1a1a',
                color: !prompt.trim() || loading ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: 10,
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: 500,
                cursor: !prompt.trim() || loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Wand2 size={14} />}
              Generate
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!image && !loading && !error && (
          <div style={{ textAlign: 'center' }}>
            <Wand2 size={32} style={{ color: '#e5e7eb', margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Describe what you want to create</p>
          </div>
        )}
        {loading && (
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: '#9ca3af', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Creating your image...</p>
            <p style={{ color: '#d1d5db', fontSize: 12, marginTop: 4 }}>This usually takes 15–30 seconds</p>
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 16, maxWidth: 400, fontSize: 14, color: '#dc2626' }}>{error}</div>
        )}
        {image && (
          <div style={{ textAlign: 'center' }}>
            <img src={image} alt="Generated" style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <div style={{ marginTop: 16 }}>
              <button
                onClick={() => { const a = document.createElement('a'); a.href = image; a.download = `mikkal-${Date.now()}.png`; a.click() }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', background: 'white', fontFamily: 'Inter, sans-serif' }}
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
