'use client'
import { useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import {
  MessageSquare, Search, Image, Code, FileText,
  Calendar, Share2, Settings, Menu, X, Zap
} from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'

const NAV_ITEMS = [
  { id: 'chat',     label: 'Chat',        icon: MessageSquare, active: true  },
  { id: 'search',   label: 'Research',    icon: Search,        active: true  },
  { id: 'images',   label: 'Images',      icon: Image,         active: true  },
  { id: 'code',     label: 'Code',        icon: Code,          active: true  },
  { id: 'docs',     label: 'Documents',   icon: FileText,      active: true  },
  { id: 'calendar', label: 'Schedule',    icon: Calendar,      active: false },
  { id: 'social',   label: 'Social',      icon: Share2,        active: false },
]

export default function Dashboard() {
  const { user } = useUser()
  const [activeModule, setActiveModule] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const firstName = user?.firstName || user?.username || 'Friend'

  return (
    <div className="min-h-screen bg-brand-navy flex">

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex-shrink-0 bg-brand-surface border-r border-brand-border overflow-hidden flex flex-col"
      >
        <div className="p-5 flex items-center gap-3 border-b border-brand-border">
          <div className="w-8 h-8 rounded-lg bg-brand-charcoal border border-brand-border flex items-center justify-center flex-shrink-0">
            <span className="font-display font-800 text-sm text-brand-cyan">M</span>
          </div>
          <span className="font-display font-700 text-lg text-brand-white">Mikkal</span>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeModule === item.id
            return (
              <button
                key={item.id}
                onClick={() => item.active && setActiveModule(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-150 w-full text-left
                  ${isActive
                    ? 'bg-brand-cyan text-brand-navy font-600'
                    : item.active
                      ? 'text-brand-muted hover:text-brand-white hover:bg-brand-charcoal'
                      : 'text-brand-border cursor-not-allowed'
                  }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {!item.active && (
                  <span className="ml-auto text-xs text-brand-border">Soon</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-brand-border flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-brand-white text-sm font-body truncate">{firstName}</p>
            <p className="text-brand-muted text-xs">Lifetime Access</p>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-14 border-b border-brand-border flex items-center px-4 gap-4 bg-brand-surface flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-brand-muted hover:text-brand-white transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <Zap size={14} className="text-brand-cyan" />
            <span className="text-brand-white text-sm font-body font-500">
              {NAV_ITEMS.find(i => i.id === activeModule)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-brand-muted text-xs font-body hidden sm:block">
              claude-sonnet-4
            </span>
            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
          </div>
        </header>

        {/* Module content */}
        <main className="flex-1 overflow-hidden">
          {activeModule === 'chat' && <ChatInterface />}
          {activeModule === 'search' && (
            <div className="flex items-center justify-center h-full text-brand-muted font-body">
              Research module coming soon
            </div>
          )}
          {activeModule === 'images' && (
            <div className="flex items-center justify-center h-full text-brand-muted font-body">
              Image generation coming soon
            </div>
          )}
          {activeModule === 'code' && (
            <div className="flex items-center justify-center h-full text-brand-muted font-body">
              Code sandbox coming soon
            </div>
          )}
          {activeModule === 'docs' && (
            <div className="flex items-center justify-center h-full text-brand-muted font-body">
              Document builder coming soon
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
