'use client'
import { useState } from 'react'
import { MessageSquare, Search, Image, Code2, FileText, Share2, Menu, X, LogOut } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import ChatInterface from '@/components/chat/ChatInterface'
import ResearchInterface from '@/components/research/ResearchInterface'
import ImagesInterface from '@/components/images/ImagesInterface'
import CodeInterface from '@/components/code/CodeInterface'
import DocumentsInterface from '@/components/documents/DocumentsInterface'
import SocialInterface from '@/components/social/SocialInterface'

const NAV = [
  { id: 'chat',     label: 'Chat',      icon: MessageSquare, desc: 'Conversation & analysis' },
  { id: 'research', label: 'Research',  icon: Search,        desc: 'Web search & insights' },
  { id: 'images',   label: 'Images',    icon: Image,         desc: 'AI image generation' },
  { id: 'code',     label: 'Code',      icon: Code2,         desc: 'Write & review code' },
  { id: 'docs',     label: 'Documents', icon: FileText,      desc: 'Analyze files' },
  { id: 'social',   label: 'Social',    icon: Share2,        desc: 'Content creation' },
]

export default function DashboardPage() {
  const [active, setActive] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: session } = useSession()

  const firstName = session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0] || 'there'
  const initials = (session?.user?.name || session?.user?.email || 'M')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen bg-[#f5f4f1] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        } flex-shrink-0 transition-all duration-300 ease-in-out bg-white border-r border-gray-100 flex flex-col`}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {/* Raven icon placeholder — replace src with your actual logo path */}
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">M</span>
            </div>
            <span
              className="text-xl tracking-widest text-gray-900"
              style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900 }}
            >
              <span style={{ fontWeight: 400 }}>MI</span>
              <span style={{ fontWeight: 900, display: 'inline-block', transform: 'scaleX(-1)' }}>K</span>
              <span style={{ fontWeight: 900 }}>K</span>
              <span style={{ fontWeight: 400 }}>AL</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 tracking-widest" style={{ fontFamily: "'Bungee Hairline', sans-serif" }}>
            WISDOM · INSIGHT · INTELLIGENCE
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                active === id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={17} className={active === id ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-600'} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">{label}</p>
                <p className={`text-xs mt-0.5 leading-none truncate ${active === id ? 'text-gray-400' : 'text-gray-400'}`}>
                  {desc}
                </p>
              </div>
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{firstName}</p>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-300 hover:text-gray-600 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {NAV.find((n) => n.id === active)?.label}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-300 font-mono">claude-sonnet-4</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </header>

        {/* Module */}
        <main className="flex-1 overflow-hidden">
          {active === 'chat'     && <ChatInterface />}
          {active === 'research' && <ResearchInterface />}
          {active === 'images'   && <ImagesInterface />}
          {active === 'code'     && <CodeInterface />}
          {active === 'docs'     && <DocumentsInterface />}
          {active === 'social'   && <SocialInterface />}
        </main>
      </div>
    </div>
  )
}
