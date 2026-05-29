'use client'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Plus, Paperclip, Mic, StopCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { v4 as uuidv4 } from 'uuid'
import toast from 'react-hot-toast'

interface Message { id: string; role: 'user' | 'assistant'; content: string }

const QUICK = [
  'Write me a professional email',
  'Help me plan a trip',
  'Build a spreadsheet template',
  'Create social media posts',
  'Write and explain some code',
  'Research a topic for me',
]

export default function ChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [streaming, setStreaming] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const firstName = session?.user?.name?.split(' ')[0] || 'Friend'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const send = async (text?: string) => {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: Message = { id: uuidv4(), role: 'user', content }
    const all = [...messages, userMsg]
    setMessages(all)
    setInput('')
    setLoading(true)
    setStreaming('')

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: all.map(m => ({ role: m.role, content: m.content })) }),
      })

      if (!res.ok) throw new Error('Failed')

      const data = await res.json()
setMessages(prev => [...prev, { id: uuidv4(), role: 'assistant', content: data.text }])
setStreaming('')
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const newChat = () => { setMessages([]); setStreaming(''); inputRef.current?.focus() }

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

        {/* Empty state */}
        {!messages.length && !streaming && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-200">
                <span className="font-display font-extrabold text-2xl text-white">M</span>
              </div>
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                What can I do for you, {firstName}?
              </h2>
              <p className="text-gray-500 text-sm">
                Ask me anything. Build anything. I'm your one-stop shop.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              {QUICK.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 text-sm hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-4xl mx-auto ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <span className="font-display font-bold text-white text-xs">M</span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-200'
                  : 'bg-gray-50 border border-gray-200 text-gray-800'
              }`}>
                {msg.role === 'assistant'
                  ? <div className="mk-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown></div>
                  : <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                }
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-display font-bold text-white text-xs">
                    {firstName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Streaming */}
        {streaming && (
          <div className="flex gap-3 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="font-display font-bold text-white text-xs animate-pulse">M</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 max-w-[85%]">
              <div className="mk-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{streaming}</ReactMarkdown></div>
            </div>
          </div>
        )}

        {/* Typing dots */}
        {loading && !streaming && (
          <div className="flex gap-3 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-cyan-500 flex items-center justify-center">
              <span className="font-display font-bold text-white text-xs">M</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-typing"
                    style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-3 focus-within:border-cyan-300 focus-within:bg-white focus-within:shadow-sm transition-all duration-200">
            <button onClick={newChat} className="text-gray-400 hover:text-gray-600 transition-colors pb-1" title="New chat">
              <Plus size={18} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask Mikkal anything..."
              rows={1}
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 resize-none outline-none text-sm leading-relaxed max-h-40"
            />
            <button className="text-gray-400 hover:text-gray-600 transition-colors pb-1" title="Attach">
              <Paperclip size={18} />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors pb-1" title="Voice">
              <Mic size={18} />
            </button>
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-cyan-500 text-white flex items-center justify-center hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <StopCircle size={15} /> : <Send size={15} />}
            </button>
          </div>
          <p className="text-gray-400 text-xs text-center mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
