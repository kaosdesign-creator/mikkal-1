'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, X, Mic, MicOff, Copy, Edit3, Check, FileText, Camera, Search, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: any
  imagePreview?: string
  id: string
}

interface Props {
  conversationId?: string | null
  onConversationUpdate?: () => void
  userName?: string
}

const QUICK_PROMPTS = [
  'Help me write something',
  'Research a topic',
  'Review my code',
  'Analyze a document',
  'Create social content',
  'Brainstorm ideas',
]

export default function ChatInterface({ conversationId = null, onConversationUpdate, userName = 'there' }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachment, setAttachment] = useState<{ base64: string; mediaType: string; preview: string } | null>(null)
  const [listening, setListening] = useState(false)
  const [copiedId, setCopiedId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [editText, setEditText] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null)
  const [chatStarted, setChatStarted] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const attachMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setActiveConvoId(conversationId || null) }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  useEffect(() => {
    if (!conversationId) { setMessages([]); setChatStarted(false); return }
    fetch(`/api/messages?conversationId=${conversationId}`)
      .then(r => r.json())
      .then(d => {
        const msgs = (d.messages || []).map((m: any) => ({ role: m.role, content: m.content, id: m.id }))
        setMessages(msgs)
        if (msgs.length > 0) setChatStarted(true)
      })
  }, [conversationId])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleFile = (file: File) => {
    setShowAttachMenu(false)
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setAttachment({ base64: result.split(',')[1], mediaType: file.type, preview: result })
    }
    reader.readAsDataURL(file)
  }

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported in this browser. Try Chrome.'); return }
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('')
      setInput(transcript)
    }
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopVoice = () => { recognitionRef.current?.stop(); setListening(false) }

  const createConversation = async (title: string) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const data = await res.json()
    return data.conversation?.id || null
  }

  const send = async (overrideText?: string) => {
    const text = (overrideText || input).trim()
    if ((!text && !attachment) || loading) return

    let convoId = activeConvoId
    if (!convoId) {
      convoId = await createConversation(text.slice(0, 60))
      setActiveConvoId(convoId)
    }

    const msgId = Date.now().toString()
    const userMsg: Message = {
      role: 'user',
      content: attachment
        ? [
            { type: 'image', source: { type: 'base64', media_type: attachment.mediaType, data: attachment.base64 } },
            { type: 'text', text: text || 'What do you see in this image?' },
          ]
        : text,
      imagePreview: attachment?.preview,
      id: msgId,
    }

    const apiMessages = [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg.content }]

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachment(null)
    setLoading(true)
    setStreaming('')
    setChatStarted(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, conversationId: convoId }),
      })

      if (!res.ok) throw new Error('API error')
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try { full += JSON.parse(data).text; setStreaming(full) } catch { /* ignore */ }
          }
        }
      }

      const assistantId = (Date.now() + 1).toString()
      setMessages(prev => [...prev, { role: 'assistant', content: full, id: assistantId }])
      setStreaming('')
      onConversationUpdate?.()
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.', id: Date.now().toString() }])
    } finally {
      setLoading(false)
    }
  }

  const copyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content))
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const startEdit = (msg: Message) => {
    setEditingId(msg.id)
    setEditText(typeof msg.content === 'string' ? msg.content : '')
  }

  const saveEdit = async () => {
    if (!editText.trim()) return
    const idx = messages.findIndex(m => m.id === editingId)
    if (idx === -1) return
    const newMessages = messages.slice(0, idx)
    setMessages(newMessages)
    setEditingId('')
    await send(editText)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter sends
      e.preventDefault()
      send()
    }
    // Plain Enter = new line (default behavior, do nothing)
  }

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px'
  }

  const MarkdownContent = ({ content, msgId }: { content: string; msgId: string }) => (
    <div style={{ position: 'relative' }}>
      <div className="prose prose-sm max-w-none" style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        lineHeight: 1.7,
        color: '#1a1a1a',
      }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}>
                {children}
              </a>
            ),
            strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#111' }}>{children}</strong>,
            code: ({ className, children, ...props }: any) => {
              const isBlock = className?.includes('language-')
              return isBlock ? (
                <code className={className} {...props}>{children}</code>
              ) : (
                <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace', color: '#374151' }} {...props}>{children}</code>
              )
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      {/* Copy + Edit icons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={() => copyMessage(content, msgId)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s' }}
          title="Copy"
        >
          {copiedId === msgId ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
          {copiedId === msgId ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )

  const greetings = ['How can I help you today?', 'What are we working on?', 'Ready when you are.', 'What\'s on your mind?']
  const greeting = greetings[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', fontFamily: 'Inter, sans-serif' }}>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: chatStarted ? '24px 0' : 0 }}>
        {!chatStarted ? (
          /* Empty state - centered */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', paddingBottom: 80 }}>
            <p style={{ fontSize: 28, fontWeight: 300, color: '#1a1a1a', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
              Back at it, {userName} 👋
            </p>
            <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 40 }}>{greeting}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 440, width: '100%', padding: '0 24px' }}>
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => { setInput(p); textareaRef.current?.focus() }}
                  style={{
                    textAlign: 'left',
                    fontSize: 13,
                    color: '#4b5563',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: 12,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px' }}>
            {messages.map((msg, i) => (
              <div key={msg.id || i} style={{ marginBottom: 24, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: msg.role === 'user' ? '70%' : '100%', width: msg.role === 'assistant' ? '100%' : 'auto' }}>
                  {msg.imagePreview && (
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'flex-end' }}>
                      <img src={msg.imagePreview} alt="uploaded" style={{ maxHeight: 200, borderRadius: 12, border: '1px solid #e5e7eb' }} />
                    </div>
                  )}
                  {msg.role === 'user' ? (
                    editingId === msg.id ? (
                      <div>
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          style={{ width: '100%', border: '1.5px solid #1a1a1a', borderRadius: 12, padding: '10px 14px', fontSize: 14, fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none', minHeight: 80 }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <button onClick={saveEdit} style={{ background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Send</button>
                          <button onClick={() => setEditingId('')} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <div style={{ background: '#f3f4f6', borderRadius: '18px 18px 4px 18px', padding: '12px 16px', fontSize: 14, color: '#1a1a1a', lineHeight: 1.6 }}>
                          {typeof msg.content === 'string' ? msg.content : msg.content?.find((c: any) => c.type === 'text')?.text}
                        </div>
                        <button
                          onClick={() => startEdit(msg)}
                          style={{ position: 'absolute', right: -28, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 2 }}
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                      </div>
                    )
                  ) : (
                    <MarkdownContent content={msg.content} msgId={msg.id} />
                  )}
                </div>
              </div>
            ))}

            {streaming && (
              <div style={{ marginBottom: 24 }}>
                <MarkdownContent content={streaming} msgId="streaming" />
              </div>
            )}

            {loading && !streaming && (
              <div style={{ display: 'flex', gap: 6, padding: '8px 0' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db', display: 'inline-block', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{ padding: chatStarted ? '12px 24px 20px' : '0 24px 40px', maxWidth: chatStarted ? 'none' : 600, margin: chatStarted ? 0 : '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {attachment && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px 12px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
            <img src={attachment.preview} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>Image attached</span>
            <button onClick={() => setAttachment(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={14} /></button>
          </div>
        )}

        <div style={{
          border: '1.5px solid #e5e7eb',
          borderRadius: 16,
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'visible',
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={autoResize}
            onKeyDown={onKeyDown}
            placeholder={listening ? 'Listening...' : 'Ask Mikkal anything... (Shift+Enter to send, Enter for new line)'}
            rows={1}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              padding: '14px 16px 0',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              color: '#1a1a1a',
              resize: 'none',
              background: 'transparent',
              lineHeight: 1.6,
              minHeight: 46,
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 4 }}>
            {/* Attach menu */}
            <div style={{ position: 'relative' }} ref={attachMenuRef}>
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Add files"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
              {showAttachMenu && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: 8,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  minWidth: 200,
                  overflow: 'hidden',
                  zIndex: 100,
                }}>
                  {[
                    { icon: <ImageIcon size={15} />, label: 'Add photo or image', action: () => fileRef.current?.click() },
                    { icon: <Camera size={15} />, label: 'Take a screenshot', action: () => { alert('Screenshot feature coming soon'); setShowAttachMenu(false) } },
                    { icon: <FileText size={15} />, label: 'Upload document / PDF', action: () => fileRef.current?.click() },
                    { icon: <Search size={15} />, label: 'Web search', action: () => { setInput(input + ' [search the web for this]'); setShowAttachMenu(false) } },
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '11px 16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 13,
                        color: '#374151',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'left',
                        borderBottom: i < 3 ? '1px solid #f9fafb' : 'none',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                    >
                      <span style={{ color: '#6b7280' }}>{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*,.pdf,.txt,.md,.csv,.doc,.docx" className="hidden" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {/* Voice */}
            <button
              onClick={listening ? stopVoice : startVoice}
              style={{
                background: listening ? '#fee2e2' : 'none',
                border: 'none',
                cursor: 'pointer',
                color: listening ? '#ef4444' : '#9ca3af',
                padding: 6,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Voice input"
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <div style={{ flex: 1 }} />

            {/* Send */}
            <button
              onClick={() => send()}
              disabled={(!input.trim() && !attachment) || loading}
              style={{
                background: (!input.trim() && !attachment) || loading ? '#e5e7eb' : '#1a1a1a',
                color: (!input.trim() && !attachment) || loading ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: 10,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (!input.trim() && !attachment) || loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#d1d5db', marginTop: 8, fontFamily: 'Inter, sans-serif' }}>
          Shift+Enter to send · Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
