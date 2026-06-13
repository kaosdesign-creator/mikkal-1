'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, Search, Image, Code2, Share2, Plus, Trash2, LogOut, Settings, PanelLeft, ExternalLink, X, Menu } from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import ResearchInterface from '@/components/research/ResearchInterface'
import ImagesInterface from '@/components/images/ImagesInterface'
import CodeInterface from '@/components/code/CodeInterface'
import SocialInterface from '@/components/social/SocialInterface'

const MODULES = [
  { id: 'chat',     label: 'Chat',     icon: MessageSquare },
  { id: 'research', label: 'Research', icon: Search },
  { id: 'images',   label: 'Images',   icon: Image },
  { id: 'code',     label: 'Code',     icon: Code2 },
  { id: 'social',   label: 'Social',   icon: Share2 },
]

interface Convo { id: string; title: string; updated_at: string }

function groupConvos(convos: Convo[]) {
  const now = new Date()
  const today: Convo[] = [], yesterday: Convo[] = [], thirty: Convo[] = [], older: Convo[] = []
  convos.forEach(c => {
    const d = Math.floor((now.getTime() - new Date(c.updated_at).getTime()) / 86400000)
    if (d === 0) today.push(c)
    else if (d === 1) yesterday.push(c)
    else if (d <= 30) thirty.push(c)
    else older.push(c)
  })
  return { today, yesterday, thirty, older }
}

export default function DashboardPage() {
  const [module, setModule] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [convos, setConvos] = useState<Convo[]>([])
  const [activeConvo, setActiveConvo] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true)
    else setSidebarOpen(false)
  }, [isMobile])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
    loadConvos()
  }, [])

  const loadConvos = async () => {
    const res = await fetch('/api/conversations')
    if (res.ok) setConvos((await res.json()).conversations || [])
  }

  const deleteConvo = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch('/api/conversations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (activeConvo === id) setActiveConvo(null)
    await loadConvos()
  }

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/' }

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const initials = (user?.name || user?.email || 'MK').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const grouped = groupConvos(convos)

  const Wordmark = ({ size = 20 }: { size?: number }) => (
    <div style={{ fontFamily: 'var(--font-orbitron), Orbitron, sans-serif', fontSize: size, color: '#1a1a1a', display: 'flex', alignItems: 'center' }}>
      <span style={{ fontWeight: 400 }}>M</span><span style={{ fontWeight: 400 }}>I</span>
      <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
      <span style={{ fontWeight: 900 }}>K</span><span style={{ fontWeight: 400 }}>A</span><span style={{ fontWeight: 400 }}>L</span>
    </div>
  )

  const ConvoGroup = ({ label, items }: { label: string; items: Convo[] }) => {
    if (!items.length) return null
    return (
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#8e8ea0', padding: '0 6px', marginBottom: 2, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{label}</p>
        {items.map(c => (
          <div key={c.id}
            onClick={() => { setModule('chat'); setActiveConvo(c.id); if (isMobile) setDrawerOpen(false) }}
            onMouseEnter={() => setHovered(c.id)} onMouseLeave={() => setHovered(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 8px', borderRadius: 8, cursor: 'pointer', background: activeConvo === c.id ? 'rgba(0,0,0,0.07)' : hovered === c.id ? 'rgba(0,0,0,0.04)' : 'transparent' }}>
            <span style={{ fontSize: 14, color: '#1a1a1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>{c.title}</span>
            {hovered === c.id && (
              <button onClick={e => deleteConvo(c.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', padding: 2, display: 'flex', flexShrink: 0 }}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  const SidebarContent = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px 6px' }}>
        <Wordmark size={isMobile ? 22 : 19} />
        {isMobile && (
          <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', padding: 6, display: 'flex' }}>
            <X size={20} />
          </button>
        )}
        {!isMobile && (
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', padding: 5, display: 'flex' }}>
            <PanelLeft size={17} />
          </button>
        )}
      </div>

      <div style={{ padding: '8px 12px 10px' }}>
        <button onClick={() => { setModule('chat'); setActiveConvo(null); if (isMobile) setDrawerOpen(false) }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          <Plus size={16} />New Chat
        </button>
      </div>

      <p style={{ fontSize: 10, fontWeight: 700, color: '#8e8ea0', letterSpacing: 0.8, padding: '2px 14px', marginBottom: 4 }}>MODULES</p>
      {MODULES.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => { setModule(id); setActiveConvo(null); if (isMobile) setDrawerOpen(false) }}
          style={{ width: 'calc(100% - 16px)', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: module === id && !activeConvo ? 'rgba(0,0,0,0.08)' : 'transparent', color: module === id && !activeConvo ? '#1a1a1a' : '#4a4a4a', fontSize: 15, fontWeight: module === id && !activeConvo ? 500 : 400, fontFamily: 'Inter, sans-serif', margin: '0 8px 2px', textAlign: 'left' }}
          onMouseEnter={e => { if (!(module === id && !activeConvo)) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)' }}
          onMouseLeave={e => { if (!(module === id && !activeConvo)) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
          <Icon size={17} style={{ color: module === id && !activeConvo ? '#1a1a1a' : '#8e8ea0' }} />
          {label}
        </button>
      ))}

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '8px 12px' }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 12px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#8e8ea0', letterSpacing: 0.8, padding: '0 3px', marginBottom: 8 }}>HISTORY</p>
        <ConvoGroup label="Today" items={grouped.today} />
        <ConvoGroup label="Yesterday" items={grouped.yesterday} />
        <ConvoGroup label="Previous 30 Days" items={grouped.thirty} />
        <ConvoGroup label="Older" items={grouped.older} />
        {convos.length === 0 && <p style={{ fontSize: 13, color: '#c0c0c0', padding: '0 6px', fontFamily: 'Inter, sans-serif' }}>No conversations yet</p>}
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: '10px 12px' }}>
        <div style={{ opacity: 0.4, display: 'flex', alignItems: 'center', gap: 7, padding: '5px 4px', marginBottom: 4 }}>
          <ExternalLink size={13} style={{ color: '#8e8ea0' }} />
          <span style={{ fontSize: 13, color: '#8e8ea0', fontFamily: 'Inter, sans-serif' }}>Microsoft 365 — Coming Soon</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1a1a1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || firstName}</p>
            <p style={{ fontSize: 12, color: '#8e8ea0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
          {user?.role === 'admin' && <a href="/admin" style={{ color: '#8e8ea0', display: 'flex' }}><Settings size={14} /></a>}
          <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', display: 'flex', padding: 4 }}><LogOut size={14} /></button>
        </div>
      </div>
    </>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f9f9f8', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>

      {/* Desktop sidebar */}
      {!isMobile && sidebarOpen && (
        <aside style={{ width: 260, flexShrink: 0, background: '#f9f9f8', borderRight: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }} />
          <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 300, background: '#f9f9f8', zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '4px 0 20px rgba(0,0,0,0.15)' }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'white' }}>

        {/* Top bar */}
        <header style={{ height: isMobile ? 52 : 46, background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', padding: isMobile ? '0 16px' : '0 16px', gap: 10, flexShrink: 0 }}>
          {isMobile ? (
            <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', display: 'flex', padding: 6 }}>
              <Menu size={22} />
            </button>
          ) : !sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8ea0', display: 'flex', padding: 4 }}>
              <PanelLeft size={17} />
            </button>
          )}

          {(!sidebarOpen || isMobile) && <Wordmark size={isMobile ? 16 : 16} />}

          {activeConvo && convos.find(c => c.id === activeConvo) && (
            <span style={{ fontSize: isMobile ? 13 : 13, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 160 : 400 }}>
              {convos.find(c => c.id === activeConvo)?.title}
            </span>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
            {!isMobile && <span style={{ fontSize: 11, color: '#c0c0c0', fontFamily: 'monospace' }}>claude-sonnet-4</span>}
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
          </div>
        </header>

        {/* Module content */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          {module === 'chat'     && <ChatInterface conversationId={activeConvo} onConversationUpdate={loadConvos} userName={firstName} isMobile={isMobile} />}
          {module === 'research' && <ResearchInterface userName={firstName} isMobile={isMobile} />}
          {module === 'images'   && <ImagesInterface userName={firstName} isMobile={isMobile} />}
          {module === 'code'     && <CodeInterface userName={firstName} isMobile={isMobile} />}
          {module === 'social'   && <SocialInterface userName={firstName} isMobile={isMobile} />}
        </main>

        {/* Mobile bottom tab bar */}
        {isMobile && (
          <nav style={{ height: 64, background: 'white', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {MODULES.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => { setModule(id); setActiveConvo(null) }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 10, color: module === id ? '#1a1a1a' : '#9ca3af', transition: 'color 0.15s', minWidth: 56 }}>
                <Icon size={22} style={{ color: module === id ? '#1a1a1a' : '#9ca3af' }} />
                <span style={{ fontSize: 10, fontWeight: module === id ? 600 : 400, fontFamily: 'Inter, sans-serif' }}>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}
