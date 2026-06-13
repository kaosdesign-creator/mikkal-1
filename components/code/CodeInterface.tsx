'use client'
import { useState } from 'react'
import { Code2, Copy, Check, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const LANGUAGES = ['JavaScript','TypeScript','Python','React','SQL','Bash','CSS','Go','Rust','Other']

function getGreeting(name: string) {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name} 👋`
  if (h < 17) return `Good afternoon, ${name} 👋`
  if (h < 21) return `Good evening, ${name} 👋`
  return `Back at it, ${name} 👋`
}

export default function CodeInterface({ userName = 'there', isMobile = false }: { userName?: string; isMobile?: boolean }) {
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState('TypeScript')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [started, setStarted] = useState(false)

  const generate = async (p?: string) => {
    const text = p || prompt
    if (!text.trim() || loading) return
    setLoading(true); setResult(''); setStarted(true)
    try {
      const res = await fetch('/api/code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: text, language }) })
      const data = await res.json()
      setResult(data.result || '')
    } catch { setResult('Code generation failed. Please try again.') }
    finally { setLoading(false) }
  }

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const InputArea = () => (
    <div style={{ width: '100%', maxWidth: 660, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={`Describe what you want to build in ${language}...`} rows={2}
        onKeyDown={e => { if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); generate() } }}
        style={{ width: '100%', border: 'none', outline: 'none', padding: '15px 16px 8px', fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#1a1a1a', resize: 'none', background: 'transparent', boxSizing: 'border-box', lineHeight: 1.6 }} />
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 5, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {LANGUAGES.map(l => <button key={l} onClick={() => setLanguage(l)} style={{ fontSize: 12, padding: '5px 11px', borderRadius: 999, border: '1px solid', borderColor: language === l ? '#1a1a1a' : 'rgba(0,0,0,0.12)', background: language === l ? '#1a1a1a' : 'white', color: language === l ? 'white' : '#4a4a4a', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{l}</button>)}
        </div>
        <button onClick={() => generate()} disabled={!prompt.trim() || loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: !prompt.trim() ? '#e5e7eb' : '#1a1a1a', color: !prompt.trim() ? '#9ca3af' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: !prompt.trim() ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
          {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Code2 size={14} />}Build
        </button>
      </div>
    </div>
  )

  if (!started) {
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
          <InputArea />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          {loading && <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af', fontSize: 14, padding: '20px 0' }}><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />Writing your code...</div>}
          {result && (
            <div>
              <button onClick={copy} style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#c0c0c0', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', zIndex: 10 }}>
                {copied ? <><Check size={12} style={{ color: '#4ade80' }} />Copied</> : <><Copy size={12} />Copy</>}
              </button>
              <div className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:rounded-xl prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded" style={{ fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}