'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare, Search, Image, Code2, FileText, Share2,
  Menu, X, LogOut, Plus, Trash2, ChevronDown, Settings
} from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import ResearchInterface from '@/components/research/ResearchInterface'
import ImagesInterface from '@/components/images/ImagesInterface'
import CodeInterface from '@/components/code/CodeInterface'
import DocumentsInterface from '@/components/documents/DocumentsInterface'
import SocialInterface from '@/components/social/SocialInterface'

const MODULES = [
  { id: 'chat',     label: 'Chat',      icon: MessageSquare, desc: 'Conversation & analysis' },
  { id: 'research', label: 'Research',  icon: Search,        desc: 'Web search & insights' },
  { id: 'images',   label: 'Images',    icon: Image,         desc: 'AI image generation' },
  { id: 'code',     label: 'Code',      icon: Code2,         desc: 'Write & review code' },
  { id: 'docs',     label: 'Documents', icon: FileText,      desc: 'Analyze files & PDFs' },
  { id: 'social',   label: 'Social',    icon: Share2,        desc: 'Content creation' },
]

interface Conversation {
  id: string
  title: string
  last_message: string
  updated_at: string
}

function groupConversations(convos: Conversation[]) {
  const now = new Date()
  const today: Conversation[] = []
  const yesterday: Conversation[] = []
  const thirtyDays: Conversation[] = []
  const older: Conversation[] = []

  convos.forEach(c => {
    const d = new Date(c.updated_at)
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) today.push(c)
    else if (diffDays === 1) yesterday.push(c)
    else if (diffDays <= 30) thirtyDays.push(c)
    else older.push(c)
  })

  return { today, yesterday, thirtyDays, older }
}

export default function DashboardPage() {
  const [module, setModule] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [showModules, setShowModules] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
    loadConversations()
  }, [])

  const loadConversations = async () => {
    const res = await fetch('/api/conversations')
    if (res.ok) {
      const data = await res.json()
      setConversations(data.conversations || [])
    }
  }

  const newChat = async () => {
    setModule('chat')
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' }),
    })
    const data = await res.json()
    setActiveConvo(data.conversation.id)
    await loadConversations()
  }

  const deleteConvo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch('/api/conversations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (activeConvo === id) setActiveConvo(null)
    await loadConversations()
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'MK'
  const grouped = groupConversations(conversations)

  const ConvoGroup = ({ label, items }: { label: string; items: Conversation[] }) => {
    if (!items.length) return null
    return (
      <div className="mb-4">
        <p className="text-xs text-gray-400 px-3 mb-1 font-medium">{label}</p>
        {items.map(c => (
          <div
            key={c.id}
            onClick={() => { setModule('chat'); setActiveConvo(c.id) }}
            className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              activeConvo === c.id ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <MessageSquare size={13} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate flex-1">{c.title}</span>
            <button
              onClick={e => deleteConvo(c.id, e)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#f5f4f1] overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 transition-all duration-300 bg-white border-r border-gray-100 flex flex-col`}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-100">
          <div
            className="text-2xl tracking-widest text-gray-900"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span style={{ fontWeight: 400 }}>MI</span>
            <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
            <span style={{ fontWeight: 900 }}>K</span>
            <span style={{ fontWeight: 400 }}>AL</span>
          </div>
          <p className="text-xs text-gray-400 tracking-widest mt-1" style={{ fontFamily: "'Bungee Hairline', sans-serif" }}>
            WISDOM · INSIGHT · INTELLIGENCE
          </p>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>

        {/* Modules */}
        <div className="px-3 pt-4">
          <button
            onClick={() => setShowModules(!showModules)}
            className="w-full flex items-center justify-between px-1 mb-1"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Modules</span>
            <ChevronDown size={13} className={`text-gray-400 transition-transform ${showModules ? '' : '-rotate-90'}`} />
          </button>
          {showModules && (
            <div className="space-y-0.5">
              {MODULES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setModule(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                    module === id && activeConvo === null
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={15} className={module === id && !activeConvo ? 'text-cyan-400' : 'text-gray-400'} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">History</p>
          <ConvoGroup label="Today" items={grouped.today} />
          <ConvoGroup label="Yesterday" items={grouped.yesterday} />
          <ConvoGroup label="Previous 30 Days" items={grouped.thirtyDays} />
          <ConvoGroup label="Older" items={grouped.older} />
          {conversations.length === 0 && (
            <p className="text-xs text-gray-400 px-3">No conversations yet</p>
          )}
        </div>

        {/* User */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
            </div>
            {user?.role === 'admin' && (
              <a href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors" title="Admin">
                <Settings size={14} />
              </a>
            )}
            <button onClick={logout} className="text-gray-400 hover:text-gray-700 transition-colors" title="Sign out">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-13 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0" style={{ height: '52px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-700 transition-colors">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {MODULES.find(m => m.id === module)?.label || 'Chat'}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-300">claude-sonnet-4</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
        </header>

        {/* Module content */}
        <main className="flex-1 overflow-hidden">
          {module === 'chat'     && <ChatInterface />}
          {module === 'research' && <ResearchInterface />}
          {module === 'images'   && <ImagesInterface />}
          {module === 'code'     && <CodeInterface />}
          {module === 'docs'     && <DocumentsInterface />}
          {module === 'social'   && <SocialInterface />}
        </main>
      </div>
    </div>
  )
}
