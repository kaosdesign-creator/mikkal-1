'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  MessageSquare, Search, Image, Code, FileText,
  Calendar, Share2, Menu, X, Zap, LogOut, ChevronDown
} from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import ImageGenerator from '@/components/images/ImageGenerator'

const NAV = [
  { id: 'chat',     label: 'Chat',        icon: MessageSquare, live: true  },
  { id: 'research', label: 'Research',    icon: Search,        live: false },
  { id: 'images',   label: 'Images',      icon: Image,         live: true  },
  { id: 'code',     label: 'Code',        icon: Code,          live: false },
  { id: 'docs',     label: 'Documents',   icon: FileText,      live: false },
  { id: 'schedule', label: 'Schedule',    icon: Calendar,      live: false },
  { id: 'social',   label: 'Social',      icon: Share2,        live: false },
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router  = useRouter()
  const [active, setActive]   = useState('chat')
  const [open,   setOpen]     = useState(true)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') return null

  const firstName = session?.user?.name?.split(' ')[0] || 'Friend'
  const initials  = session?.user?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'M'

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: open ? 240 : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-2.5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-white text-sm">M</span>
          </div>
          <span className="font-display font-bold text-lg text-gray-900">Mikkal</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {NAV.map(item => {
            const Icon  = item.icon
            const isAct = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => item.live && setActive(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left
                  ${isAct
                    ? 'bg-cyan-50 text-cyan-700 font-semibold'
                    : item.live
                      ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
              >
                <Icon size={16} className={isAct ? 'text-cyan-600' : ''} />
                <span className="flex-1">{item.label}</span>
                {isAct && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
                {!item.live && (
                  <span className="text-xs text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">Soon</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-white text-xs">{initials}</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-gray-900 text-sm font-medium truncate">{firstName}</p>
              <p className="text-gray-400 text-xs">Lifetime Access</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {userMenu && (
            <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 w-full px-4 py-3 text-red-600 text-sm hover:bg-red-50 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <Zap size={14} className="text-cyan-500" />
            <span className="text-gray-700 text-sm font-semibold">
              {NAV.find(n => n.id === active)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs hidden sm:block">claude-sonnet-4</span>
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          {active === 'chat'   && <ChatInterface />}
          {active === 'images' && <ImageGenerator />}
          {active !== 'chat' && active !== 'images' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  {(() => { const Icon = NAV.find(n => n.id === active)?.icon || Zap; return <Icon size={20} className="text-gray-400" /> })()}
                </div>
                <p className="text-gray-500 font-body">Coming soon</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
