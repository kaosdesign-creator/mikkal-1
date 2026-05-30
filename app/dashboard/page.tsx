'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Search, Image, Code, FileText, Share2, Menu, X, LogOut, ChevronDown } from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import ResearchInterface from '@/components/research/ResearchInterface'
import ImagesInterface from '@/components/images/ImagesInterface'
import CodeInterface from '@/components/code/CodeInterface'
import DocumentsInterface from '@/components/documents/DocumentsInterface'
import SocialInterface from '@/components/social/SocialInterface'

const NAV = [
  { id: 'chat',     label: 'Chat',      icon: MessageSquare, live: true },
  { id: 'research', label: 'Research',  icon: Search,        live: true },
  { id: 'images',   label: 'Images',    icon: Image,         live: true },
  { id: 'code',     label: 'Code',      icon: Code,          live: true },
  { id: 'docs',     label: 'Documents', icon: FileText,      live: true },
  { id: 'social',   label: 'Social',    icon: Share2,        live: true },
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [active, setActive] = useState('chat')
  const [open, setOpen] = useState(true)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') return null

  const firstName = session?.user?.name?.split(' ')[0] || 'Friend'
  const initials = session?.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'M'

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <aside className={`${open ? 'w-60' : 'w-0'} flex-shrink-0 bg-white border-r border-gray-100 overflow-hidden flex flex-col transition-all duration-200`}>
        <div className="p-4 flex items-center gap-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <span className="font-bold text-white text-sm">M</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">Mikkal</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-left transition-all ${
                  isActive ? 'bg-cyan-50 text-cyan-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{firstName}</p>
              <p className="text-xs text-gray-400">Lifetime Access</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {userMenu && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl mt-1 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 bg-white border-b border-gray-100 flex items-center px-4 gap-3 flex-shrink-0">
          <button onClick={() => setOpen(!open)} className="text-gray-400 hover:text-gray-700 transition-colors">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {NAV.find(n => n.id === active)?.label}
          </span>
          <div className="ml-auto text-xs text-gray-300">claude-sonnet-4</div>
        </header>

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