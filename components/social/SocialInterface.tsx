'use client'
import { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'

const PLATFORMS = [
  { id: 'twitter', label: 'X / Twitter', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg> },
  { id: 'linkedin', label: 'LinkedIn', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { id: 'instagram', label: 'Instagram', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { id: 'facebook', label: 'Facebook', icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
]
const TONES = ['Professional','Casual','Witty','Inspirational','Educational','Bold']

function getGreeting(name: string) {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name} 👋`
  if (h < 17) return `Good afternoon, ${name} 👋`
  if (h < 21) return `Good evening, ${name} 👋`
  return `Back at it, ${name} 👋`
}

export default function SocialInterface({ userName = 'there', isMobile = false }: { userName?: string; isMobile?: boolean }) {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('twitter')
  const [tone, setTone] = useState('Professional')
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<string[]>([])
  const [copied, setCopied] = useState('')
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    if (!topic.trim() || loading) return
    setLoading(true); setPosts([]); setGenerated(true)
    try {
      const res = await fetch('/api/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, platform, tone }) })
      const data = await res.json()
      const split = (data.result || '').split(/\n(?=\d+\.)/).map((p: string) => p.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
      setPosts(split)
    } catch { setPosts(['Something went wrong. Please try again.']) }
    finally { setLoading(false) }
  }

  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 2000) }

  const InputArea = () => (
    <div style={{ width: '100%', maxWidth: 660, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="What do you want to post about?" rows={2}
        style={{ width: '100%', border: 'none', outline: 'none', padding: '15px 16px 8px', fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#1a1a1a', resize: 'none', background: 'transparent', boxSizing: 'border-box', lineHeight: 1.6 }} />
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 6, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => setPlatform(p.id)} title={p.label}
              style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid', borderColor: platform === p.id ? '#1a1a1a' : 'rgba(0,0,0,0.12)', background: platform === p.id ? '#1a1a1a' : 'white', color: platform === p.id ? 'white' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
              {p.icon}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
          {TONES.map(t => (
            <button key={t} onClick={() => setTone(t)}
              style={{ fontSize: 12, padding: '5px 11px', borderRadius: 999, border: '1px solid', borderColor: tone === t ? '#1a1a1a' : 'rgba(0,0,0,0.12)', background: tone === t ? '#1a1a1a' : 'white', color: tone === t ? 'white' : '#4a4a4a', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>{t}</button>
          ))}
        </div>
        <button onClick={generate} disabled={!topic.trim() || loading}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', background: !topic.trim() ? '#e5e7eb' : '#1a1a1a', color: !topic.trim() ? '#9ca3af' : 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: !topic.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0, whiteSpace: 'nowrap' }}>
          {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}Generate 3
        </button>
      </div>
    </div>
  )

  if (!generated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: 'Inter, sans-serif', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, color: '#1a1a1a', marginBottom: 36 }}>{getGreeting(userName)}</h1>
        <InputArea />
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={1} placeholder="What do you want to post about?"
            style={{ width: '100%', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10, outline: 'none', padding: '10px 14px', fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#1a1a1a', resize: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {PLATFORMS.map(p => <button key={p.id} onClick={() => setPlatform(p.id)} title={p.label} style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid', borderColor: platform === p.id ? '#1a1a1a' : 'rgba(0,0,0,0.12)', background: platform === p.id ? '#1a1a1a' : 'white', color: platform === p.id ? 'white' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{p.icon}</button>)}
            {TONES.map(t => <button key={t} onClick={() => setTone(t)} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 999, border: '1px solid', borderColor: tone === t ? '#1a1a1a' : 'rgba(0,0,0,0.12)', background: tone === t ? '#1a1a1a' : 'white', color: tone === t ? 'white' : '#4a4a4a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{t}</button>)}
            <button onClick={generate} disabled={loading} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
              {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : null}Regenerate
            </button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af', fontSize: 14, padding: '20px 0' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Writing your posts...</div>}
          {posts.map((post, i) => (
            <div key={i} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8e8ea0', letterSpacing: 0.5 }}>VARIATION {i + 1}</span>
                <button onClick={() => copy(post, `${i}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                  {copied === `${i}` ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}{copied === `${i}` ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: 'Inter, sans-serif' }}>{post}</p>
              {platform === 'twitter' && <p style={{ fontSize: 11, color: post.length > 280 ? '#ef4444' : '#8e8ea0', marginTop: 8 }}>{post.length}/280</p>}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}