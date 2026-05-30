'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Paperclip, X, Image as ImageIcon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: any
  imagePreview?: string
}

const QUICK_PROMPTS = [
  'Summarize something for me',
  'Help me write an email',
  'Explain a concept',
  'Review my code',
  'Brainstorm ideas',
  'Draft a social post',
]

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachment, setAttachment] = useState<{ base64: string; mediaType: string; preview: string } | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      const base64 = result.split(',')[1]
      setAttachment({
        base64,
        mediaType: file.type as any,
        preview: result,
      })
    }
    reader.readAsDataURL(file)
  }

  const buildApiMessages = (msgs: Message[], userText: string, img: typeof attachment) => {
    const history = msgs.map((m) => ({
      role: m.role,
      content: Array.isArray(m.content) ? m.content : m.content,
    }))

    let newContent: any
    if (img) {
      newContent = [
        {
          type: 'image',
          source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
        },
        { type: 'text', text: userText || 'What do you see in this image?' },
      ]
    } else {
      newContent = userText
    }

    return [...history, { role: 'user', content: newContent }]
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

    const apiMessages = buildApiMessages(messages, text, attachment)
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setAttachment(null)
    setLoading(true)
    setStreaming('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok) throw new Error('API error')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              full += parsed.text
              setStreaming(full)
            } catch {}
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: full }])
      setStreaming('')
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const newChat = () => {
    setMessages([])
    setStreaming('')
    setAttachment(null)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <span className="text-xs text-gray-400 font-medium tracking-widest uppercase">Chat</span>
        <button
          onClick={newChat}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <Plus size={14} />
          New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-8 pb-10">
            <div className="text-center">
              <p className="text-2xl font-light text-gray-300 tracking-wide">How can I help?</p>
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-md w-full">
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(p); textareaRef.current?.focus() }}
                  className="text-left text-xs text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 transition-colors leading-relaxed"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl ${msg.role === 'user' ? 'max-w-lg' : 'max-w-2xl'}`}>
              {msg.imagePreview && (
                <div className="mb-2 flex justify-end">
                  <img src={msg.imagePreview} alt="uploaded" className="max-h-48 rounded-xl border border-gray-200" />
                </div>
              )}
              <div
                className={
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed'
                    : 'text-gray-800 text-sm leading-relaxed'
                }
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-cyan-600 prose-a:underline prose-a:font-medium prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline font-medium hover:text-cyan-700">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p>{Array.isArray(msg.content) ? msg.content.find((c: any) => c.type === 'text')?.text : msg.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div className="max-w-2xl text-gray-800 text-sm leading-relaxed">
              <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-cyan-600 prose-a:underline prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline font-medium hover:text-cyan-700">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {streaming}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {loading && !streaming && (
          <div className="flex justify-start">
            <div className="flex gap-1 pt-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 px-4 py-4">
        {attachment && (
          <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2">
            <img src={attachment.preview} alt="attachment" className="h-12 w-12 object-cover rounded-lg border border-gray-200" />
            <span className="text-xs text-gray-400">Image attached</span>
            <button onClick={() => setAttachment(null)} className="ml-auto text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-gray-400 hover:text-cyan-500 transition-colors pb-3 flex-shrink-0"
            title="Attach image"
          >
            <Paperclip size={18} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask Mikkal anything..."
            rows={1}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none outline-none focus:border-cyan-300 focus:ring-1 focus:ring-cyan-100 leading-relaxed max-h-40 transition-colors"
            style={{ minHeight: '46px' }}
          />
          <button
            onClick={send}
            disabled={(!input.trim() && !attachment) || loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
