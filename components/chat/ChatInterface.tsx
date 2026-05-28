'use client'
import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Plus, Paperclip, Mic, StopCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface Message {
  id:      string
  role:    'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  "Write me a professional email",
  "Help me plan a trip",
  "Build a spreadsheet",
  "Create social media posts",
  "Write some code",
  "Research a topic",
]

export default function ChatInterface() {
  const { user } = useUser()
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [conversationId, setConversationId] = useState<string>(uuidv4())
  const [streaming, setStreaming]       = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const firstName = user?.firstName || user?.username || 'Friend'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleSubmit = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: uuidv4(), role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setStreaming('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          conversationId,
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setMessages(prev => [...prev, {
                id:      uuidv4(),
                role:    'assistant',
                content: fullText,
              }])
              setStreaming('')
            } else {
              try {
                const parsed = JSON.parse(data)
                fullText += parsed.text
                setStreaming(fullText)
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      toast.error('Something went wrong. Try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const newChat = () => {
    setMessages([])
    setConversationId(uuidv4())
    setStreaming('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">

        {/* Empty state */}
        {messages.length === 0 && !streaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-charcoal border border-brand-border flex items-center justify-center mx-auto mb-4">
                <span className="font-display font-800 text-2xl text-brand-cyan">M</span>
              </div>
              <h2 className="font-display font-700 text-2xl text-brand-white mb-2">
                What can I do for you, {firstName}?
              </h2>
              <p className="text-brand-muted text-sm font-body">
                Ask me anything. Build anything. I'm your one-stop shop.
              </p>
            </div>

            {/* Quick prompts */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(prompt)}
                  className="text-left px-4 py-3 bg-brand-charcoal border border-brand-border rounded-xl text-brand-muted text-sm font-body hover:border-brand-cyan hover:text-brand-white transition-all duration-150"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-brand-charcoal border border-brand-border flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-display font-800 text-xs text-brand-cyan">M</span>
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-brand-cyan text-brand-navy font-body'
                    : 'bg-brand-charcoal border border-brand-border text-brand-white'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="mikkal-prose">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mt-1 border border-brand-border">
                  {user?.imageUrl
                    ? <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-brand-amber flex items-center justify-center">
                        <span className="font-display text-xs font-700 text-brand-navy">
                          {firstName[0]?.toUpperCase()}
                        </span>
                      </div>
                  }
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming response */}
        {streaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 max-w-4xl mx-auto justify-start"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-charcoal border border-brand-border flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-display font-800 text-xs text-brand-cyan animate-pulse">M</span>
            </div>
            <div className="bg-brand-charcoal border border-brand-border rounded-2xl px-4 py-3 max-w-[85%]">
              <div className="mikkal-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {loading && !streaming && (
          <div className="flex gap-3 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-brand-charcoal border border-brand-border flex items-center justify-center">
              <span className="font-display font-800 text-xs text-brand-cyan">M</span>
            </div>
            <div className="bg-brand-charcoal border border-brand-border rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-brand-cyan animate-typing"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-brand-border p-4 bg-brand-surface">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-brand-charcoal border border-brand-border rounded-2xl p-3 focus-within:border-brand-cyan transition-colors duration-200">

            {/* New chat */}
            <button
              onClick={newChat}
              className="text-brand-muted hover:text-brand-white transition-colors flex-shrink-0 pb-1"
              title="New chat"
            >
              <Plus size={18} />
            </button>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Mikkal anything..."
              rows={1}
              className="flex-1 bg-transparent text-brand-white placeholder-brand-muted resize-none outline-none font-body text-sm leading-relaxed max-h-40"
              style={{ overflowY: input.split('\n').length > 5 ? 'auto' : 'hidden' }}
            />

            {/* Attach */}
            <button
              className="text-brand-muted hover:text-brand-white transition-colors flex-shrink-0 pb-1"
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>

            {/* Voice */}
            <button
              className="text-brand-muted hover:text-brand-white transition-colors flex-shrink-0 pb-1"
              title="Voice input"
            >
              <Mic size={18} />
            </button>

            {/* Send */}
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-brand-cyan text-brand-navy flex items-center justify-center flex-shrink-0 hover:bg-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
              {loading
                ? <StopCircle size={16} />
                : <Send size={16} />
              }
            </button>
          </div>

          <p className="text-brand-muted text-xs text-center mt-2 font-body">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
