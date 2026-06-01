'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Plus, Paperclip, X, Mic, MicOff, Type } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: any
  imagePreview?: string
}

interface Props {
  conversationId: string | null
  onConversationUpdate?: () => void
}

const QUICK_PROMPTS = [
  'Summarize something for me',
  'Help me write an email',
  'Explain a concept simply',
  'Review my code',
  'Brainstorm ideas',
  'Draft a social post',
]

export default function ChatInterface({ conversationId, onConversationUpdate }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachment, setAttachment] = useState<{ base64: string; mediaType: string; preview: string } | null>(null)
  const [listening, setListening] = useState(false)
  const [typewriter, setTypewriter] = useState(true)
  const [displayed, setDisplayed] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const activeConvoId = useRef<string | null>(conversationId)

  useEffect(() => { activeConvoId.current = conversationId }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming, displayed])

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) { setMessages([]); return }
    fetch(`/api/messages?conversationId=${conversationId}`)
      .then(r => r.json())
      .then(d => {
        const msgs = (d.messages || []).map((m: any) => ({ role: m.role, content: m.content }))
        setMessages(msgs)
      })
  }, [conversationId])

  // Typewriter effect
  useEffect(() => {
    if (!typewriter || !streaming) { setDisplayed(streaming); return }
    if (streaming.length <= displayed.length) return
    const timeout = setTimeout(() => {
      setDisplayed(streaming.slice(0, displayed.length + 3))
    }, 8)
    return () => clearTimeout(timeout)
  }, [streaming, displayed, typewriter])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setAttachment({ base64: result.split(',')[1], mediaType: file.type, preview: result })
    }
    reader.readAsDataURL(file)
  }

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return alert('Voice not supported in this browser')
    const recognition = new SpeechRecognition()
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

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const send = async () => {
    const text = input.trim()
    if ((!text && !attachment) || loading) return

    const userMsg: Message = {
      role: 'user',
      content: attachment
        ? [
            { type: 'image', source: { type: 'base64', media_type: attachment.mediaType, data: attachment.base64 } },
            { type: 'text', text: text || 'What do you see in this image?' },
          ]
        : text,
      imagePreview: attachment?.preview,
    }

    const apiMessages = [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg.content }]

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachment(null)
    setLoading(true)
    setStreaming('')
    setDisplayed('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, conversationId: activeConvoId.current }),
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
            try { full += JSON.parse(data).text; setStreaming(full) } catch {}
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }])
      setStreaming('')
      setDisplayed('')
      onConversationUpdate?.()
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const MarkdownContent = ({ content }: { content: string }) => (
    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:underline prose-a:font-medium prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-li:text-gray-800 prose-strong:text-gray-900">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors">
              {children}
            </a>
          ),
          code: ({ className, children, ...props }: any) => {
            const isBlock = className?.includes('language-')
            return isBlock ? (
              <code className={className} {...props}>{children}</code>
            ) : (
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800" {...props}>{children}</code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100">
        <button
          onClick={() => setTypewriter(!typewriter)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            typewriter ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-400 border-gray-200 hover:border-gray-400'
          }`}
        >
          <Type size={11} />
          Typewriter
        </button>
        <button
          onClick={() => { setMessages([]); setStreaming(''); setDisplayed('') }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Plus size={13} />
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-6 pb-10">
            <p className="text-2xl font-light text-gray-300">How can I help?</p>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => { setInput(p); textareaRef.current?.focus() }}
                  className="text-left text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={msg.role === 'user' ? 'max-w-lg' : 'max-w-2xl w-full'}>
              {msg.imagePreview && (
                <div className="mb-2 flex justify-end">
                  <img src={msg.imagePreview} alt="uploaded" className="max-h-48 rounded-xl border border-gray-200" />
                </div>
              )}
              {msg.role === 'user' ? (
                <div className="bg-gray-100 text-gray-900 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                  {typeof msg.content === 'string' ? msg.content : msg.content?.find((c: any) => c.type === 'text')?.text}
                </div>
              ) : (
                <MarkdownContent content={msg.content} />
              )}
            </div>
          </div>
        ))}

        {(streaming || (loading && !streaming)) && (
          <div className="flex justify-start">
            <div className="max-w-2xl w-full">
              {streaming ? (
                <MarkdownContent content={typewriter ? displayed : streaming} />
              ) : (
                <div className="flex gap-1 pt-2">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-4">
        {attachment && (
          <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2">
            <img src={attachment.preview} alt="attachment" className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
            <span className="text-xs text-gray-400">Image attached</span>
            <button onClick={() => setAttachment(null)} className="ml-auto text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
        )}
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} className="text-gray-400 hover:text-gray-700 transition-colors pb-3 flex-shrink-0" title="Attach image">
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={listening ? 'Listening...' : 'Ask Mikkal anything...'}
            rows={1}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none focus:border-gray-400 leading-relaxed max-h-40 transition-colors"
            style={{ minHeight: '46px' }}
          />
          <button
            onClick={listening ? stopVoice : startVoice}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
              listening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400'
            }`}
            title="Voice input"
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={send}
            disabled={(!input.trim() && !attachment) || loading}
            className="bg-gray-900 hover:bg-gray-800 disabled:opacity-30 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
