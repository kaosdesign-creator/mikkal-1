'use client'
import { useState, useEffect } from 'react'
import {
  MessageSquare, Search, Image, Code2, FileText, Share2,
  Menu, X, LogOut, Plus, Trash2, ChevronDown, Settings,
  ExternalLink
} from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import ResearchInterface from '@/components/research/ResearchInterface'
import ImagesInterface from '@/components/images/ImagesInterface'
import CodeInterface from '@/components/code/CodeInterface'
import DocumentsInterface from '@/components/documents/DocumentsInterface'
import SocialInterface from '@/components/social/SocialInterface'

const MODULES = [
  { id: 'chat',     label: 'Chat',      icon: MessageSquare },
  { id: 'research', label: 'Research',  icon: Search },
  { id: 'images',   label: 'Images',    icon: Image },
  { id: 'code',     label: 'Code',      icon: Code2 },
  { id: 'docs',     label: 'Documents', icon: FileText },
  { id: 'social',   label: 'Social',    icon: Share2 },
]

interface Conversation {
  id: string
  title: string
  updated_at: string
}

function groupConversations(convos: Conversation[]) {
  const now = new Date()
  const today: Conversation[] = []
  const yesterday: Conversation[] = []
  const thirtyDays: Conversation[] = []
  const older: Conversation[] = []
  convos.forEach(c => {
    const diff = Math.floor((now.getTime() - new Date(c.updated_at).getTime()) / 86400000)
    if (diff === 0) today.push(c)
    else if (diff === 1) yesterday.push(c)
    else if (diff <= 30) thirtyDays.push(c)
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
    setActiveConvo(null)
  }

  const selectConvo = (id: string) => {
    setModule('chat')
    setActiveConvo(id)
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

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const initials = (user?.name || user?.email || 'MK').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const grouped = groupConversations(conversations)

  const ConvoGroup = ({ label, items }: { label: string; items: Conversation[] }) => {
    if (!items.length) return null
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#9ca3af', padding: '0 12px', marginBottom: 4, fontWeight: 500, letterSpacing: 0.5 }}>{label}</p>
        {items.map(c => (
          <div
            key={c.id}
            onClick={() => selectConvo(c.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              background: activeConvo === c.id ? '#f3f4f6' : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (activeConvo !== c.id) (e.currentTarget as HTMLDivElement).style.background = '#f9fafb' }}
            onMouseLeave={e => { if (activeConvo !== c.id) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            className="group"
          >
            <span style={{ fontSize: 13, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
              {c.title}
            </span>
            <button
              onClick={e => deleteConvo(c.id, e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: 0, flexShrink: 0, opacity: 0 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0'}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9fafb', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        background: 'white',
        borderRight: '1px solid #f0f0f0',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{
            fontFamily: 'var(--font-orbitron), Orbitron, sans-serif',
            fontSize: 22,
            letterSpacing: '7.2px',
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 400 }}>MI</span>
            <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
            <span style={{ fontWeight: 900 }}>K</span>
            <span style={{ fontWeight: 400 }}>AL</span>
          </div>
          <p style={{ fontFamily: 'var(--font-bungee), "Bungee Hairline", sans-serif', fontSize: 8, letterSpacing: 3, color: '#aaa', marginTop: 4 }}>
            WISDOM · INSIGHT · INTELLIGENCE
          </p>
        </div>

        {/* New Chat */}
        <div style={{ padding: '12px 12px 0' }}>
          <button
            onClick={newChat}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>

        {/* Modules */}
        <div style={{ padding: '16px 12px 0' }}>
          <button
            onClick={() => setShowModules(!showModules)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', marginBottom: 4 }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1 }}>MODULES</span>
            <ChevronDown size={12} style={{ color: '#9ca3af', transform: showModules ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </button>
          {showModules && MODULES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setModule(id); setActiveConvo(null) }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: module === id && !activeConvo ? '#1a1a1a' : 'transparent',
                color: module === id && !activeConvo ? 'white' : '#4b5563',
                fontSize: 13,
                fontWeight: 500,
                textAlign: 'left',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
                marginBottom: 1,
              }}
            >
              <Icon size={15} style={{ color: module === id && !activeConvo ? '#67e8f9' : '#9ca3af' }} />
              {label}
            </button>
          ))}
        </div>

        {/* History */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 0' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, padding: '0 2px', marginBottom: 8 }}>HISTORY</p>
          <ConvoGroup label="Today" items={grouped.today} />
          <ConvoGroup label="Yesterday" items={grouped.yesterday} />
          <ConvoGroup label="Previous 30 Days" items={grouped.thirtyDays} />
          <ConvoGroup label="Older" items={grouped.older} />
          {conversations.length === 0 && (
            <p style={{ fontSize: 12, color: '#d1d5db', padding: '0 4px', fontFamily: 'Inter, sans-serif' }}>No conversations yet</p>
          )}
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid #f0f0f0', padding: 12 }}>
          {/* Microsoft 365 coming soon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, marginBottom: 4, opacity: 0.5 }}>
            <ExternalLink size={13} style={{ color: '#9ca3af' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>Microsoft 365 — Coming Soon</span>
          </div>

          {/* Extensions */}
          <a
            href="https://www.anthropic.com/claude-extensions"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', marginBottom: 8 }}
          >
            <ExternalLink size={13} style={{ color: '#9ca3af' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>Extensions</span>
          </a>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#1a1a1a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || firstName}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            {user?.role === 'admin' && (
              <a href="/admin" style={{ color: '#9ca3af', flexShrink: 0 }} title="Admin">
                <Settings size={13} />
              </a>
            )}
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }} title="Sign out">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{
          height: 50,
          background: 'white',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
            {MODULES.find(m => m.id === module)?.label}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#d1d5db', fontFamily: 'monospace' }}>claude-sonnet-4</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {module === 'chat'     && <ChatInterface conversationId={activeConvo} onConversationUpdate={loadConversations} userName={firstName} />}
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
