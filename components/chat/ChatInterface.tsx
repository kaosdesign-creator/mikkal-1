'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, X, FileText, Camera, Search, Image as ImageIcon, FileSpreadsheet, FileType } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message { role: 'user' | 'assistant'; content: any; imagePreview?: string; id: string }
interface Props { conversationId?: string | null; onConversationUpdate?: () => void; userName?: string; isMobile?: boolean }

const FOLLOW_UPS = [
  ['Tell me more', 'Give me an example', 'What are the next steps?'],
  ['Write this for me', 'Make it shorter', 'Simplify this'],
  ['Research this further', 'Compare alternatives', 'How do I get started?'],
  ['Create a template', 'Turn this into a list', 'What should I avoid?'],
]

function getGreeting(name: string) {
  const h = new Date().getHours()
  if (h < 12) return `Good morning, ${name} 👋`
  if (h < 17) return `Good afternoon, ${name} 👋`
  if (h < 21) return `Good evening, ${name} 👋`
  return `Back at it, ${name} 👋`
}

const MENU_ITEMS = [
  { icon: <ImageIcon size={15} />, label: 'Add files or photos', shortcut: 'Ctrl+U', key: 'file' },
  { icon: <Camera size={15} />, label: 'Take a screenshot', key: 'screenshot' },
  { icon: <FileText size={15} />, label: 'Upload document / PDF', key: 'file' },
  { icon: <Search size={15} />, label: 'Web search', key: 'search' },
  { icon: <FileType size={15} />, label: 'Create Word document', key: 'word' },
  { icon: <FileSpreadsheet size={15} />, label: 'Create Excel spreadsheet', key: 'excel' },
]

// InputArea is defined OUTSIDE ChatInterface so it never gets recreated on re-render —
// this fixes the "one character at a time" focus-loss bug.
function InputArea({
  input, setInput, onKeyDown, autoResize, textareaRef,
  listening, startVoice, stopVoice, send,
  attachment, setAttachment,
  showMenu, setShowMenu, menuRef, fileRef, handleFile, onMenuAction,
}: {
  input: string
  setInput: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  autoResize: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  listening: boolean
  startVoice: () => void
  stopVoice: () => void
  send: (overrideText?: string) => void
  attachment: { base64: string; mediaType: string; preview: string } | null
  setAttachment: (v: any) => void
  showMenu: boolean
  setShowMenu: (v: boolean) => void
  menuRef: React.RefObject<HTMLDivElement>
  fileRef: React.RefObject<HTMLInputElement>
  handleFile: (file: File) => void
  onMenuAction: (key: string) => void
  loading: boolean
}) {
  return (
    <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
      {attachment && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 12px', background: '#f9f9f8', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)' }}>
          <img src={attachment.preview} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
          <span style={{ fontSize: 12, color: '#8e8ea0', fontFamily: 'Inter, sans-serif' }}>Image attached</span>
          <button onClick={() => setAttachment(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', display: 'flex' }}><X size={14} /></button>
        </div>
      )}
      <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: 16, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'visible', position: 'relative' }}>
        <textarea ref={textareaRef} value={input} onChange={autoResize} onKeyDown={onKeyDown}
          placeholder={listening ? 'Listening...' : 'Message Mikkal...'}
          rows={1}
          style={{ width: '100%', border: 'none', outline: 'none', padding: '15px 16px 0', fontSize: 15, fontFamily: 'Inter, sans-serif', color: '#1a1a1a', resize: 'none', background: 'transparent', lineHeight: 1.6, minHeight: 50, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 4 }}>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', fontSize: 22, fontWeight: 300, padding: '2px 8px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>+</button>
            {showMenu && (
              <div style={{ position: 'absolute', bottom: '110%', left: 0, background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 230, overflow: 'hidden', zIndex: 100 }}>
                {MENU_ITEMS.map((item, i) => (
                  <button key={i} onClick={() => onMenuAction(item.key)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', background: 'none', border: 'none', borderBottom: i < MENU_ITEMS.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none', cursor: 'pointer', fontSize: 14, color: '#1a1a1a', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f9f9f8'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ color: '#8e8ea0' }}>{item.icon}</span>{item.label}</span>
                    {(item as any).shortcut && <span style={{ fontSize: 11, color: '#c0c0c0' }}>{(item as any).shortcut}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.md,.csv,.doc,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <div style={{ flex: 1 }} />
          <button onClick={listening ? stopVoice : startVoice}
            style={{ background: listening ? '#fee2e2' : 'none', border: 'none', cursor: 'pointer', color: listening ? '#ef4444' : '#8e8ea0', padding: 6, borderRadius: 8, display: 'flex' }}>
            {listening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
          <button onClick={() => send()} disabled={!input.trim() && !attachment}
            style={{ background: (!input.trim() && !attachment) ? '#e5e7eb' : '#1a1a1a', color: (!input.trim() && !attachment) ? '#9ca3af' : 'white', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!input.trim() && !attachment) ? 'not-allowed' : 'pointer', transition: 'all 0.15s', flexShrink: 0 }}>
            <Send size={15} />
          </button>
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#c0c0c0', marginTop: 7, fontFamily: 'Inter, sans-serif' }}>Shift+Enter to send · Enter for new line</p>
    </div>
  )
}

export default function ChatInterface({ conversationId = null, onConversationUpdate, userName = 'there', isMobile = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachment, setAttachment] = useState<{ base64: string; mediaType: string; preview: string } | null>(null)
  const [listening, setListening] = useState(false)
  const [copiedId, setCopiedId] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null)
  const [chatStarted, setChatStarted] = useState(false)
  const [followUps, setFollowUps] = useState<string[]>([])

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setActiveConvoId(conversationId || null) }, [conversationId])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streaming])

  useEffect(() => {
    if (!conversationId) { setMessages([]); setChatStarted(false); setFollowUps([]); return }
    fetch(`/api/messages?conversationId=${conversationId}`).then(r => r.json()).then(d => {
      const msgs = (d.messages || []).map((m: any) => ({ role: m.role, content: m.content, id: m.id }))
      setMessages(msgs)
      if (msgs.length > 0) setChatStarted(true)
    })
  }, [conversationId])

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleFile = (file: File) => {
    setShowMenu(false)
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setAttachment({ base64: result.split(',')[1], mediaType: file.type, preview: result })
    }
    reader.readAsDataURL(file)
  }

  const onMenuAction = (key: string) => {
    if (key === 'file') { fileRef.current?.click(); return }
    if (key === 'screenshot') { alert('Screenshot coming soon'); setShowMenu(false); return }
    if (key === 'search') { setInput(i => i + ' [search the web]'); setShowMenu(false); return }
    if (key === 'word') { setInput('Create a Word document: '); setShowMenu(false); return }
    if (key === 'excel') { setInput('Create an Excel spreadsheet: '); setShowMenu(false); return }
  }

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice input requires Chrome'); return }
    const r = new SR(); r.continuous = false; r.interimResults = true; r.lang = 'en-US'
    r.onresult = (e: any) => setInput(Array.from(e.results).map((x: any) => x[0].transcript).join(''))
    r.onend = () => setListening(false)
    recognitionRef.current = r; r.start(); setListening(true)
  }

  const stopVoice = () => { recognitionRef.current?.stop(); setListening(false) }

  const createConvo = async (title: string) => {
    const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) })
    return (await res.json()).conversation?.id || null
  }

  const send = async (overrideText?: string) => {
    const text = (overrideText !== undefined ? overrideText : input).trim()
    if ((!text && !attachment) || loading) return

    let convoId = activeConvoId
    if (!convoId) { convoId = await createConvo(text.slice(0, 60)); setActiveConvoId(convoId) }

    const userMsg: Message = {
      role: 'user',
      content: attachment ? [{ type: 'image', source: { type: 'base64', media_type: attachment.mediaType, data: attachment.base64 } }, { type: 'text', text: text || 'What do you see?' }] : text,
      imagePreview: attachment?.preview,
      id: Date.now().toString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachment(null)
    setLoading(true)
    setStreaming('')
    setChatStarted(true)
    setFollowUps([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const apiMessages = [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg.content }]
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: apiMessages, conversationId: convoId }) })
      if (!res.ok) throw new Error('API error')
      const reader = res.body!.getReader(); const decoder = new TextDecoder(); let full = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (line.startsWith('data: ')) { const d = line.slice(6); if (d === '[DONE]') break; try { full += JSON.parse(d).text; setStreaming(full) } catch {} }
        }
      }
      setMessages(prev => [...prev, { role: 'assistant', content: full, id: (Date.now() + 1).toString() }])
      setStreaming('')
      setFollowUps(FOLLOW_UPS[Math.floor(Math.random() * FOLLOW_UPS.length)])
      onConversationUpdate?.()
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.', id: Date.now().toString() }])
    } finally { setLoading(false) }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); send() }
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const copyMsg = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const inputAreaProps = {
    input, setInput, onKeyDown, autoResize, textareaRef,
    listening, startVoice, stopVoice, send,
    attachment, setAttachment,
    showMenu, setShowMenu, menuRef, fileRef, handleFile, onMenuAction,
    loading,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: 'Inter, sans-serif' }}>
      {!chatStarted ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 300, color: '#1a1a1a', marginBottom: 36, textAlign: 'center' }}>{getGreeting(userName)}</h1>
          <InputArea {...inputAreaProps} />
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px 0' }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              {messages.map((msg, i) => (
                <div key={msg.id || i}>
                  {msg.role === 'user' ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                      <div style={{ background: '#f4f4f4', borderRadius: '18px 18px 4px 18px', padding: '12px 18px', maxWidth: '70%', fontSize: 15, color: '#1a1a1a', lineHeight: 1.6, fontFamily: 'Inter, sans-serif' }}>
                        {msg.imagePreview && <img src={msg.imagePreview} alt="" style={{ maxHeight: 200, borderRadius: 8, marginBottom: 8, display: 'block' }} />}
                        {typeof msg.content === 'string' ? msg.content : msg.content?.find((c: any) => c.type === 'text')?.text}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 8 }}>
                      <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-strong:font-semibold prose-a:text-blue-600 prose-a:underline prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:rounded-xl" style={{ fontSize: 15, lineHeight: 1.75, color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>{children}</a> }}>{msg.content}</ReactMarkdown>
                      </div>
                      <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
                        <button onClick={() => copyMsg(msg.content, msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', padding: '4px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                          {copiedId === msg.id ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', padding: '4px 8px', borderRadius: 6, display: 'flex' }}><ThumbsUp size={13} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', padding: '4px 8px', borderRadius: 6, display: 'flex' }}><ThumbsDown size={13} /></button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', padding: '4px 8px', borderRadius: 6, display: 'flex' }}><RotateCcw size={13} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {streaming && (
                <div style={{ marginBottom: 8, fontSize: 15, lineHeight: 1.75, color: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
                  </div>
                </div>
              )}
              {loading && !streaming && (
                <div style={{ display: 'flex', gap: 5, padding: '8px 0', marginBottom: 20 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', display: 'inline-block', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              )}
              {followUps.length > 0 && !loading && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {followUps.map((f, i) => (
                    <button key={i} onClick={() => send(f)}
                      style={{ fontSize: 13, color: '#4a4a4a', background: '#f4f4f4', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 999, padding: '7px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#ebebeb'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#f4f4f4'}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
          <div style={{ padding: '12px 24px 20px', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <InputArea {...inputAreaProps} />
          </div>
        </>
      )}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }`}</style>
    </div>
  )
}
